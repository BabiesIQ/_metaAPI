// Package babiesiq provides the official Go SDK for the BabiesIQ API.
//
// # Quick Start
//
//	client, err := babiesiq.New("biq_your_api_key")
//	if err != nil {
//	    log.Fatal(err)
//	}
//
//	// Search a song (BabiesIQ API)
//	song, err := client.Songs.Search(ctx, "Shape of You", nil)
//
//	// Smart YouTube search
//	results, err := client.Search.Query(ctx, "Shape of You", 10)
//
//	// Autoplay suggestions for a video
//	related, err := client.Suggestions.ForVideo(ctx, "dQw4w9WgXcQ", 10)
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

// Metadata contains SDK package information.
//
//	fmt.Println(babiesiq.Metadata.Version) // "2.0.0"
var Metadata = struct {
	Name     string
	Version  string
	Author   string
	Homepage string
	Docs     string
	Source   string
	Language string
}{
	Name:     "biq-api",
	Version:  sdkVersion,
	Author:   "BabiesIQ Team",
	Homepage: "https://babiesiq.tech",
	Docs:     "https://babiesiq.tech/docs",
	Source:   "https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/go",
	Language: "go",
}

// ─── Client ───────────────────────────────────────────────────────────────────

// Client is the BabiesIQ API client.
// Create one with New() and reuse it across requests.
type Client struct {
	apiKey     string
	baseURL    string
	maxRetries int
	httpClient *http.Client

	// BabiesIQ API services
	Songs      *SongsService
	Videos     *VideosService
	Thumbnails *ThumbnailsService

	// YouTube direct services (no API key required)
	Search      *SearchService
	Suggestions *SuggestionsService
}

// Config holds optional client configuration.
type Config struct {
	// BaseURL overrides the BabiesIQ API base URL (default: https://api.babiesiq.tech).
	BaseURL string
	// MaxRetries sets the number of retries on transient 5xx errors (default: 2).
	MaxRetries int
	// Timeout sets the HTTP client timeout (default: 30s).
	Timeout time.Duration
}

// New creates a new BabiesIQ API client.
// apiKey must be a valid BabiesIQ API key (obtain from https://babiesiq.tech/panel/api-keys).
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
	c.Thumbnails = &ThumbnailsService{client: c}
	c.Search = &SearchService{client: c}
	c.Suggestions = &SuggestionsService{client: c}
	return c, nil
}

// ─── BabiesIQ API HTTP helpers ────────────────────────────────────────────────

type apiResponse struct {
	Success bool            `json:"success"`
	Data    json.RawMessage `json:"data"`
	Error   *string         `json:"error"`
}

// request performs an authenticated BabiesIQ API call with automatic retry on transient 5xx errors.
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

		var bodyReader io.Reader
		if len(bodyBytes) > 0 {
			bodyReader = bytes.NewReader(bodyBytes)
		}

		req, err := http.NewRequestWithContext(ctx, method, u.String(), bodyReader)
		if err != nil {
			return nil, err
		}
		req.Header.Set("X-API-Key", c.apiKey)
		req.Header.Set("User-Agent", "biq-api-go/"+sdkVersion)
		if len(bodyBytes) > 0 {
			req.Header.Set("Content-Type", "application/json")
		}

		resp, err := c.httpClient.Do(req)
		if err != nil {
			lastErr = &NetworkError{Err: err}
			continue
		}
		body, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			lastErr = &NetworkError{Err: err}
			continue
		}

		switch resp.StatusCode {
		case http.StatusUnauthorized, http.StatusForbidden:
			return nil, &AuthError{Message: "invalid or missing API key"}
		case http.StatusTooManyRequests:
			return nil, &RateLimitError{Message: "rate limit exceeded"}
		case http.StatusNotFound:
			return nil, &NotFoundError{Message: "resource not found"}
		}
		if resp.StatusCode >= 500 {
			lastErr = &APIError{Message: string(body), Status: resp.StatusCode}
			continue
		}
		if resp.StatusCode >= 400 {
			var ar apiResponse
			if json.Unmarshal(body, &ar) == nil && ar.Error != nil {
				return nil, &APIError{Message: *ar.Error, Status: resp.StatusCode}
			}
			return nil, &APIError{Message: string(body), Status: resp.StatusCode}
		}

		var ar apiResponse
		if err := json.Unmarshal(body, &ar); err != nil {
			return nil, fmt.Errorf("failed to decode response: %w", err)
		}
		if !ar.Success {
			msg := "unknown error"
			if ar.Error != nil {
				msg = *ar.Error
			}
			return nil, &APIError{Message: msg, Status: resp.StatusCode}
		}
		return ar.Data, nil
	}
	return nil, lastErr
}

// requestJSON marshals body to JSON then calls request.
func (c *Client) requestJSON(ctx context.Context, method, path string, params url.Values, body any) (json.RawMessage, error) {
	var bodyBytes []byte
	if body != nil {
		var err error
		bodyBytes, err = json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
	}
	return c.request(ctx, method, path, params, bodyBytes)
}

// ─── BabiesIQ response types ──────────────────────────────────────────────────

// Song is returned by Songs.Search.
type Song struct {
	Title     string `json:"title"`
	Artist    string `json:"artist"`
	StreamURL string `json:"stream_url"`
	Duration  int    `json:"duration"`
	Thumbnail string `json:"thumbnail"`
}

// Video is returned by Videos.Search.
type Video struct {
	Title     string `json:"title"`
	Channel   string `json:"channel"`
	StreamURL string `json:"stream_url"`
	Quality   string `json:"quality"`
	Duration  int    `json:"duration"`
	Thumbnail string `json:"thumbnail"`
}

// ThumbnailResult is returned by Thumbnails.Get.
type ThumbnailResult struct {
	URL    string `json:"url"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

// SongOptions holds optional parameters for Songs.Search.
type SongOptions struct {
	EQ       string // equalizer preset, e.g. "bass_boost", "nightcore"
	Download bool   // request a direct download URL
}

// VideoOptions holds optional parameters for Videos.Search.
type VideoOptions struct {
	Quality string // e.g. "720p", "1080p"
}

// ─── Songs service ────────────────────────────────────────────────────────────

// SongsService handles BabiesIQ song lookups.
type SongsService struct{ client *Client }

// Search finds the best matching song for the given query via the BabiesIQ API.
func (s *SongsService) Search(ctx context.Context, query string, opts *SongOptions) (*Song, error) {
	params := url.Values{"q": {query}}
	if opts != nil {
		if opts.EQ != "" {
			params.Set("eq", opts.EQ)
		}
		if opts.Download {
			params.Set("download", "true")
		}
	}
	data, err := s.client.request(ctx, http.MethodGet, "/api/song", params, nil)
	if err != nil {
		return nil, err
	}
	var result Song
	return &result, json.Unmarshal(data, &result)
}

// ─── Videos service ───────────────────────────────────────────────────────────

// VideosService handles BabiesIQ video lookups.
type VideosService struct{ client *Client }

// Search finds the best matching video for the given query via the BabiesIQ API.
func (s *VideosService) Search(ctx context.Context, query string, opts *VideoOptions) (*Video, error) {
	params := url.Values{"q": {query}}
	if opts != nil && opts.Quality != "" {
		params.Set("quality", opts.Quality)
	}
	data, err := s.client.request(ctx, http.MethodGet, "/api/video", params, nil)
	if err != nil {
		return nil, err
	}
	var result Video
	return &result, json.Unmarshal(data, &result)
}

// ─── Thumbnails service ───────────────────────────────────────────────────────

// ThumbnailsService handles YouTube thumbnail retrieval via the BabiesIQ API.
type ThumbnailsService struct{ client *Client }

// Get retrieves a YouTube thumbnail for the given video ID.
// Pass an empty string for design to use the default style.
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

// ─── Error types ──────────────────────────────────────────────────────────────

// AuthError is returned when the API key is missing or invalid.
type AuthError struct{ Message string }

func (e *AuthError) Error() string { return e.Message }

// RateLimitError is returned when the API rate limit is exceeded.
type RateLimitError struct{ Message string }

func (e *RateLimitError) Error() string { return e.Message }

// NotFoundError is returned when the requested resource is not found.
type NotFoundError struct{ Message string }

func (e *NotFoundError) Error() string { return e.Message }

// APIError is returned for non-2xx responses not covered by the above types.
type APIError struct {
	Message string
	Status  int
}

func (e *APIError) Error() string { return fmt.Sprintf("API error %d: %s", e.Status, e.Message) }

// NetworkError wraps a transport-level error.
type NetworkError struct{ Err error }

func (e *NetworkError) Error() string { return fmt.Sprintf("network error: %v", e.Err) }
func (e *NetworkError) Unwrap() error { return e.Err }
