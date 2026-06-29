# babiesiq-go

Official Go SDK for the BabiesIQ API.

## Installation

```bash
go get github.com/BabiesIQ/sdk-go
```

## Quick Start

```go
package main

import (
    "context"
    "fmt"
    "log"

    babiesiq "github.com/BabiesIQ/sdk-go"
)

func main() {
    client, err := babiesiq.New("biq_your_api_key")
    if err != nil {
        log.Fatal(err)
    }

    ctx := context.Background()

    // Search for a song
    song, err := client.Songs.Search(ctx, "Shape of You Ed Sheeran", nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("Stream URL:", song.StreamURL)

    // Search for a video
    video, err := client.Videos.Search(ctx, "Big Buck Bunny", nil)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("Video URL:", video.StreamURL)
}
```

## Error Handling

```go
import babiesiq "github.com/BabiesIQ/sdk-go"

song, err := client.Songs.Search(ctx, "test", nil)
if err != nil {
    switch e := err.(type) {
    case *babiesiq.RateLimitError:
        fmt.Println("Rate limited")
    case *babiesiq.AuthError:
        fmt.Println("Invalid API key")
    case *babiesiq.APIError:
        fmt.Printf("API error %d: %s\n", e.Status, e.Message)
    default:
        fmt.Println("Unknown error:", err)
    }
}
```

## License

MIT
