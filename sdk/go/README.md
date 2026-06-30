# biq-api-go · Go SDK

Official Go SDK for the [BabiesIQ API](https://babiesiq.tech).

[![Go Reference](https://pkg.go.dev/badge/github.com/BabiesIQ/biq-api-go.svg)](https://pkg.go.dev/github.com/BabiesIQ/biq-api-go)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Installation

```bash
go get github.com/BabiesIQ/biq-api-go
```

## Manual Download

You can also clone or download this SDK directly from GitHub:

**→ <https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/go>**

```bash
# Clone just the SDK folder (sparse checkout)
git clone --filter=blob:none --sparse https://github.com/BabiesIQ/_metaAPI.git
cd web
git sparse-checkout set sdk/go
```

---

## Quick Start

```go
package main

import (
	"context"
	"fmt"
	"log"

	babiesiq "github.com/BabiesIQ/biq-api-go"
)

func main() {
	// ── SDK info ───────────────────────────────
	fmt.Println(babiesiq.Metadata.Name)     // biq-api
	fmt.Println(babiesiq.Metadata.Version)  // 2.0.0
	fmt.Println(babiesiq.Metadata.Docs)     // https://babiesiq.tech/docs

	// ── Create client ──────────────────────────
	client, err := babiesiq.New("biq_YOUR_KEY")
	if err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()

	// ── Songs ──────────────────────────────────
	song, err := client.Songs.Search(ctx, "Shape of You", nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Stream URL:", song.StreamURL)

	// ── Videos ─────────────────────────────────
	video, err := client.Videos.Search(ctx, "Big Buck Bunny", nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Video URL:", video.StreamURL)

	// ── Cross-search ────────────────────────────
	results, err := client.Search.Query(ctx, "Ed Sheeran")
	if err != nil {
		log.Fatal(err)
	}
	for _, r := range results {
		fmt.Println(r.Type, r.Title)
	}
}
```

---

## API Reference

### `client.Songs.Search(ctx, query, opts)`

```go
song, err := client.Songs.Search(ctx, "Never Gonna Give You Up", &babiesiq.SongOptions{
	EQ:       "bass_boost",
	Download: false,
})
fmt.Println(song.StreamURL, song.Title)
```

### `client.Videos.Search(ctx, query, opts)`

```go
video, err := client.Videos.Search(ctx, "Gangnam Style", nil)
fmt.Println(video.StreamURL, video.Quality)
```

### `client.Search.Query(ctx, query)`

```go
results, err := client.Search.Query(ctx, "Taylor Swift")
```

### `client.Thumbnails.Get(ctx, videoID, design)`

```go
thumb, err := client.Thumbnails.Get(ctx, "dQw4w9WgXcQ", "")
fmt.Println(thumb.URL)
```

---

## Error Handling

```go
import babiesiq "github.com/BabiesIQ/biq-api-go"

song, err := client.Songs.Search(ctx, "test", nil)
if err != nil {
	switch e := err.(type) {
	case *babiesiq.RateLimitError:
		fmt.Println("Rate limited")
	case *babiesiq.AuthError:
		fmt.Println("Invalid API key:", e.Message)
	case *babiesiq.APIError:
		fmt.Printf("API error %d: %s\n", e.Status, e.Message)
	default:
		fmt.Println("Error:", err)
	}
}
```

---

## Links

| Resource | URL |
|----------|-----|
| API Docs | <https://babiesiq.tech/docs> |
| pkg.go.dev | <https://pkg.go.dev/github.com/BabiesIQ/biq-api-go> |
| Source | <https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/go> |
| Dashboard | <https://babiesiq.tech/panel/api-keys> |

## License

MIT — © BabiesIQ Team
