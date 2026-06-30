# biq-api · Python SDK

Official Python SDK for the [BabiesIQ API](https://babiesiq.tech).

[![PyPI](https://img.shields.io/pypi/v/biq-api)](https://pypi.org/project/biq-api/)
[![Python](https://img.shields.io/pypi/pyversions/biq-api)](https://pypi.org/project/biq-api/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Installation

```bash
pip install biq-api
```

## Manual Download

You can also clone or download this SDK directly from GitHub:

**→ <https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/python>**

```bash
# Clone just the SDK folder (sparse checkout)
git clone --filter=blob:none --sparse https://github.com/BabiesIQ/_metaAPI.git
cd web
git sparse-checkout set sdk/python
```

---

## Quick Start

```python
from biq_api import BabiesIQ, _metadata

# ── SDK info ───────────────────────────────
print(_metadata["name"])      # biq-api
print(_metadata["version"])   # 2.0.0
print(_metadata["docs"])      # https://babiesiq.tech/docs

# ── Create client ──────────────────────────
client = BabiesIQ(api_key="biq_YOUR_KEY")

# ── Songs ──────────────────────────────────
song = client.songs.search("Shape of You")
print(song.stream_url)

# ── Videos ─────────────────────────────────
video = client.videos.search("Big Buck Bunny")
print(video.stream_url)

# ── Cross-search ────────────────────────────
results = client.search.query("Ed Sheeran")
for r in results:
    print(r.type, r.title)
```

---

## API Reference

### `client.songs.search(query, eq=None, download=False)`

Search for an audio stream.

```python
song = client.songs.search("Never Gonna Give You Up", eq="bass_boost")
print(song.stream_url)
print(song.title)
print(song.duration)
```

### `client.videos.search(query, download=False)`

Search for a video stream.

```python
video = client.videos.search("Gangnam Style")
print(video.stream_url)
print(video.quality)
```

### `client.search.query(query)`

Search across songs and videos.

```python
results = client.search.query("Taylor Swift")
```

### `client.thumbnails.get(video_id, design=None)`

Fetch a YouTube thumbnail.

```python
thumb = client.thumbnails.get("dQw4w9WgXcQ")
print(thumb.url)
```

---

## Error Handling

```python
from biq_api import BabiesIQ
from biq_api.errors import AuthError, RateLimitError, BabiesIQError

client = BabiesIQ(api_key="biq_YOUR_KEY")

try:
    song = client.songs.search("test")
except RateLimitError:
    print("Rate limited — please slow down")
except AuthError:
    print("Invalid API key")
except BabiesIQError as e:
    print(f"API error: {e.message} (HTTP {e.status})")
```

---

## Links

| Resource | URL |
|----------|-----|
| API Docs | <https://babiesiq.tech/docs> |
| PyPI | <https://pypi.org/project/biq-api/> |
| Source | <https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/python> |
| Dashboard | <https://babiesiq.tech/panel/api-keys> |

## License

MIT — © BabiesIQ Team
