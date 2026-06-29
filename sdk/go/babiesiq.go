// Package babiesiq provides the official Go SDK for the BabiesIQ API.
//
// Usage:
//
//	client, err := babiesiq.New("biq_your_api_key")
//	if err != nil {
//	    log.Fatal(err)
//	}
//
//	song, err := client.Songs.Search(ctx, "Shape of You", nil)
//	if err != nil {
//	    log.Fatal(err)
//	}
//	fmt.Println(song.StreamURL)
package babiesiq

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

const (
	defaultBaseURL    = "https://api.babiesiq.tech"
	sdkVersion        = "2.0.0"
	defaultMaxRetries = 2
	defaultTimeout    = 30 * time.Second
)

// Client is the BabiesIQ API client.
type Client struct {
	apiKey     string
	baseURL    string
	maxRetries int
	httpClient *http.Client

	Songs      *SongsService
	Videos     *VideosService
	Search     *SearchService
	Thumbnails *ThumbnailsService
}

// Config holds optional client configuration.
type Config struct {
	BaseURL    string
	MaxRetries int
	Timeout    time.Duration
}

// New creates a new BabiesIQ API client.
func New(apiKey string, cfgs ...Config) (*Client, error) {
	if apiKey == "" {
		return nil, &AuthError{Message: "apiKey is required"}
	}

	cfg := Config{
		BaseURL:    defaultBaseURL,
		MaxRetries: defaultMaxRetries,
		Timeout:    defaultTimeout,
	}
	if len(cfgs) > 0 {
		if cfgs[0].BaseURL != "" {
			cfg.BaseURL = cfgs[0].BaseURL
		}
		if cfgs[0].MaxRetries > 0 {
			cfg.MaxRetries = cfgs[0].MaxRetries
		}
		if cfgs[0].Timeout > 0 {
			cfg.Timeout = cfgs[0].Timeout
		}
	}

	c := &Client{
		apiKey:     apiKey,
		baseURL:    cfg.BaseURL,
		maxRetries: cfg.MaxRetries,
		httpClient: &http.Client{Timeout: cfg.Timeout},
	}
	c.Songs = &SongsService{client: c}
	c.Videos = &VideosService{client: c}
	c.Search = &SearchService{client: c}
	c.Thumbnails = &ThumbnailsService{client: c}

	return c, nil
}

type apiResponse struct {
	Success bool            `json:"success"`
	Data    json.RawMessage `json:"data"`
	Error   *string         `json:"error"`
}

// request performs an HTTP call with automatic retry on transient failures.
// The bodyBytes slice is re-used across retries, avoiding consumed-reader issues.
func (c *Client) request(ctx context.Context, method, path string, params url.Values, bodyBytes []byte) (json.RawMessage, error) {
	u, err := url.Parse(c.baseURL + path)
	if err != nil {
		return nil, err
	}
	if params != nil {
		u.RawQuery = params.Encode()
	}

	var lastErr error
	for attempt := 0; attempt <= c.maxRetries; attempt++ {
		if attempt > 0 {
			delay := time.Duration(500*attempt) * time.Millisecond
			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(delay):
			}
		}

		// Rebuild reader from bytes each attempt — avoids consumed-reader bug.
		var bodyReader io.Reader
		if len(bodyBytes) > 0 {
			bodyReader = bytes.NewReader(bodyBytes)
		}

		req, err := http.NewRequestWithContext(ctx, method, u.String(), bodyReader)
		if err != nil {
			return nil, err
		}
		req.Header.Set("X-API-Key", c.apiKey)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("User-Agent", "babiesiq-go/"+sdkVersion)

		resp, err := c.httpClient.Do(req)
		if err != nil {
			lastErr = &NetworkError{Err: err}
			continue
		}

		respBody, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		switch resp.StatusCode {
		case http.StatusUnauthorized:
			return nil, &AuthError{Message: "invalid or missing API key"}
		case http.StatusNotFound:
			return nil, &NotFoundError{Message: "resource not found"}
		case http.StatusTooManyRequests:
			return nil, &RateLimitError{Message: "rate limit exceeded"}
		}

		if resp.StatusCode >= 500 {
			lastErr = fmt.Errorf("server error: HTTP %d", resp.StatusCode)
			continue
		}

		var parsed apiResponse
		if err := json.Unmarshal(respBody, &parsed); err != nil {
			return nil, fmt.Errorf("invalid response (HTTP %d): %w", resp.StatusCode, err)
		}
		if !parsed.Success {
			msg := "unknown error"
			if parsed.Error != nil {
				msg = *parsed.Error
			}
			return nil, &APIError{Message: msg, Status: resp.StatusCode}
		}
		return parsed.Data, nil
	}
	if lastErr != nil {
		return nil, lastErr
	}
	return nil, fmt.Errorf("request failed after %d retries", c.maxRetries)
}

// requestJSON marshals body to JSON bytes then calls request.
func (c *Client) requestJSON(ctx context.Context, method, path string, params url.Values, body interface{}) (json.RawMessage, error) {
	var bodyBytes []byte
	if body != nil {
		var err error
		bodyBytes, err = json.Marshal(body)
		if err != nil {
			return nil, err
		}
	}
	return c.request(ctx, method, path, params, bodyBytes)
}

// ─── Models ───────────────────────────────────────────────────────────────────

type SongResult struct {
	ID        string  `json:"id"`
	Title     string  `json:"title"`
	StreamURL string  `json:"stream_url"`
	Artist    *string `json:"artist"`
	Duration  *int    `json:"duration"`
	Thumbnail *string `json:"thumbnail"`
}

type VideoResult struct {
	ID        string  `json:"id"`
	Title     string  `json:"title"`
	StreamURL string  `json:"stream_url"`
	Channel   *string `json:"channel"`
	Duration  *int    `json:"duration"`
	Thumbnail *string `json:"thumbnail"`
	Quality   *string `json:"quality"`
}

type SearchResult struct {
	Type            string  `json:"type"`
	ID              string  `json:"id"`
	Title           string  `json:"title"`
	ArtistOrChannel *string `json:"artist_or_channel"`
	Thumbnail       *string `json:"thumbnail"`
	Duration        *int    `json:"duration"`
}

type ThumbnailResult struct {
	VideoID string  `json:"video_id"`
	URL     string  `json:"url"`
	Design  *string `json:"design"`
}

// ─── Song options ─────────────────────────────────────────────────────────────

type SongOptions struct {
	Download bool
	EQ       string
}

type VideoOptions struct {
	Download bool
}

// ─── Services ─────────────────────────────────────────────────────────────────

type SongsService struct{ client *Client }

// Search finds a song and returns its streaming URL.
func (s *SongsService) Search(ctx context.Context, query string, opts *SongOptions) (*SongResult, error) {
	params := url.Values{"q": {query}}
	if opts != nil {
		if opts.Download {
			params.Set("download", "1")
		}
		if opts.EQ != "" {
			params.Set("eq", opts.EQ)
		}
	}
	data, err := s.client.request(ctx, http.MethodGet, "/api/song", params, nil)
	if err != nil {
		return nil, err
	}
	var result SongResult
	return &result, json.Unmarshal(data, &result)
}

type VideosService struct{ client *Client }

// Search finds a video and returns its streaming URL.
func (s *VideosService) Search(ctx context.Context, query string, opts *VideoOptions) (*VideoResult, error) {
	params := url.Values{"q": {query}}
	if opts != nil && opts.Download {
		params.Set("download", "1")
	}
	data, err := s.client.request(ctx, http.MethodGet, "/api/video", params, nil)
	if err != nil {
		return nil, err
	}
	var result VideoResult
	return &result, json.Unmarshal(data, &result)
}

type SearchService struct{ client *Client }

// Query searches across songs and videos.
func (s *SearchService) Query(ctx context.Context, q string) ([]SearchResult, error) {
	data, err := s.client.requestJSON(ctx, http.MethodPost, "/api/search", nil, map[string]string{"q": q})
	if err != nil {
		return nil, err
	}
	var results []SearchResult
	return results, json.Unmarshal(data, &results)
}

type ThumbnailsService struct{ client *Client }

// Get retrieves a YouTube thumbnail for the given video ID.
func (s *ThumbnailsService) Get(ctx context.Context, videoID string, design string) (*ThumbnailResult, error) {
	params := url.Values{"v": {videoID}}
	if design != "" {
		params.Set("design", design)
	}
	data, err := s.client.request(ctx, http.MethodGet, "/api/thumbnail", params, nil)
	if err != nil {
		return nil, err
	}
	var result ThumbnailResult
	return &result, json.Unmarshal(data, &result)
}

// ─── Errors ───────────────────────────────────────────────────────────────────

type AuthError struct{ Message string }

func (e *AuthError) Error() string { return e.Message }

type RateLimitError struct{ Message string }

func (e *RateLimitError) Error() string { return e.Message }

type NotFoundError struct{ Message string }

func (e *NotFoundError) Error() string { return e.Message }

type APIError struct {
	Message string
	Status  int
}

func (e *APIError) Error() string { return fmt.Sprintf("API error %d: %s", e.Status, e.Message) }

type NetworkError struct{ Err error }

func (e *NetworkError) Error() string { return fmt.Sprintf("network error: %v", e.Err) }
func (e *NetworkError) Unwrap() error { return e.Err }
