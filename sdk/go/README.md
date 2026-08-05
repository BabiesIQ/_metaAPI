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

| Service | Backend | API Key Required |
|---|---|---|
| `client.Songs` | BabiesIQ API | ✅ Yes |
| `client.Videos` | BabiesIQ API | ✅ Yes |
| `client.Thumbnails` | BabiesIQ API | ✅ Yes |
| `client.Search` | YouTube (direct) | ❌ No |
| `client.Suggestions` | YouTube (direct) | ❌ No |

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

    // Search a song (BabiesIQ API)
    song, err := client.Songs.Search(ctx, "Shape of You", nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("Stream URL:", song.StreamURL)

    // Smart YouTube search
    results, err := client.Search.Query(ctx, "Shape of You Ed Sheeran", 5)
    if err != nil {
        log.Fatal(err)
    }
    for _, r := range results {
        fmt.Printf("[%s] %s — %s\n", r.Duration, r.Title, r.Channel)
    }
}
```

---

## Songs — `client.Songs`

Search for a song and get a stream URL via the BabiesIQ API.

```go
// Basic search
song, err := client.Songs.Search(ctx, "Blinding Lights", nil)
fmt.Println(song.Title)      // "Blinding Lights"
fmt.Println(song.Artist)     // "The Weeknd"
fmt.Println(song.StreamURL)  // "https://..."
fmt.Println(song.Duration)   // 200  (seconds)
fmt.Println(song.Thumbnail)  // "https://..."

// With options
song, err := client.Songs.Search(ctx, "Blinding Lights", &babiesiq.SongOptions{
    EQ:       "bass_boost", // equalizer preset
    Download: true,         // include direct download URL
})
```

**`SongOptions` fields:**

| Field | Type | Description |
|---|---|---|
| `EQ` | `string` | Equalizer preset: `"bass_boost"`, `"nightcore"`, etc. |
| `Download` | `bool` | If `true`, includes a direct download URL |

---

## Videos — `client.Videos`

Search for a video and get a stream URL via the BabiesIQ API.

```go
// Basic search
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
fmt.Println(info.Description) // full description
fmt.Println(info.Thumbnail)   // "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
fmt.Println(info.URL)         // "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
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
// By video ID
suggestions, err := client.Suggestions.ForVideo(ctx, "dQw4w9WgXcQ", 10)

// By full YouTube URL
suggestions, err := client.Suggestions.ForVideo(ctx, "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 10)

// By youtu.be short URL
suggestions, err := client.Suggestions.ForVideo(ctx, "https://youtu.be/dQw4w9WgXcQ", 10)

for _, s := range suggestions {
    fmt.Printf("[%s] %s — %s\n", s.Duration, s.Title, s.Channel)
    fmt.Println("  URL:", s.URL)
    fmt.Println("  Thumb:", s.Thumbnail)
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

Get the dropdown suggestions shown in the YouTube search bar.

```go
suggestions, err := client.Suggestions.ForQuery(ctx, "never gonna", "en", "US")
for _, s := range suggestions {
    fmt.Println(s.Text) // "never gonna give you up", "never gonna let you down", ...
}
```

**`AutocompleteSuggestion` fields:**

| Field | Type | Description |
|---|---|---|
| `Text` | `string` | Suggested search query text |

---

## Thumbnails — `client.Thumbnails`

Get a styled thumbnail via the BabiesIQ API.

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
> This is what `Search.Query` and `Suggestions.ForVideo` use automatically.

---

## Custom Configuration

```go
import "time"

client, err := babiesiq.New("biq_YOUR_KEY", babiesiq.Config{
    MaxRetries: 3,
    Timeout:    15 * time.Second,
    BaseURL:    "https://api.babiesiq.tech", // optional override
})
```

---

## SDK Metadata

```go
fmt.Println(babiesiq.Metadata.Name)     // "biq-api"
fmt.Println(babiesiq.Metadata.Version)  // "2.0.0"
fmt.Println(babiesiq.Metadata.Docs)     // "https://babiesiq.tech/docs"
fmt.Println(babiesiq.Metadata.Source)   // "https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/go"
```

---

## Error Handling

```go
song, err := client.Songs.Search(ctx, "test", nil)
if err != nil {
    switch e := err.(type) {
    case *babiesiq.AuthError:
        fmt.Println("Invalid API key:", e.Message)
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

---

## Full Example

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

    // ── BabiesIQ: Song stream ──────────────────────────────────────────
    song, err := client.Songs.Search(ctx, "Blinding Lights", &babiesiq.SongOptions{
        EQ: "bass_boost",
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("Song stream:", song.StreamURL)

    // ── BabiesIQ: Video stream ─────────────────────────────────────────
    video, err := client.Videos.Search(ctx, "Gangnam Style", nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("Video stream:", video.StreamURL)

    // ── YouTube: Text search ───────────────────────────────────────────
    textResults, err := client.Search.Query(ctx, "Taylor Swift Anti-Hero", 5)
    if err != nil {
        log.Fatal(err)
    }
    for _, r := range textResults {
        fmt.Printf("[%s] %s — %s\n", r.Duration, r.Title, r.Channel)
        fmt.Println("  Thumbnail:", r.Thumbnail)
    }

    // ── YouTube: Video ID / URL lookup ─────────────────────────────────
    info, err := client.Search.GetVideo(ctx, "https://youtu.be/dQw4w9WgXcQ")
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Video: %s (%s)\n", info.Title, info.Duration)
    fmt.Println("Thumbnail:", info.Thumbnail)

    // ── YouTube: Autoplay suggestions ──────────────────────────────────
    related, err := client.Suggestions.ForVideo(ctx, "dQw4w9WgXcQ", 5)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("\nUp Next:")
    for _, s := range related {
        fmt.Printf("  [%s] %s — %s\n", s.Duration, s.Title, s.Channel)
    }

    // ── YouTube: Search autocomplete ───────────────────────────────────
    autocomplete, err := client.Suggestions.ForQuery(ctx, "never gonna", "en", "US")
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("\nAutocomplete:")
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
