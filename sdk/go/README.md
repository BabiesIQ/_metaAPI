# biq-api-go · Go SDK

Official Go SDK for the [BabiesIQ API](https://babiesiq.tech).

[![Go Reference](https://pkg.go.dev/badge/github.com/BabiesIQ/_metaAPI/sdk/go.svg)](https://pkg.go.dev/github.com/BabiesIQ/_metaAPI/sdk/go)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Installation

```bash
go get github.com/BabiesIQ/_metaAPI/sdk/go@latest
```

---

## Services Overview

| Service | Backend | API Key Required | Methods |
|---|---|---|---|
| `client.Songs` | BabiesIQ API | ✅ Yes | `Search`, `Download` |
| `client.Videos` | BabiesIQ API | ✅ Yes | `Search`, `Download` |
| `client.Thumbnails` | BabiesIQ API | ✅ Yes | `Get` |
| `client.Search` | YouTube (direct) | ❌ No | `Query`, `GetVideo` |
| `client.Suggestions` | YouTube (direct) | ❌ No | `ForVideo`, `ForQuery` |

---

## Quick Start

```go
package main

import (
    "context"
    "fmt"
    "log"

    babiesiq "github.com/BabiesIQ/_metaAPI/sdk/go"
)

func main() {
    client, err := babiesiq.New("biq_YOUR_KEY")
    if err != nil {
        log.Fatal(err)
    }
    ctx := context.Background()

    // Search a song — get metadata JSON only
    song, err := client.Songs.Search(ctx, "Shape of You", nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("Stream URL:", song.StreamURL)

    // Download a song to disk (polls CDN until ready, then saves)
    result, err := client.Songs.Download(ctx, "Shape of You", "/tmp/song.mp3", nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("Saved to:", result.FilePath)
    fmt.Println("Title:", result.Title)
}
```

---

## Songs — `client.Songs`

### Search (metadata only)

Returns song metadata and a CDN stream URL. The CDN file may not be ready immediately —
use `Download` if you need the file on disk.

```go
song, err := client.Songs.Search(ctx, "Blinding Lights", nil)
fmt.Println(song.Title)      // "Blinding Lights"
fmt.Println(song.Artist)     // "The Weeknd"
fmt.Println(song.StreamURL)  // "https://..."
fmt.Println(song.Duration)   // 200  (seconds)
fmt.Println(song.Thumbnail)  // "https://..."

// With options
song, err := client.Songs.Search(ctx, "Blinding Lights", &babiesiq.SongOptions{
    EQ:       "bass_boost", // equalizer preset applied server-side
    Download: true,         // request a direct download URL
})
```

**`Song` fields:**

| Field | Type | Description |
|---|---|---|
| `Title` | `string` | Song title |
| `Artist` | `string` | Artist name |
| `StreamURL` | `string` | CDN stream / download URL |
| `Duration` | `int` | Duration in seconds |
| `Thumbnail` | `string` | Cover art URL |

### Download (save to disk)

Calls the API with `download=true`, polls the CDN stream URL every 2 s until it is ready
(HTTP 200 / 206), then streams the file to `destPath` on disk.

```go
result, err := client.Songs.Download(ctx, "Blinding Lights", "/tmp/song.mp3", nil)
if err != nil {
    log.Fatal(err)
}
fmt.Println("Saved:", result.FilePath)   // "/tmp/song.mp3"
fmt.Println("Title:", result.Title)      // from Song metadata
fmt.Println("Artist:", result.Artist)

// With custom EQ and a shorter poll timeout
result, err := client.Songs.Download(ctx, "Blinding Lights", "/tmp/song.mp3", &babiesiq.SongDownloadOptions{
    EQ:      "nightcore",
    Timeout: 90 * time.Second, // give up after 90 s instead of the 2-minute default
})
```

**`SongDownloadOptions` fields:**

| Field | Type | Default | Description |
|---|---|---|---|
| `EQ` | `string` | `""` | Equalizer preset: `"bass_boost"`, `"nightcore"`, etc. |
| `Timeout` | `time.Duration` | `2 min` | Max time to wait for CDN stream to become ready |

**`SongDownloadResult` fields:**

| Field | Type | Description |
|---|---|---|
| `*Song` | embedded | All Song metadata fields (Title, Artist, StreamURL, …) |
| `FilePath` | `string` | Absolute path to the saved file on disk |

**Polling status codes:**

| HTTP status | Meaning | Action |
|---|---|---|
| `200`, `206` | Stream ready | Download immediately |
| `204`, `404`, `410`, `423` | Not ready yet | Retry after 2 s |
| `401`, `403` | Blocked / geo-restricted | Returns `AuthError` |
| `429` | Rate limited | Returns `RateLimitError` |
| timeout exceeded | CDN still processing | Returns `DownloadTimeoutError` |

---

## Videos — `client.Videos`

### Search (metadata only)

```go
video, err := client.Videos.Search(ctx, "Big Buck Bunny", nil)
fmt.Println(video.Title)     // "Big Buck Bunny"
fmt.Println(video.Channel)   // "Blender"
fmt.Println(video.StreamURL) // "https://..."
fmt.Println(video.Quality)   // "720p"
fmt.Println(video.Duration)  // 596  (seconds)
fmt.Println(video.Thumbnail) // "https://..."

// With quality option
video, err := client.Videos.Search(ctx, "Big Buck Bunny", &babiesiq.VideoOptions{
    Quality: "1080p",
})
```

**`Video` fields:**

| Field | Type | Description |
|---|---|---|
| `Title` | `string` | Video title |
| `Channel` | `string` | Channel / uploader name |
| `StreamURL` | `string` | CDN stream / download URL |
| `Quality` | `string` | Video quality, e.g. `"720p"` |
| `Duration` | `int` | Duration in seconds |
| `Thumbnail` | `string` | Thumbnail URL |

### Download (save to disk)

Calls the API with `download=true`, polls the CDN stream URL every 2 s until it is ready
(HTTP 200 / 206), then streams the file to `destPath` on disk.

Video files can be large — the default poll timeout is **3 minutes** and the file transfer
itself has a 10-minute budget.

```go
result, err := client.Videos.Download(ctx, "Big Buck Bunny", "/tmp/video.mp4", nil)
if err != nil {
    log.Fatal(err)
}
fmt.Println("Saved:", result.FilePath)   // "/tmp/video.mp4"
fmt.Println("Quality:", result.Quality)

// With custom quality and a longer poll timeout
result, err := client.Videos.Download(ctx, "Big Buck Bunny", "/tmp/video.mp4", &babiesiq.VideoDownloadOptions{
    Quality: "1080p",
    Timeout: 5 * time.Minute,
})
```

**`VideoDownloadOptions` fields:**

| Field | Type | Default | Description |
|---|---|---|---|
| `Quality` | `string` | `""` (API default) | Preferred quality: `"720p"`, `"1080p"`, etc. |
| `Timeout` | `time.Duration` | `3 min` | Max time to wait for CDN stream to become ready |

**`VideoDownloadResult` fields:**

| Field | Type | Description |
|---|---|---|
| `*Video` | embedded | All Video metadata fields (Title, Channel, StreamURL, …) |
| `FilePath` | `string` | Absolute path to the saved file on disk |

---

## Smart Search — `client.Search`

**No API key required.** Calls YouTube's internal API directly.

### Auto-detection: text vs. video ID / URL

`Search.Query` is smart — it detects automatically whether you passed a text query or a video ID/URL:

```go
// Text query → calls YouTube /v1/search, returns multiple results
results, err := client.Search.Query(ctx, "Never Gonna Give You Up", 10)

// Video ID → calls YouTube /v1/player, returns 1 result with full details
results, err := client.Search.Query(ctx, "dQw4w9WgXcQ", 1)

// Full YouTube URL → same as video ID
results, err := client.Search.Query(ctx, "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 1)

// youtu.be short URL
results, err := client.Search.Query(ctx, "https://youtu.be/dQw4w9WgXcQ", 1)

// YouTube Shorts URL
results, err := client.Search.Query(ctx, "https://www.youtube.com/shorts/dQw4w9WgXcQ", 1)
```

**`YTSearchResult` fields:**

| Field | Type | Description |
|---|---|---|
| `VideoID` | `string` | 11-character YouTube video ID |
| `Title` | `string` | Video title |
| `Description` | `string` | Short description snippet |
| `Duration` | `string` | Human-readable duration, e.g. `"4:32"` |
| `DurationSec` | `int` | Duration in seconds |
| `URL` | `string` | Full YouTube watch URL |
| `Thumbnail` | `string` | YouTube CDN thumbnail (maxresdefault) |
| `Channel` | `string` | Channel/uploader name |
| `ViewCount` | `string` | View count string, e.g. `"1.2M views"` |
| `Published` | `string` | Relative publish time, e.g. `"2 years ago"` |

### Get full video details by ID or URL

```go
info, err := client.Search.GetVideo(ctx, "dQw4w9WgXcQ")
// Also works with any YouTube URL format:
// info, err := client.Search.GetVideo(ctx, "https://youtu.be/dQw4w9WgXcQ")

fmt.Println(info.VideoID)     // "dQw4w9WgXcQ"
fmt.Println(info.Title)       // "Rick Astley - Never Gonna Give You Up"
fmt.Println(info.Channel)     // "Rick Astley"
fmt.Println(info.Duration)    // "3:33"
fmt.Println(info.DurationSec) // 213
fmt.Println(info.ViewCount)   // "1500000000"
fmt.Println(info.Thumbnail)   // "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
fmt.Println(info.IsLive)      // false
```

**`YTVideoInfo` fields:**

| Field | Type | Description |
|---|---|---|
| `VideoID` | `string` | 11-character YouTube video ID |
| `Title` | `string` | Full video title |
| `Description` | `string` | Full video description |
| `Duration` | `string` | Human-readable, e.g. `"3:33"` or `"1:02:45"` |
| `DurationSec` | `int` | Duration in seconds |
| `URL` | `string` | YouTube watch URL |
| `Thumbnail` | `string` | YouTube CDN thumbnail URL |
| `Channel` | `string` | Channel/author name |
| `ViewCount` | `string` | Raw view count string |
| `IsLive` | `bool` | `true` if this is a live stream |

---

## Suggestions — `client.Suggestions`

**No API key required.** Calls YouTube's internal API directly.

### Autoplay / related videos for a video

Get the "Up Next" sidebar videos — same as YouTube's autoplay queue.

```go
suggestions, err := client.Suggestions.ForVideo(ctx, "dQw4w9WgXcQ", 10)
for _, s := range suggestions {
    fmt.Printf("[%s] %s — %s\n", s.Duration, s.Title, s.Channel)
}
```

**`Suggestion` fields:**

| Field | Type | Description |
|---|---|---|
| `VideoID` | `string` | YouTube video ID |
| `Title` | `string` | Video title |
| `Duration` | `string` | Human-readable duration |
| `URL` | `string` | YouTube watch URL |
| `Thumbnail` | `string` | YouTube CDN thumbnail |
| `Channel` | `string` | Channel name |
| `ViewCount` | `string` | View count string |

### Search autocomplete suggestions

```go
suggestions, err := client.Suggestions.ForQuery(ctx, "never gonna", "en", "US")
for _, s := range suggestions {
    fmt.Println(s.Text) // "never gonna give you up", "never gonna let you down", ...
}
```

---

## Thumbnails — `client.Thumbnails`

```go
thumb, err := client.Thumbnails.Get(ctx, "dQw4w9WgXcQ", "")
fmt.Println(thumb.URL)    // styled thumbnail URL
fmt.Println(thumb.Width)  // e.g. 1280
fmt.Println(thumb.Height) // e.g. 720
```

> **Tip:** For raw YouTube CDN thumbnails (no API key, no styling), use:
> ```
> https://i.ytimg.com/vi/{videoID}/maxresdefault.jpg
> ```

---

## Custom Configuration

```go
import "time"

client, err := babiesiq.New("biq_YOUR_KEY", babiesiq.Config{
    MaxRetries: 3,
    Timeout:    15 * time.Second, // per-request timeout for API calls
    BaseURL:    "https://api.babiesiq.tech",
})
```

---

## Error Handling

```go
_, err := client.Songs.Download(ctx, "test", "/tmp/out.mp3", nil)
if err != nil {
    switch e := err.(type) {
    case *babiesiq.DownloadTimeoutError:
        fmt.Printf("CDN not ready after %s: %s\n", e.Timeout, e.StreamURL)
    case *babiesiq.AuthError:
        fmt.Println("Auth error:", e.Message)
    case *babiesiq.RateLimitError:
        fmt.Println("Rate limited:", e.Message)
    case *babiesiq.NotFoundError:
        fmt.Println("Not found:", e.Message)
    case *babiesiq.APIError:
        fmt.Printf("API error %d: %s\n", e.Status, e.Message)
    case *babiesiq.NetworkError:
        fmt.Println("Network error:", e.Err)
    default:
        fmt.Println("Error:", err)
    }
}
```

**Error types:**

| Type | When returned |
|---|---|
| `*DownloadTimeoutError` | CDN stream not ready within poll timeout |
| `*AuthError` | Missing/invalid API key, or stream geo-blocked |
| `*RateLimitError` | API or CDN rate limit hit |
| `*NotFoundError` | Song/video not found |
| `*APIError` | Other non-2xx API response |
| `*NetworkError` | Transport-level failure |

---

## SDK Metadata

```go
fmt.Println(babiesiq.Metadata.Version)  // "2.1.0"
fmt.Println(babiesiq.Metadata.Docs)     // "https://babiesiq.tech/docs"
```

---

## Full Example

```go
package main

import (
    "context"
    "fmt"
    "log"
    "os"
    "time"

    babiesiq "github.com/BabiesIQ/_metaAPI/sdk/go"
)

func main() {
    client, err := babiesiq.New("biq_YOUR_KEY")
    if err != nil {
        log.Fatal(err)
    }
    ctx := context.Background()

    os.MkdirAll("downloads", 0755)

    // ── Search only (metadata JSON) ────────────────────────────────────
    song, err := client.Songs.Search(ctx, "Blinding Lights", nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Song: %s by %s (%ds)\n", song.Title, song.Artist, song.Duration)
    fmt.Println("Stream URL:", song.StreamURL)

    // ── Download song to disk (polls until CDN ready) ──────────────────
    songResult, err := client.Songs.Download(ctx, "Blinding Lights", "downloads/blinding_lights.mp3", &babiesiq.SongDownloadOptions{
        EQ:      "bass_boost",
        Timeout: 90 * time.Second,
    })
    if err != nil {
        switch e := err.(type) {
        case *babiesiq.DownloadTimeoutError:
            log.Fatalf("Timed out after %s waiting for CDN: %s", e.Timeout, e.StreamURL)
        default:
            log.Fatal(err)
        }
    }
    fmt.Println("Song saved:", songResult.FilePath)

    // ── Search video (metadata JSON) ───────────────────────────────────
    video, err := client.Videos.Search(ctx, "Gangnam Style", nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Video: %s [%s]\n", video.Title, video.Quality)

    // ── Download video to disk ─────────────────────────────────────────
    videoResult, err := client.Videos.Download(ctx, "Gangnam Style", "downloads/gangnam_style.mp4", &babiesiq.VideoDownloadOptions{
        Quality: "720p",
        Timeout: 4 * time.Minute,
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("Video saved:", videoResult.FilePath)

    // ── YouTube: Text search ───────────────────────────────────────────
    results, err := client.Search.Query(ctx, "Taylor Swift Anti-Hero", 5)
    if err != nil {
        log.Fatal(err)
    }
    for _, r := range results {
        fmt.Printf("[%s] %s — %s\n", r.Duration, r.Title, r.Channel)
    }

    // ── YouTube: Video ID lookup ───────────────────────────────────────
    info, err := client.Search.GetVideo(ctx, "https://youtu.be/dQw4w9WgXcQ")
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Video: %s (%s)\n", info.Title, info.Duration)

    // ── YouTube: Autoplay suggestions ──────────────────────────────────
    related, err := client.Suggestions.ForVideo(ctx, "dQw4w9WgXcQ", 5)
    if err != nil {
        log.Fatal(err)
    }
    for _, s := range related {
        fmt.Printf("  [%s] %s — %s\n", s.Duration, s.Title, s.Channel)
    }

    // ── YouTube: Search autocomplete ───────────────────────────────────
    autocomplete, err := client.Suggestions.ForQuery(ctx, "never gonna", "en", "US")
    if err != nil {
        log.Fatal(err)
    }
    for _, a := range autocomplete {
        fmt.Println(" -", a.Text)
    }
}
```

---

## Links

| Resource | URL |
|---|---|
| API Docs | <https://babiesiq.tech/docs> |
| pkg.go.dev | <https://pkg.go.dev/github.com/BabiesIQ/_metaAPI/sdk/go> |
| Source | <https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/go> |
| Dashboard | <https://babiesiq.tech/panel/api-keys> |

## License

MIT — © BabiesIQ Team
