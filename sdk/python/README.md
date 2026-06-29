# babiesiq-sdk

Official Python SDK for the BabiesIQ API.

## Installation

```bash
pip install babiesiq
```

## Quick Start

```python
from babiesiq import BabiesIQ

client = BabiesIQ(api_key="biq_your_api_key_here")

# Search for a song
song = client.songs.search("Shape of You Ed Sheeran")
print(song.stream_url)

# Search for a video
video = client.videos.search("Big Buck Bunny")
print(video.stream_url)
```

## Error Handling

```python
from babiesiq import BabiesIQ
from babiesiq.errors import AuthError, RateLimitError, BabiesIQError

client = BabiesIQ(api_key="your_key")

try:
    result = client.songs.search("test")
except RateLimitError as e:
    print(f"Rate limited. Retry after: {e.retry_after}s")
except AuthError:
    print("Invalid API key")
except BabiesIQError as e:
    print(f"API error: {e.message} (HTTP {e.status})")
```

## License

MIT
