// Package babiesiq provides the official Go SDK for the BabiesIQ API.
//
// # Quick Start
//
//	client, err := babiesiq.New("biq_your_api_key")
//	if err != nil {
//	    log.Fatal(err)
//	}
//
//	// Search a song by name — resolves video ID via YouTube, returns metadata + stream URL
//	song, err := client.Songs.Search(ctx, "Shape of You", nil)
//	fmt.Println(song.StreamURL)
//
//	// Download a song to disk (resolves ID, polls CDN until ready, saves file)
//	result, err := client.Songs.Download(ctx, "Shape of You", "/tmp/song.mp3", nil)
//	fmt.Println(result.FilePath) // "/tmp/song.mp3"
//
//	// Download a video to disk
//	result, err := client.Videos.Download(ctx, "Gangnam Style", "/tmp/video.mp4", nil)
//
//	// Smart YouTube search (no API key needed)
//	results, err := client.Search.Query(ctx, "Shape of You", 10)
//
//	// Autoplay suggestions
//	related, err := client.Suggestions.ForVideo(ctx, "dQw4w9WgXcQ", 10)
package babiesiq

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"time"
)

const (
	defaultBaseURL    = "https://api.babiesiq.tech"
	sdkVersion        = "2.1.0"
	defaultMaxRetries = 2
	defaultTimeout    = 30 * time.Second

	// defaultSongPollTimeout is the max time to wait for a song stream to become
	// ready on the CDN before giving up (mirrors Python SDK: 60 × 2 s = 120 s).
	defaultSongPollTimeout = 2 * time.Minute

	// defaultVideoPollTimeout is the max time to wait for a video stream to become
	// ready on the CDN before giving up (mirrors Python SDK: 90 × 2 s = 180 s).
	defaultVideoPollTimeout = 3 * time.Minute

	// pollInterval is the sleep between each CDN poll probe.
	pollInterval = 2 * time.Second
)

// Metadata contains SDK package information.
//
//	fmt.Println(babiesiq.Metadata.Version) // "2.1.0"
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
	// Timeout sets the HTTP client timeout for API calls (default: 30s).
	// This does NOT affect the download poll timeout — use SongDownloadOptions.Timeout
	// and VideoDownloadOptions.Timeout for that.
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

// ─── BabiesIQ API response type ───────────────────────────────────────────────

// biqAPIResponse is the flat JSON envelope returned by the BabiesIQ API.
// Example: {"query":"...","status":"processing","stream":"https://...","stream_id":"...","type":"audio"}
type biqAPIResponse struct {
	Query    string `json:"query"`
	Status   string `json:"status"`
	Stream   string `json:"stream"`    // CDN URL to stream or download the media
	StreamID string `json:"stream_id"` // internal CDN stream ID
	Type     string `json:"type"`      // "audio" or "video"
	Error    string `json:"error"`     // set on failure
}

// biqRequest calls a BabiesIQ API endpoint and parses the flat JSON response.
// The API key is passed as the ?api= query parameter.
func (c *Client) biqRequest(ctx context.Context, path string, params url.Values) (*biqAPIResponse, error) {
	u, err := url.Parse(c.baseURL + path)
	if err != nil {
		return nil, err
	}

	q := url.Values{"api": {c.apiKey}}
	for k, vs := range params {
		q[k] = vs
	}
	u.RawQuery = q.Encode()

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

		req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
		if err != nil {
			return nil, err
		}
		req.Header.Set("User-Agent", "biq-api-go/"+sdkVersion)

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
		case http.StatusBadRequest:
			var errEnv struct {
				Error string `json:"error"`
			}
			if json.Unmarshal(body, &errEnv) == nil && errEnv.Error != "" {
				return nil, &APIError{Message: errEnv.Error, Status: resp.StatusCode}
			}
			return nil, &APIError{Message: string(body), Status: resp.StatusCode}
		}
		if resp.StatusCode >= 500 {
			lastErr = &APIError{Message: string(body), Status: resp.StatusCode}
			continue
		}

		var result biqAPIResponse
		if err := json.Unmarshal(body, &result); err != nil {
			return nil, fmt.Errorf("failed to decode API response: %w", err)
		}
		if result.Error != "" {
			return nil, &APIError{Message: result.Error, Status: resp.StatusCode}
		}
		if result.Stream == "" {
			return nil, &APIError{Message: "API did not return a stream URL", Status: resp.StatusCode}
		}
		return &result, nil
	}
	return nil, lastErr
}

// ─── Video ID resolution ──────────────────────────────────────────────────────

// resolveVideoID converts any of the following into a YouTube video ID + full metadata:
//   - A raw 11-character YouTube video ID ("dQw4w9WgXcQ")
//   - Any YouTube URL (watch, youtu.be, shorts, embed, …)
//   - A plain text search query ("Shape of You Ed Sheeran")
//
// For text queries, it searches YouTube and picks the first result.
func (c *Client) resolveVideoID(ctx context.Context, query string) (videoID string, info *YTVideoInfo, err error) {
	if vid := extractVideoID(query); vid != "" {
		// Already a video ID or URL — fetch full details directly.
		info, err = c.ytGetVideo(ctx, vid)
		if err != nil {
			return "", nil, err
		}
		return vid, info, nil
	}

	// Text query: search YouTube and take the first result.
	results, err := c.ytSearch(ctx, query, 1)
	if err != nil {
		return "", nil, err
	}
	if len(results) == 0 {
		return "", nil, &NotFoundError{Message: "no YouTube results found for: " + query}
	}

	r := results[0]
	// Promote YTSearchResult → YTVideoInfo so callers get a uniform type.
	info = &YTVideoInfo{
		VideoID:     r.VideoID,
		Title:       r.Title,
		Description: r.Description,
		Duration:    r.Duration,
		DurationSec: r.DurationSec,
		URL:         r.URL,
		Thumbnail:   r.Thumbnail,
		Channel:     r.Channel,
		ViewCount:   r.ViewCount,
	}
	return r.VideoID, info, nil
}

// ─── BabiesIQ response types ──────────────────────────────────────────────────

// Song is returned by Songs.Search and embedded in SongDownloadResult.
// Metadata (Title, Artist, Duration, Thumbnail) comes from YouTube.
// StreamURL comes from the BabiesIQ CDN.
type Song struct {
	Title     string // Song / video title (from YouTube)
	Artist    string // Channel / artist name (from YouTube)
	StreamURL string // BabiesIQ CDN stream URL
	Duration  int    // Duration in seconds (from YouTube)
	Thumbnail string // Thumbnail URL (from YouTube)
	VideoID   string // YouTube video ID used for the lookup
}

// Video is returned by Videos.Search and embedded in VideoDownloadResult.
// Metadata (Title, Channel, Duration, Thumbnail) comes from YouTube.
// StreamURL comes from the BabiesIQ CDN.
type Video struct {
	Title     string // Video title (from YouTube)
	Channel   string // Channel name (from YouTube)
	StreamURL string // BabiesIQ CDN stream URL
	Quality   string // Requested quality, e.g. "720p" (empty = API default)
	Duration  int    // Duration in seconds (from YouTube)
	Thumbnail string // Thumbnail URL (from YouTube)
	VideoID   string // YouTube video ID used for the lookup
}

// ThumbnailResult is returned by Thumbnails.Get.
type ThumbnailResult struct {
	URL    string `json:"url"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

// SongOptions holds optional parameters for Songs.Search.
type SongOptions struct {
	EQ string // equalizer preset applied server-side, e.g. "bass_boost", "nightcore"
}

// VideoOptions holds optional parameters for Videos.Search.
type VideoOptions struct {
	Quality string // preferred video quality, e.g. "720p", "1080p"
}

// SongDownloadOptions holds optional parameters for Songs.Download.
type SongDownloadOptions struct {
	// EQ is an optional equalizer preset applied server-side (e.g. "bass_boost", "nightcore").
	EQ string
	// Timeout is the maximum time to wait for the CDN stream to become ready.
	// Defaults to 2 minutes when zero.
	Timeout time.Duration
}

// VideoDownloadOptions holds optional parameters for Videos.Download.
type VideoDownloadOptions struct {
	// Quality is the preferred video quality (e.g. "720p", "1080p").
	Quality string
	// Timeout is the maximum time to wait for the CDN stream to become ready.
	// Defaults to 3 minutes when zero.
	Timeout time.Duration
}

// SongDownloadResult is returned by Songs.Download.
// It carries the song metadata (same as Search) plus the local file path.
type SongDownloadResult struct {
	*Song
	// FilePath is the absolute path to the downloaded file on disk.
	FilePath string
}

// VideoDownloadResult is returned by Videos.Download.
// It carries the video metadata (same as Search) plus the local file path.
type VideoDownloadResult struct {
	*Video
	// FilePath is the absolute path to the downloaded file on disk.
	FilePath string
}

// ─── Songs service ────────────────────────────────────────────────────────────

// SongsService handles BabiesIQ song lookups.
type SongsService struct{ client *Client }

// Search finds the best matching song for the given query.
//
// query can be:
//   - A song/artist name: "Shape of You", "Ed Sheeran Blinding Lights"
//   - A YouTube video ID: "7PCkvCPvDXk"
//   - Any YouTube URL: "https://youtu.be/7PCkvCPvDXk"
//
// Internally this resolves the YouTube video ID first (via YouTube search or
// URL parsing), then calls the BabiesIQ API to obtain a CDN stream URL.
//
// Returns metadata + StreamURL. The CDN file may not be ready yet — use
// Download if you need the audio saved to disk with polling.
func (s *SongsService) Search(ctx context.Context, query string, opts *SongOptions) (*Song, error) {
	videoID, ytInfo, err := s.client.resolveVideoID(ctx, query)
	if err != nil {
		return nil, err
	}

	params := url.Values{"query": {videoID}}
	if opts != nil && opts.EQ != "" {
		params.Set("eq", opts.EQ)
	}

	apiResp, err := s.client.biqRequest(ctx, "/api/song", params)
	if err != nil {
		return nil, err
	}

	return &Song{
		Title:     ytInfo.Title,
		Artist:    ytInfo.Channel,
		StreamURL: apiResp.Stream,
		Duration:  ytInfo.DurationSec,
		Thumbnail: ytInfo.Thumbnail,
		VideoID:   videoID,
	}, nil
}

// Download resolves the video ID, calls the BabiesIQ API with download=true,
// polls the CDN stream URL every 2 s until it is ready (HTTP 200 / 206), then
// streams the audio file to destPath on disk.
//
// query can be a song name, YouTube video ID, or any YouTube URL.
// destPath is the full file path, e.g. "/tmp/song.mp3" or "downloads/track.mp3".
// Parent directories must already exist.
//
// Returns SongDownloadResult which embeds Song metadata and the resolved FilePath.
func (s *SongsService) Download(ctx context.Context, query, destPath string, opts *SongDownloadOptions) (*SongDownloadResult, error) {
	videoID, ytInfo, err := s.client.resolveVideoID(ctx, query)
	if err != nil {
		return nil, err
	}

	params := url.Values{
		"query":    {videoID},
		"download": {"true"},
	}
	pollTimeout := defaultSongPollTimeout
	if opts != nil {
		if opts.EQ != "" {
			params.Set("eq", opts.EQ)
		}
		if opts.Timeout > 0 {
			pollTimeout = opts.Timeout
		}
	}

	apiResp, err := s.client.biqRequest(ctx, "/api/song", params)
	if err != nil {
		return nil, err
	}

	if err := s.client.pollAndDownload(ctx, apiResp.Stream, destPath, pollTimeout); err != nil {
		return nil, err
	}

	song := &Song{
		Title:     ytInfo.Title,
		Artist:    ytInfo.Channel,
		StreamURL: apiResp.Stream,
		Duration:  ytInfo.DurationSec,
		Thumbnail: ytInfo.Thumbnail,
		VideoID:   videoID,
	}
	return &SongDownloadResult{Song: song, FilePath: destPath}, nil
}

// ─── Videos service ───────────────────────────────────────────────────────────

// VideosService handles BabiesIQ video lookups.
type VideosService struct{ client *Client }

// Search finds the best matching video for the given query.
//
// query can be:
//   - A video/channel name: "Gangnam Style", "Big Buck Bunny Blender"
//   - A YouTube video ID: "9bZkp7q19f0"
//   - Any YouTube URL: "https://youtu.be/9bZkp7q19f0"
//
// Internally this resolves the YouTube video ID first, then calls the BabiesIQ
// API to obtain a CDN stream URL.
//
// Returns metadata + StreamURL. Use Download if you need the file on disk.
func (s *VideosService) Search(ctx context.Context, query string, opts *VideoOptions) (*Video, error) {
	videoID, ytInfo, err := s.client.resolveVideoID(ctx, query)
	if err != nil {
		return nil, err
	}

	params := url.Values{"query": {videoID}}
	quality := ""
	if opts != nil && opts.Quality != "" {
		params.Set("quality", opts.Quality)
		quality = opts.Quality
	}

	apiResp, err := s.client.biqRequest(ctx, "/api/video", params)
	if err != nil {
		return nil, err
	}

	return &Video{
		Title:     ytInfo.Title,
		Channel:   ytInfo.Channel,
		StreamURL: apiResp.Stream,
		Quality:   quality,
		Duration:  ytInfo.DurationSec,
		Thumbnail: ytInfo.Thumbnail,
		VideoID:   videoID,
	}, nil
}

// Download resolves the video ID, calls the BabiesIQ API with download=true,
// polls the CDN stream URL every 2 s until it is ready (HTTP 200 / 206), then
// streams the video file to destPath on disk.
//
// query can be a video name, YouTube video ID, or any YouTube URL.
// destPath is the full file path, e.g. "/tmp/video.mp4".
// Parent directories must already exist.
//
// Returns VideoDownloadResult which embeds Video metadata and the resolved FilePath.
func (s *VideosService) Download(ctx context.Context, query, destPath string, opts *VideoDownloadOptions) (*VideoDownloadResult, error) {
	videoID, ytInfo, err := s.client.resolveVideoID(ctx, query)
	if err != nil {
		return nil, err
	}

	params := url.Values{
		"query":    {videoID},
		"download": {"true"},
	}
	quality := ""
	pollTimeout := defaultVideoPollTimeout
	if opts != nil {
		if opts.Quality != "" {
			params.Set("quality", opts.Quality)
			quality = opts.Quality
		}
		if opts.Timeout > 0 {
			pollTimeout = opts.Timeout
		}
	}

	apiResp, err := s.client.biqRequest(ctx, "/api/video", params)
	if err != nil {
		return nil, err
	}

	if err := s.client.pollAndDownload(ctx, apiResp.Stream, destPath, pollTimeout); err != nil {
		return nil, err
	}

	video := &Video{
		Title:     ytInfo.Title,
		Channel:   ytInfo.Channel,
		StreamURL: apiResp.Stream,
		Quality:   quality,
		Duration:  ytInfo.DurationSec,
		Thumbnail: ytInfo.Thumbnail,
		VideoID:   videoID,
	}
	return &VideoDownloadResult{Video: video, FilePath: destPath}, nil
}

// ─── Thumbnails service ───────────────────────────────────────────────────────

// ThumbnailsService handles YouTube thumbnail retrieval via the BabiesIQ API.
type ThumbnailsService struct{ client *Client }

// Get retrieves a styled YouTube thumbnail for the given video ID via the BabiesIQ API.
// Pass an empty string for design to use the default style.
func (s *ThumbnailsService) Get(ctx context.Context, videoID string, design string) (*ThumbnailResult, error) {
	u, err := url.Parse(s.client.baseURL + "/api/thumbnail")
	if err != nil {
		return nil, err
	}
	q := url.Values{"v": {videoID}, "api": {s.client.apiKey}}
	if design != "" {
		q.Set("design", design)
	}
	u.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "biq-api-go/"+sdkVersion)

	resp, err := s.client.httpClient.Do(req)
	if err != nil {
		return nil, &NetworkError{Err: err}
	}
	body, err := io.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil {
		return nil, &NetworkError{Err: err}
	}

	var result ThumbnailResult
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to decode thumbnail response: %w", err)
	}
	return &result, nil
}

// ─── Polling + download helpers ───────────────────────────────────────────────

// pollAndDownload polls streamURL every 2 s until the CDN signals the file is
// ready (HTTP 200 or 206), then downloads it to destPath.
//
// Status semantics (mirrors the Python SDK):
//   - 200, 206      → ready; download immediately
//   - 204, 423, 404, 410 → not ready yet; wait and retry
//   - 401, 403      → blocked → AuthError
//   - 429           → rate-limited → RateLimitError
//   - anything else → fatal → APIError
func (c *Client) pollAndDownload(ctx context.Context, streamURL, destPath string, pollTimeout time.Duration) error {
	// Short timeout per polling probe so we don't hang on a single request.
	pollClient := &http.Client{Timeout: 15 * time.Second}

	deadline := time.Now().Add(pollTimeout)

	for {
		if time.Now().After(deadline) {
			return &DownloadTimeoutError{StreamURL: streamURL, Timeout: pollTimeout}
		}

		req, err := http.NewRequestWithContext(ctx, http.MethodGet, streamURL, nil)
		if err != nil {
			return err
		}
		req.Header.Set("User-Agent", "biq-api-go/"+sdkVersion)

		resp, err := pollClient.Do(req)
		if err != nil {
			// Transient network error — keep polling.
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(pollInterval):
			}
			continue
		}
		status := resp.StatusCode
		resp.Body.Close()

		switch {
		case status == http.StatusOK || status == http.StatusPartialContent:
			// CDN is ready — stream file to disk.
			return c.downloadToFile(ctx, streamURL, destPath)

		case status == http.StatusNoContent || status == 423 ||
			status == http.StatusNotFound || status == http.StatusGone:
			// Not ready yet; wait and retry.
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(pollInterval):
			}

		case status == http.StatusUnauthorized || status == http.StatusForbidden:
			return &AuthError{Message: fmt.Sprintf("stream access blocked (HTTP %d) — check your API key or region", status)}

		case status == http.StatusTooManyRequests:
			return &RateLimitError{Message: "rate limited while polling CDN stream"}

		default:
			return &APIError{Message: "unexpected status while polling CDN stream", Status: status}
		}
	}
}

// downloadToFile streams the content at streamURL into the file at destPath.
// Uses a generous 10-minute timeout to handle large video files.
func (c *Client) downloadToFile(ctx context.Context, streamURL, destPath string) error {
	dlClient := &http.Client{Timeout: 10 * time.Minute}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, streamURL, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "biq-api-go/"+sdkVersion)

	resp, err := dlClient.Do(req)
	if err != nil {
		return &NetworkError{Err: err}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusPartialContent {
		return &APIError{Message: "unexpected status during file download", Status: resp.StatusCode}
	}

	f, err := os.Create(destPath)
	if err != nil {
		return fmt.Errorf("failed to create destination file %q: %w", destPath, err)
	}
	defer f.Close()

	if _, err := io.Copy(f, resp.Body); err != nil {
		_ = os.Remove(destPath) // remove incomplete file on error
		return &NetworkError{Err: fmt.Errorf("download interrupted: %w", err)}
	}
	return nil
}

// ─── Error types ──────────────────────────────────────────────────────────────

// AuthError is returned when the API key is missing, invalid, or the stream is geo-blocked.
type AuthError struct{ Message string }

func (e *AuthError) Error() string { return e.Message }

// RateLimitError is returned when the API or CDN rate limit is exceeded.
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

// DownloadTimeoutError is returned when the CDN stream does not become ready
// within the allowed poll window.
type DownloadTimeoutError struct {
	StreamURL string
	Timeout   time.Duration
}

func (e *DownloadTimeoutError) Error() string {
	return fmt.Sprintf("stream not ready after %s — CDN may still be processing: %s", e.Timeout, e.StreamURL)
}
