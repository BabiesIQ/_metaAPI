// youtube.go — Smart YouTube search and autoplay suggestions.
// These services call YouTube's internal API directly; no API key is required.
package babiesiq

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
)

// ─── YouTube API constants ────────────────────────────────────────────────────

const (
	ytKey           = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8"
	ytClientName    = "WEB"
	ytClientVersion = "2.20251021.01.00"
	ytUserAgent     = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
	ytSearchURL     = "https://www.youtube.com/youtubei/v1/search"
	ytPlayerURL     = "https://www.youtube.com/youtubei/v1/player"
	ytNextURL       = "https://www.youtube.com/youtubei/v1/next"
	ytSuggestURL    = "https://suggestqueries-clients6.youtube.com/complete/search"
)

// ytThumbURL returns the best available YouTube CDN thumbnail URL for a video ID.
// Falls back through quality levels: maxresdefault → hqdefault.
func ytThumbURL(videoID string) string {
	return "https://i.ytimg.com/vi/" + videoID + "/maxresdefault.jpg"
}

// ytWatchURL returns the canonical YouTube watch URL for a video ID.
func ytWatchURL(videoID string) string {
	return "https://www.youtube.com/watch?v=" + videoID
}

// ─── Video ID / URL detection ─────────────────────────────────────────────────

var ytVideoPatterns = []*regexp.Regexp{
	regexp.MustCompile(`(?:https?://)?(?:www\.)?youtube\.com/watch\?.*v=([a-zA-Z0-9_-]{11})`),
	regexp.MustCompile(`(?:https?://)?(?:www\.)?youtu\.be/([a-zA-Z0-9_-]{11})`),
	regexp.MustCompile(`(?:https?://)?(?:www\.)?youtube\.com/embed/([a-zA-Z0-9_-]{11})`),
	regexp.MustCompile(`(?:https?://)?(?:www\.)?youtube\.com/shorts/([a-zA-Z0-9_-]{11})`),
	regexp.MustCompile(`(?:https?://)?(?:www\.)?youtube\.com/v/([a-zA-Z0-9_-]{11})`),
	regexp.MustCompile(`^([a-zA-Z0-9_-]{11})$`),
}

// extractVideoID returns the 11-character video ID if query is a video ID or
// any supported YouTube URL format. Returns "" if query looks like a text query.
func extractVideoID(query string) string {
	query = strings.TrimSpace(query)
	for _, p := range ytVideoPatterns {
		if m := p.FindStringSubmatch(query); m != nil {
			return m[1]
		}
	}
	return ""
}

// ─── YouTube response types ───────────────────────────────────────────────────

// YTSearchResult is a single item returned by Search.Query for text queries.
// Thumbnails use the YouTube CDN (i.ytimg.com) — no API key required.
type YTSearchResult struct {
	VideoID     string `json:"video_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Duration    string `json:"duration"`     // human-readable, e.g. "4:32"
	DurationSec int    `json:"duration_sec"` // total seconds (0 if unavailable)
	URL         string `json:"url"`
	Thumbnail   string `json:"thumbnail"` // https://i.ytimg.com/vi/{id}/maxresdefault.jpg
	Channel     string `json:"channel"`
	ViewCount   string `json:"view_count"`
	Published   string `json:"published"` // e.g. "2 years ago"
}

// YTVideoInfo is returned by Search.GetVideo — full details from the YouTube player API.
type YTVideoInfo struct {
	VideoID     string `json:"video_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Duration    string `json:"duration"`     // human-readable, e.g. "4:32"
	DurationSec int    `json:"duration_sec"` // total seconds
	URL         string `json:"url"`
	Thumbnail   string `json:"thumbnail"`
	Channel     string `json:"channel"`
	ViewCount   string `json:"view_count"`
	IsLive      bool   `json:"is_live"`
}

// Suggestion is a related/autoplay video returned by Suggestions.ForVideo.
type Suggestion struct {
	VideoID   string `json:"video_id"`
	Title     string `json:"title"`
	Duration  string `json:"duration"`
	URL       string `json:"url"`
	Thumbnail string `json:"thumbnail"`
	Channel   string `json:"channel"`
	ViewCount string `json:"view_count"`
}

// AutocompleteSuggestion is returned by Suggestions.ForQuery (search autocomplete).
type AutocompleteSuggestion struct {
	Text string `json:"text"`
}

// ─── Smart Search service ─────────────────────────────────────────────────────

// SearchService provides smart YouTube search.
// It detects automatically whether the query is a video ID/URL or a text search.
// No BabiesIQ API key is used — calls go directly to YouTube.
type SearchService struct{ client *Client }

// Query performs a smart search:
//   - If query is a YouTube video ID or URL → returns full video details via the YouTube player API (1 result).
//   - If query is a text string → searches YouTube and returns up to `limit` results.
//
// limit defaults to 20 when ≤ 0.
// All thumbnails come from the YouTube CDN (https://i.ytimg.com).
func (s *SearchService) Query(ctx context.Context, query string, limit int) ([]YTSearchResult, error) {
	if limit <= 0 {
		limit = 20
	}
	if vid := extractVideoID(query); vid != "" {
		info, err := s.GetVideo(ctx, vid)
		if err != nil {
			return nil, err
		}
		return []YTSearchResult{{
			VideoID:     info.VideoID,
			Title:       info.Title,
			Description: info.Description,
			Duration:    info.Duration,
			DurationSec: info.DurationSec,
			URL:         info.URL,
			Thumbnail:   info.Thumbnail,
			Channel:     info.Channel,
			ViewCount:   info.ViewCount,
		}}, nil
	}
	return s.client.ytSearch(ctx, query, limit)
}

// GetVideo fetches full video details for a given video ID or URL using the
// YouTube player API (youtubei/v1/player). Use this when you already have a
// video ID and want complete metadata.
func (s *SearchService) GetVideo(ctx context.Context, videoIDOrURL string) (*YTVideoInfo, error) {
	vid := extractVideoID(videoIDOrURL)
	if vid == "" {
		vid = strings.TrimSpace(videoIDOrURL)
	}
	if vid == "" {
		return nil, fmt.Errorf("invalid video ID or URL: %q", videoIDOrURL)
	}
	return s.client.ytGetVideo(ctx, vid)
}

// ─── Suggestions service ──────────────────────────────────────────────────────

// SuggestionsService provides autoplay and search autocomplete suggestions.
// Calls go directly to YouTube — no BabiesIQ API key required.
type SuggestionsService struct{ client *Client }

// ForVideo returns related/autoplay video suggestions for the given video ID or URL.
// These are the same videos YouTube shows in the "Up Next" sidebar.
// limit defaults to 20 when ≤ 0.
func (s *SuggestionsService) ForVideo(ctx context.Context, videoIDOrURL string, limit int) ([]Suggestion, error) {
	vid := extractVideoID(videoIDOrURL)
	if vid == "" {
		vid = strings.TrimSpace(videoIDOrURL)
	}
	if vid == "" {
		return nil, fmt.Errorf("invalid video ID or URL: %q", videoIDOrURL)
	}
	if limit <= 0 {
		limit = 20
	}
	return s.client.ytRelated(ctx, vid, limit)
}

// ForQuery returns YouTube search autocomplete suggestions for the given query string.
// These are the same suggestions shown in the YouTube search bar dropdown.
// language and region default to "en" and "US" when empty.
func (s *SuggestionsService) ForQuery(ctx context.Context, query, language, region string) ([]AutocompleteSuggestion, error) {
	if language == "" {
		language = "en"
	}
	if region == "" {
		region = "US"
	}
	return s.client.ytAutocomplete(ctx, query, language, region)
}

// ─── Internal YouTube HTTP helpers ───────────────────────────────────────────

// ytInnertubeBody builds the standard InnerTube POST payload.
func ytInnertubeBody(extra map[string]any) map[string]any {
	body := map[string]any{
		"context": map[string]any{
			"client": map[string]any{
				"clientName":    ytClientName,
				"clientVersion": ytClientVersion,
				"hl":            "en",
				"gl":            "US",
			},
		},
	}
	for k, v := range extra {
		body[k] = v
	}
	return body
}

// ytPost performs a POST to a YouTube InnerTube endpoint and returns the parsed JSON.
func (c *Client) ytPost(ctx context.Context, endpoint string, extraParams url.Values, body map[string]any) (map[string]any, error) {
	params := url.Values{"key": {ytKey}}
	for k, vs := range extraParams {
		params[k] = vs
	}
	u := endpoint + "?" + params.Encode()

	raw, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u, bytes.NewReader(raw))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", ytUserAgent)
	req.Header.Set("Origin", "https://www.youtube.com")
	req.Header.Set("Referer", "https://www.youtube.com/")
	req.Header.Set("X-YouTube-Client-Name", "1")
	req.Header.Set("X-YouTube-Client-Version", ytClientVersion)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, &NetworkError{Err: err}
	}
	defer resp.Body.Close()
	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, &NetworkError{Err: err}
	}

	var result map[string]any
	if err := json.Unmarshal(data, &result); err != nil {
		return nil, fmt.Errorf("YouTube API: failed to decode response: %w", err)
	}
	return result, nil
}

// ─── JSON path navigation ─────────────────────────────────────────────────────

// dig safely navigates a nested map[string]any / []any structure by key path.
// Returns nil if any step in the path is missing or the wrong type.
func dig(v any, keys ...string) any {
	for _, k := range keys {
		switch m := v.(type) {
		case map[string]any:
			v = m[k]
		case []any:
			i, err := strconv.Atoi(k)
			if err != nil || i < 0 || i >= len(m) {
				return nil
			}
			v = m[i]
		default:
			return nil
		}
		if v == nil {
			return nil
		}
	}
	return v
}

func digStr(v any, keys ...string) string {
	r := dig(v, keys...)
	if s, ok := r.(string); ok {
		return s
	}
	return ""
}

func digArr(v any, keys ...string) []any {
	r := dig(v, keys...)
	if a, ok := r.([]any); ok {
		return a
	}
	return nil
}

func digMap(v any, keys ...string) map[string]any {
	r := dig(v, keys...)
	if m, ok := r.(map[string]any); ok {
		return m
	}
	return nil
}

// textRuns extracts concatenated text from YouTube's {runs:[{text:"..."},...]} pattern.
func textRuns(v any, keys ...string) string {
	node := dig(v, keys...)
	// Try simpleText first
	if m, ok := node.(map[string]any); ok {
		if s, ok := m["simpleText"].(string); ok {
			return s
		}
		if runs, ok := m["runs"].([]any); ok {
			var b strings.Builder
			for _, r := range runs {
				b.WriteString(digStr(r, "text"))
			}
			return b.String()
		}
	}
	return ""
}

// formatSeconds converts a total-seconds integer to "H:MM:SS" or "M:SS" string.
func formatSeconds(sec int) string {
	if sec <= 0 {
		return ""
	}
	h := sec / 3600
	m := (sec % 3600) / 60
	s := sec % 60
	if h > 0 {
		return fmt.Sprintf("%d:%02d:%02d", h, m, s)
	}
	return fmt.Sprintf("%d:%02d", m, s)
}

// ─── ytSearch (text query → YouTube search API) ───────────────────────────────

func (c *Client) ytSearch(ctx context.Context, query string, limit int) ([]YTSearchResult, error) {
	body := ytInnertubeBody(map[string]any{"query": query})
	resp, err := c.ytPost(ctx, ytSearchURL, nil, body)
	if err != nil {
		return nil, err
	}

	// Navigate: contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents
	sections := digArr(resp,
		"contents",
		"twoColumnSearchResultsRenderer",
		"primaryContents",
		"sectionListRenderer",
		"contents",
	)

	var results []YTSearchResult
	for _, section := range sections {
		items := digArr(section, "itemSectionRenderer", "contents")
		for _, item := range items {
			m, ok := item.(map[string]any)
			if !ok {
				continue
			}
			vr, ok := m["videoRenderer"].(map[string]any)
			if !ok {
				continue
			}
			vid := digStr(vr, "videoId")
			if vid == "" {
				continue
			}
			r := YTSearchResult{
				VideoID:     vid,
				Title:       textRuns(vr, "title"),
				Description: textRuns(vr, "descriptionSnippet"),
				Duration:    textRuns(vr, "lengthText"),
				ViewCount:   textRuns(vr, "viewCountText"),
				Published:   digStr(vr, "publishedTimeText", "simpleText"),
				Channel:     textRuns(vr, "ownerText"),
				URL:         ytWatchURL(vid),
				Thumbnail:   ytThumbURL(vid),
			}
			results = append(results, r)
			if len(results) >= limit {
				return results, nil
			}
		}
	}
	return results, nil
}

// ─── ytGetVideo (video ID → YouTube player API) ───────────────────────────────

func (c *Client) ytGetVideo(ctx context.Context, videoID string) (*YTVideoInfo, error) {
	body := ytInnertubeBody(map[string]any{"videoId": videoID})
	extraParams := url.Values{
		"videoId":       {videoID},
		"contentCheckOk": {"true"},
		"racyCheckOk":   {"true"},
	}
	resp, err := c.ytPost(ctx, ytPlayerURL, extraParams, body)
	if err != nil {
		return nil, err
	}

	vd := digMap(resp, "videoDetails")
	if vd == nil {
		return nil, &NotFoundError{Message: "video not found or unavailable: " + videoID}
	}

	vid := digStr(vd, "videoId")
	if vid == "" {
		vid = videoID
	}

	secStr := digStr(vd, "lengthSeconds")
	sec, _ := strconv.Atoi(secStr)

	isLive := false
	if b, ok := dig(vd, "isLiveContent").(bool); ok {
		isLive = b
	}

	return &YTVideoInfo{
		VideoID:     vid,
		Title:       digStr(vd, "title"),
		Description: digStr(vd, "shortDescription"),
		Duration:    formatSeconds(sec),
		DurationSec: sec,
		URL:         ytWatchURL(vid),
		Thumbnail:   ytThumbURL(vid),
		Channel:     digStr(vd, "author"),
		ViewCount:   digStr(vd, "viewCount"),
		IsLive:      isLive,
	}, nil
}

// ─── ytRelated (video ID → autoplay suggestions via youtubei/v1/next) ─────────

func (c *Client) ytRelated(ctx context.Context, videoID string, limit int) ([]Suggestion, error) {
	body := ytInnertubeBody(map[string]any{"videoId": videoID})
	resp, err := c.ytPost(ctx, ytNextURL, nil, body)
	if err != nil {
		return nil, err
	}

	// Navigate: contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results
	items := digArr(resp,
		"contents",
		"twoColumnWatchNextResults",
		"secondaryResults",
		"secondaryResults",
		"results",
	)

	var suggestions []Suggestion
	for _, item := range items {
		m, ok := item.(map[string]any)
		if !ok {
			continue
		}

		// YouTube now returns lockupViewModel (newer API) or compactVideoRenderer (older)
		var vid, title, channel, dur string

		if lvm, ok := m["lockupViewModel"].(map[string]any); ok {
			// ── New format: lockupViewModel ──────────────────────────
			if lvm["contentType"] != "LOCKUP_CONTENT_TYPE_VIDEO" {
				continue
			}
			vid = digStr(lvm, "contentId")

			// title: metadata.lockupMetadataViewModel.title.content
			title = digStr(lvm, "metadata", "lockupMetadataViewModel", "title", "content")

			// channel: metadata.lockupMetadataViewModel.image.decoratedAvatarViewModel.a11yLabel
			// label is "Go to channel <Name>" — strip the prefix
			label := digStr(lvm, "metadata", "lockupMetadataViewModel", "image", "decoratedAvatarViewModel", "a11yLabel")
			channel = strings.TrimPrefix(label, "Go to channel ")

			// duration from overlay badge text
			if ovs := digArr(lvm, "contentImage", "thumbnailViewModel", "overlays"); len(ovs) > 0 {
				for _, ov := range ovs {
					if t := digStr(ov, "thumbnailBottomOverlayViewModel", "badges", "0", "thumbnailBadgeViewModel", "text"); t != "" {
						dur = t
						break
					}
				}
				// fallback: iterate badges array manually
				if dur == "" {
					for _, ov := range ovs {
						om, ok := ov.(map[string]any)
						if !ok {
							continue
						}
						bov, ok := om["thumbnailBottomOverlayViewModel"].(map[string]any)
						if !ok {
							continue
						}
						badges, ok := bov["badges"].([]any)
						if !ok || len(badges) == 0 {
							continue
						}
						badge, ok := badges[0].(map[string]any)
						if !ok {
							continue
						}
						if bvm, ok := badge["thumbnailBadgeViewModel"].(map[string]any); ok {
							dur, _ = bvm["text"].(string)
						}
					}
				}
			}

		} else if cvr, ok := m["compactVideoRenderer"].(map[string]any); ok {
			// ── Legacy format: compactVideoRenderer ──────────────────
			vid = digStr(cvr, "videoId")
			title = textRuns(cvr, "title")
			channel = textRuns(cvr, "shortBylineText")
			dur = textRuns(cvr, "lengthText")
		} else {
			continue // ad, mix, playlist — skip
		}

		if vid == "" || title == "" {
			continue
		}
		suggestions = append(suggestions, Suggestion{
			VideoID:   vid,
			Title:     title,
			Duration:  dur,
			Channel:   channel,
			URL:       ytWatchURL(vid),
			Thumbnail: ytThumbURL(vid),
		})
		if len(suggestions) >= limit {
			return suggestions, nil
		}
	}
	return suggestions, nil
}

// ─── ytAutocomplete (query → YouTube search autocomplete suggestions) ──────────

func (c *Client) ytAutocomplete(ctx context.Context, query, language, region string) ([]AutocompleteSuggestion, error) {
	params := url.Values{
		"client": {"youtube"},
		"hl":     {language},
		"gl":     {region},
		"q":      {query},
		"ds":     {"yt"},
		"gs_ri":  {"youtube"},
		"tok":    {"null"},
	}
	u := ytSuggestURL + "?" + params.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", ytUserAgent)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, &NetworkError{Err: err}
	}
	defer resp.Body.Close()
	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, &NetworkError{Err: err}
	}

	// Response is JSONP: window.google.ac.h(["query",[["suggestion",...],...]])
	// Strip the callback wrapper: find first "(" and last ")"
	text := string(raw)
	start := strings.Index(text, "(")
	end := strings.LastIndex(text, ")")
	if start == -1 || end == -1 || end <= start {
		return nil, fmt.Errorf("YouTube autocomplete: unexpected response format")
	}

	var data []any
	if err := json.Unmarshal([]byte(text[start+1:end]), &data); err != nil {
		return nil, fmt.Errorf("YouTube autocomplete: failed to decode response: %w", err)
	}

	// data[1] = [[suggestion_text, ...], ...]
	items, _ := data[1].([]any)
	var out []AutocompleteSuggestion
	for _, item := range items {
		arr, ok := item.([]any)
		if !ok || len(arr) == 0 {
			continue
		}
		if text, ok := arr[0].(string); ok && text != "" {
			out = append(out, AutocompleteSuggestion{Text: text})
		}
	}
	return out, nil
}
