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
| `client.Songs` | YouTube → BabiesIQ CDN | ✅ Yes | `Search`, `Download` |
| `client.Videos` | YouTube → BabiesIQ CDN | ✅ Yes | `Search`, `Download` |
| `client.Thumbnails` | BabiesIQ API | ✅ Yes | `Get` |
| `client.Search` | YouTube (direct) | ❌ No | `Query`, `GetVideo` |
| `client.Suggestions` | YouTube (direct) | ❌ No | `ForVideo`, `ForQuery` |

> **How Songs and Videos work internally:**
> The BabiesIQ API requires a YouTube video ID, not a song name.
> `Songs.Search` and `Videos.Search` handle this automatically — they first
> resolve the video ID via YouTube search (or parse it from a URL you pass),
> then call the BabiesIQ API. You just pass a name or URL.

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

    // Search by name — returns metadata + CDN stream URL
    song, err := client.Songs.Search(ctx, "Shape of You", nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("Stream URL:", song.StreamURL)

    // Download to disk — polls CDN until ready, then saves the file
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

### Search (metadata + stream URL)

Resolves the YouTube video ID first, then calls the BabiesIQ API.
`query` can be a **song name**, a **YouTube video ID**, or any **YouTube URL**.

```go
// By song name
song, err := client.Songs.Search(ctx, "Blinding Lights", nil)

// By YouTube video ID (skips the YouTube search step)
song, err := client.Songs.Search(ctx, "H_D7O7qGABs", nil)

// By YouTube URL
song, err := client.Songs.Search(ctx, "https://youtu.be/H_D7O7qGABs", nil)

fmt.Println(song.Title)      // "The Weeknd - Blinding Lights (Official Video)"
fmt.Println(song.Artist)     // "The Weeknd"  (YouTube channel)
fmt.Println(song.StreamURL)  // "https://api.babiesiq.tech/api/stream/..."
fmt.Println(song.Duration)   // 202  (seconds, from YouTube)
fmt.Println(song.Thumbnail)  // "https://i.ytimg.com/vi/.../maxresdefault.jpg"
fmt.Println(song.VideoID)    // "H_D7O7qGABs"

// With EQ preset
song, err := client.Songs.Search(ctx, "Blinding Lights", &babiesiq.SongOptions{
    EQ: "bass_boost", // "bass_boost", "nightcore", etc.
})
```

**`Song` fields:**

| Field | Type | Source | Description |
|---|---|---|---|
| `Title` | `string` | YouTube | Video / song title |
| `Artist` | `string` | YouTube | Channel / artist name |
| `StreamURL` | `string` | BabiesIQ CDN | CDN stream URL |
| `Duration` | `int` | YouTube | Duration in seconds |
| `Thumbnail` | `string` | YouTube | Thumbnail URL |
| `VideoID` | `string` | YouTube | 11-char YouTube video ID used for the lookup |

### Download (save to disk with polling)

Calls the API with `download=true`, polls the CDN every 2 s until it is ready
(HTTP 200 / 206), then streams the file to `destPath` on disk.

```go
result, err := client.Songs.Download(ctx, "Blinding Lights", "/tmp/song.mp3", nil)
if err != nil {
    log.Fatal(err)
}
fmt.Println("Saved:", result.FilePath) // "/tmp/song.mp3"
fmt.Println("Title:", result.Title)

// With custom EQ and a shorter poll timeout
import "time"
result, err := client.Songs.Download(ctx, "Blinding Lights", "/tmp/song.mp3", &babiesiq.SongDownloadOptions{
    EQ:      "nightcore",
    Timeout: 90 * time.Second, // default is 2 minutes
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
| `*Song` | embedded | All Song metadata fields |
| `FilePath` | `string` | Absolute path to the saved file on disk |

**Polling status codes:**

| HTTP status | Meaning | SDK action |
|---|---|---|
| `200`, `206` | Stream ready | Download immediately |
| `204`, `404`, `410`, `423` | Not ready yet | Retry after 2 s |
| `401`, `403` | Blocked / geo-restricted | Returns `AuthError` |
| `429` | Rate limited | Returns `RateLimitError` |
| timeout exceeded | CDN still processing | Returns `DownloadTimeoutError` |

---

## Videos — `client.Videos`

### Search (metadata + stream URL)

```go
// By video name
video, err := client.Videos.Search(ctx, "Gangnam Style", nil)

// By YouTube video ID
video, err := client.Videos.Search(ctx, "9bZkp7q19f0", nil)

// By YouTube URL
video, err := client.Videos.Search(ctx, "https://youtu.be/9bZkp7q19f0", nil)

fmt.Println(video.Title)     // "PSY - GANGNAM STYLE M/V"
fmt.Println(video.Channel)   // "officialpsy"
fmt.Println(video.StreamURL) // "https://api.babiesiq.tech/api/stream/..."
fmt.Println(video.Duration)  // 253  (seconds)
fmt.Println(video.Thumbnail) // "https://i.ytimg.com/vi/.../maxresdefault.jpg"
fmt.Println(video.VideoID)   // "9bZkp7q19f0"

// With quality
video, err := client.Videos.Search(ctx, "Gangnam Style", &babiesiq.VideoOptions{
    Quality: "720p",
})
fmt.Println(video.Quality)   // "720p"
```

**`Video` fields:**

| Field | Type | Source | Description |
|---|---|---|---|
| `Title` | `string` | YouTube | Video title |
| `Channel` | `string` | YouTube | Channel / uploader name |
| `StreamURL` | `string` | BabiesIQ CDN | CDN stream URL |
| `Quality` | `string` | Request option | Requested quality, e.g. `"720p"` |
| `Duration` | `int` | YouTube | Duration in seconds |
| `Thumbnail` | `string` | YouTube | Thumbnail URL |
| `VideoID` | `string` | YouTube | 11-char YouTube video ID used for the lookup |

### Download (save to disk with polling)

```go
result, err := client.Videos.Download(ctx, "Gangnam Style", "/tmp/video.mp4", nil)
if err != nil {
    log.Fatal(err)
}
fmt.Println("Saved:", result.FilePath)
fmt.Printf("Size: approx %.0f MB\n", float64(result.Duration)/60*3) // rough estimate

// With custom quality and timeout
result, err := client.Videos.Download(ctx, "Gangnam Style", "/tmp/video.mp4", &babiesiq.VideoDownloadOptions{
    Quality: "1080p",
    Timeout: 5 * time.Minute, // default is 3 minutes
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
| `*Video` | embedded | All Video metadata fields |
| `FilePath` | `string` | Absolute path to the saved file on disk |

---

## Smart Search — `client.Search`

**No API key required.** Calls YouTube's internal API directly.

### Auto-detection: text vs. video ID / URL

`Search.Query` detects automatically whether you passed a text query or a video ID/URL:

```go
// Text query → YouTube search, returns up to `limit` results
results, err := client.Search.Query(ctx, "Never Gonna Give You Up", 10)

// Video ID → YouTube player API, returns 1 result with full details
results, err := client.Search.Query(ctx, "dQw4w9WgXcQ", 1)

// Full YouTube URL
results, err := client.Search.Query(ctx, "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 1)

// youtu.be, Shorts, embed URLs — all supported
results, err := client.Search.Query(ctx, "https://youtu.be/dQw4w9WgXcQ", 1)
```

**`YTSearchResult` fields:**

| Field | Type | Description |
|---|---|---|
| `VideoID` | `string` | 11-character YouTube video ID |
| `Title` | `string` | Video title |
| `Description` | `string` | Short description snippet |
| `Duration` | `string` | Human-readable, e.g. `"4:32"` |
| `DurationSec` | `int` | Duration in seconds |
| `URL` | `string` | Full YouTube watch URL |
| `Thumbnail` | `string` | YouTube CDN thumbnail (maxresdefault) |
| `Channel` | `string` | Channel/uploader name |
| `ViewCount` | `string` | View count string, e.g. `"1.2M views"` |
| `Published` | `string` | Relative publish time, e.g. `"2 years ago"` |

### Get full video details by ID or URL

```go
info, err := client.Search.GetVideo(ctx, "dQw4w9WgXcQ")
fmt.Println(info.Title)       // "Rick Astley - Never Gonna Give You Up"
fmt.Println(info.Channel)     // "Rick Astley"
fmt.Println(info.Duration)    // "3:33"
fmt.Println(info.DurationSec) // 213
fmt.Println(info.IsLive)      // false
```

---

## Suggestions — `client.Suggestions`

**No API key required.**

```go
// Autoplay / related videos ("Up Next" sidebar)
suggestions, err := client.Suggestions.ForVideo(ctx, "dQw4w9WgXcQ", 10)
for _, s := range suggestions {
    fmt.Printf("[%s] %s — %s\n", s.Duration, s.Title, s.Channel)
}

// Search autocomplete (YouTube search bar dropdown)
suggestions, err := client.Suggestions.ForQuery(ctx, "never gonna", "en", "US")
for _, s := range suggestions {
    fmt.Println(s.Text)
}
```

---

## Thumbnails — `client.Thumbnails`

```go
thumb, err := client.Thumbnails.Get(ctx, "dQw4w9WgXcQ", "")
fmt.Println(thumb.URL)
```

> **Raw YouTube CDN thumbnails** (no API key, no styling):
> `https://i.ytimg.com/vi/{videoID}/maxresdefault.jpg`

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
_, err := client.Songs.Download(ctx, "Blinding Lights", "/tmp/out.mp3", nil)
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
| `*NotFoundError` | No YouTube results found for query |
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

    // ── Search: metadata + stream URL only ─────────────────────────────
    song, err := client.Songs.Search(ctx, "Blinding Lights", nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Song: %s by %s (%ds)\n", song.Title, song.Artist, song.Duration)
    fmt.Println("Stream URL:", song.StreamURL)

    // ── Download song to disk ──────────────────────────────────────────
    songResult, err := client.Songs.Download(ctx, "Blinding Lights", "downloads/song.mp3", &babiesiq.SongDownloadOptions{
        EQ:      "bass_boost",
        Timeout: 90 * time.Second,
    })
    if err != nil {
        switch e := err.(type) {
        case *babiesiq.DownloadTimeoutError:
            log.Fatalf("Timed out after %s: %s", e.Timeout, e.StreamURL)
        default:
            log.Fatal(err)
        }
    }
    fmt.Println("Song saved:", songResult.FilePath)

    // ── Download video to disk ─────────────────────────────────────────
    videoResult, err := client.Videos.Download(ctx, "Gangnam Style", "downloads/video.mp4", &babiesiq.VideoDownloadOptions{
        Quality: "720p",
        Timeout: 4 * time.Minute,
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("Video saved:", videoResult.FilePath)

    // ── YouTube search (no API key) ────────────────────────────────────
    results, err := client.Search.Query(ctx, "Taylor Swift Anti-Hero", 5)
    if err != nil {
        log.Fatal(err)
    }
    for _, r := range results {
        fmt.Printf("[%s] %s — %s\n", r.Duration, r.Title, r.Channel)
    }

    // ── Autoplay suggestions ───────────────────────────────────────────
    related, err := client.Suggestions.ForVideo(ctx, "dQw4w9WgXcQ", 5)
    if err != nil {
        log.Fatal(err)
    }
    for _, s := range related {
        fmt.Printf("  [%s] %s — %s\n", s.Duration, s.Title, s.Channel)
    }

    // ── Search autocomplete ────────────────────────────────────────────
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
