<div align="center">

<img src="https://raw.githubusercontent.com/BabiesIQ/_metaAPI/main/assets/banner.svg" width="100%" alt="BabiesIQ Banner"/>

</div>

<div align="center">

[![API Status](https://img.shields.io/badge/API-Live-22c55e?style=flat-square)](https://babyapi.pro)
[![Version](https://img.shields.io/badge/Portal-v1.0-6366f1?style=flat-square)](https://babiesiq.tech)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Telegram](https://img.shields.io/badge/Community-Telegram-2CA5E0?style=flat-square&logo=telegram)](https://t.me/babiesiq)

**Portal:** [babiesiq.tech](https://babiesiq.tech) &nbsp;·&nbsp; **API Base:** `https://api.babiesiq.tech` &nbsp;·&nbsp; **Docs:** [babiesiq.tech/docs](https://babiesiq.tech/docs) &nbsp;·&nbsp; **Status:** [babyapi.pro](https://babyapi.pro)

</div>

---

## What is BabiesIQ?

BabiesIQ is a **developer-first REST API** for streaming and downloading YouTube media — audio, video, thumbnails — with built-in EQ processing, one-time secure stream tokens, Telegram CDN delivery, and usage metering.

**This repository** is the **developer portal and SDK monorepo** — the web dashboard at [babiesiq.tech](https://babiesiq.tech) where developers sign up, manage API keys, monitor usage, and handle billing. It also ships the official client SDKs for JavaScript/TypeScript, Python, Go, and PHP.

The backend API server lives at → [`BabiesIQ/BabiesIQ_API`](https://github.com/BabiesIQ/BabiesIQ_API) (Go + Gin + MongoDB + Redis + yt-dlp + ffmpeg).

---

## Features

| | |
|---|---|
| 🎵 **Audio Streaming** | MP3 / M4A / Opus / WebM · search query or YouTube URL |
| 🎬 **Video Streaming** | HD / 4K · search query or YouTube URL |
| 🔍 **Search** | Structured JSON results from any YouTube search |
| 🎛️ **EQ Presets** | 30+ presets — bass boost, nightcore, 8D, lofi, slowed + reverb … |
| ⏩ **Seek** | Start audio/video from any timestamp (seconds) |
| 🔐 **Secure Tokens** | Every stream URL is one-time-use and user-scoped |
| 🖼️ **Thumbnail Generator** | 20 stylised designs, Python-powered |
| 📊 **Usage Dashboard** | Real-time request tracking, daily limits, plan overview |
| 💳 **Billing** | Plan upgrades via Razorpay (INR) |
| 📦 **4 Official SDKs** | JavaScript/TypeScript, Python, Go, PHP |

---

## Authentication

Every request to `/api/*` requires your API key. Pass it in **any one** of these ways:

```
X-API-Key: biq_YOUR_KEY            ← recommended header
Authorization: Bearer biq_YOUR_KEY ← Bearer token header
?api=biq_YOUR_KEY                  ← query param (note: "api", not "api_key")
```

Get your key: [babiesiq.tech](https://babiesiq.tech/signup) → Dashboard → **API Keys** → Generate

---

## Quick Start

### 1. Search for a song

Search is a `POST` request with a JSON body:

```bash
curl -X POST "https://api.babiesiq.tech/api/search" \
  -H "X-API-Key: biq_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "Tum Hi Ho"}'
```

**Response:**
```json
{
  "status": "ok",
  "type": "search",
  "query": "Tum Hi Ho",
  "video": [
    {
      "id": "ijpef0hzTpk",
      "title": "Tum Hi Ho - Aashiqui 2",
      "channel": "T-Series",
      "duration": 268,
      "thumbnail": "https://i.ytimg.com/vi/ijpef0hzTpk/hqdefault.jpg"
    }
  ]
}
```

---

### 2. Get an audio stream

```bash
curl "https://api.babiesiq.tech/api/song?query={vidid}" \
  -H "X-API-Key: biq_YOUR_KEY"
```

**Response:**
```json
{
  "status": "ok",
  "type": "audio",
  "query": "{vidid}",
  "stream_id": "abc123xyz",
  "stream": "https://api.babiesiq.tech/api/stream/abc123xyz?token=ONE_TIME_TOKEN&download=false"
}
```

> The `stream` URL is a **one-time secure link** — play or download it directly. It is user-scoped and expires after use.

**With EQ preset** (bass boost, nightcore, lofi, 8d_audio, slowed_reverb …):

```bash
curl "https://api.babiesiq.tech/api/song?query={vidid}&eq=bass_boost" \
  -H "X-API-Key: biq_YOUR_KEY"
```

**Start from timestamp** (seek to 90 seconds):

```bash
curl "https://api.babiesiq.tech/api/song?query={vidid}&seek=90" \
  -H "X-API-Key: biq_YOUR_KEY"
```

**Download instead of stream:**

```bash
curl "https://api.babiesiq.tech/api/song?query=Tum+Hi+Ho&download=true" \
  -H "X-API-Key: biq_YOUR_KEY"
```

---

### 3. Get a video stream

Works identically to audio — returns a one-time stream URL:

```bash
curl "https://api.babiesiq.tech/api/video?query={vidid}" \
  -H "X-API-Key: biq_YOUR_KEY"
```

**Response:**
```json
{
  "status": "ok",
  "type": "video",
  "query": "https://youtu.be/dQw4w9WgXcQ",
  "stream_id": "vid_abc456",
  "stream": "https://api.babiesiq.tech/api/stream/vid_abc456?token=ONE_TIME_TOKEN&download=false"
}
```

---

### 4. Generate a thumbnail

```bash
curl "https://api.babiesiq.tech/api/thumbnail?vidid=dQw4w9WgXcQ&title=Never+Gonna+Give+You+Up&channel=RickAstley&duration=213&views=1.5B" \
  -H "X-API-Key: biq_YOUR_KEY"
```

Check generation status:

```bash
curl "https://api.babiesiq.tech/api/thumbnail/status?vidid=dQw4w9WgXcQ" \
  -H "X-API-Key: biq_YOUR_KEY"
```

Serve the finished file:

```bash
curl "https://api.babiesiq.tech/api/thumbnail/file?vidid=dQw4w9WgXcQ&v=3" \
  -H "X-API-Key: biq_YOUR_KEY" -o thumbnail.jpg
```

---

### 5. Health check (no auth)

```bash
curl "https://api.babiesiq.tech/health"
# {"status":"ok","version":"2.0"}
```

---

## API Reference

### Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/search` | ✅ | Search YouTube |
| `GET` | `/api/song` | ✅ | Get audio stream token |
| `GET` | `/api/video` | ✅ | Get video stream token |
| `GET` | `/api/stream/:id` | token | Play CDN stream by ID |
| `GET` | `/api/thumbnail` | ✅ | Start thumbnail generation (20 designs) |
| `GET` | `/api/thumbnail/status` | ✅ | Poll thumbnail status |
| `GET` | `/api/thumbnail/file` | ✅ | Download finished thumbnail |
| `GET` | `/health` | ❌ | API health check |

### Parameters — `/api/song` and `/api/video`

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | ✅ | YouTube URL **or** search term |
| `eq` | string | ❌ | EQ preset name (forces download=false) |
| `download` | `true`/`false` | ❌ | Return download link instead of stream |
| `seek` | number | ❌ | Start timestamp in seconds |

### Parameters — `/api/search`

JSON body: `{ "query": "..." }`

### Parameters — `/api/thumbnail`

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `vidid` | string | ✅ | YouTube video ID |
| `title` | string | ❌ | Video title |
| `duration` | string | ❌ | Duration label |
| `views` | string | ❌ | Views count label |
| `channel` | string | ❌ | Channel name |
| `brand` | string | ❌ | Brand/watermark text |

### EQ Presets

`bass_boost` · `treble_boost` · `nightcore` · `8d_audio` · `lofi` · `slowed_reverb` · `vaporwave` · `pop` · `rock` · `acoustic` · `classical` · `jazz` · `metal` · `r&b` · `electronic` · and more — full list at [babiesiq.tech/docs](https://babiesiq.tech/docs)

### Response — Audio / Video

```json
{
  "status": "ok",
  "type": "audio",
  "query": "...",
  "stream_id": "...",
  "stream": "https://api.babiesiq.tech/api/stream/ID?token=...&download=false"
}
```

For live streams: `"type": "live"` — the `stream` field returns the stream ID directly.

### Error Format

```json
{ "error": "Description of what went wrong" }
```

Common HTTP codes: `400` bad params · `401` missing/invalid key · `403` key not active · `429` daily limit hit · `5xx` server error (auto-retried by SDKs)

---

## SDKs

All official SDKs live in `sdk/` in this repo.

### JavaScript / TypeScript

```bash
npm install @babiesiq/sdk
```

```typescript
import { BabiesIQ } from "@babiesiq/sdk";

const client = new BabiesIQ({ apiKey: "biq_YOUR_KEY" });

// Search
const results = await client.search.query("Tum Hi Ho");

// Audio
const song = await client.songs.search("Tum Hi Ho");
console.log(song.stream_url);   // ready-to-play URL

// Audio with EQ + seek
const bass = await client.songs.get("VIDEO_ID", { eq: "bass_boost" });

// Video
const video = await client.videos.get("VIDEO_ID");

// Thumbnail
const thumb = await client.thumbnails.get("VIDEO_ID");
console.log(thumb.url);
```

> Source: [`sdk/javascript/`](./sdk/javascript/) · [README](./sdk/javascript/README.md)

---

### Python

```bash
pip install biq-api
```

```python
from biq_api import BabiesIQ

client = BabiesIQ(api_key="biq_YOUR_KEY")

# Search
results = client.search.query("Tum Hi Ho")

# Audio stream
song = client.songs.search("Tum Hi Ho")
print(song.stream_url)

# Audio with EQ
bass = client.songs.get("VIDEO_ID", eq="bass_boost")

# Video
video = client.videos.get("VIDEO_ID")

# Thumbnail
thumb = client.thumbnails.get("VIDEO_ID")
```

> Source: [`sdk/python/`](./sdk/python/) · [README](./sdk/python/README.md)

---

### Go

```bash
go get github.com/BabiesIQ/sdk-go
```

```go
package main

import (
    "fmt"
    babiesiq "github.com/BabiesIQ/sdk-go"
)

func main() {
    client := babiesiq.NewClient("biq_YOUR_KEY")

    // Search
    results, _ := client.Search.Query("Tum Hi Ho")
    fmt.Println(results)

    // Audio
    song, _ := client.Songs.Search("Tum Hi Ho")
    fmt.Println(song.StreamURL)

    // Video
    video, _ := client.Videos.Get("VIDEO_ID", nil)
    fmt.Println(video.StreamURL)
}
```

> Source: [`sdk/go/`](./sdk/go/) · [README](./sdk/go/README.md)

---

### PHP

```bash
composer require babiesiq/sdk
```

```php
use BabiesIQ\BabiesIQ;

$client = new BabiesIQ('biq_YOUR_KEY');

// Search
$results = $client->search->query('Tum Hi Ho');

// Audio
$song = $client->songs->search('Tum Hi Ho');
echo $song->stream_url;

// Video
$video = $client->videos->get('VIDEO_ID');

// Thumbnail
$thumb = $client->thumbnails->get('VIDEO_ID');
```

> Source: [`sdk/php/`](./sdk/php/) · [README](./sdk/php/README.md)

---

## Plans & Limits

| Plan | Daily Requests | Notes |
|---|---|---|
| **Free** | 500 req/day | All endpoints, all EQ presets |
| **Starter** | Higher | Priority processing queue |
| **Pro** | Higher | Faster CDN, all features |
| **Enterprise** | Custom | Dedicated support, custom SLA |

Upgrade anytime → [babiesiq.tech/pricing](https://babiesiq.tech/pricing)

---

## Portal Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Routing | TanStack Router v1 |
| Data Fetching | TanStack Query v5 |
| UI | shadcn/ui + Radix UI |
| Styling | Tailwind CSS v3 |
| Animations | Motion (Framer Motion v12) |
| State | Zustand |
| Forms | React Hook Form + Zod v4 |
| Charts | Recharts |
| i18n | i18next + react-i18next |
| 3D | Three.js + React Three Fiber |
| Payments | Razorpay (INR) |
| Deployment | Netlify |

---

## Local Development

### Prerequisites

- Node.js ≥ 20 · pnpm ≥ 9 (or npm ≥ 10)
- A running [`BabiesIQ_API`](https://github.com/BabiesIQ/BabiesIQ_API) backend

### Setup

```bash
git clone https://github.com/BabiesIQ/_metaAPI.git
cd _metaAPI
npm install
cp env.json.example env.json   # set BACKEND_URL to your local API
npm run dev                     # → http://localhost:5173
```

### Scripts

```bash
npm run build       # production build → dist/
npm run typecheck   # TypeScript check (no emit)
npm run check       # Biome lint
npm run fix         # Biome auto-fix
```

---

## Deployment

**Netlify (automatic)** — every push to `main` triggers a build:

```
Build command : npm run build
Publish dir   : dist/
```

SPA routing: handled by [`netlify.toml`](./netlify.toml) and [`public/_redirects`](./public/_redirects).

**Other platforms** — this is a standard Vite static build:

```bash
npm run build
# Upload dist/ to Vercel, Cloudflare Pages, GitHub Pages, nginx, etc.
```

---

## Contributing

```bash
git checkout -b feature/your-feature
npm run dev          # start dev server
npm run check        # lint
npm run typecheck    # type check
# open a PR against main
```

For SDK contributions see individual READMEs in `sdk/`. For bugs and feature requests, open an [issue](https://github.com/BabiesIQ/_metaAPI/issues) or reach out on [Telegram](https://t.me/babiesiq).

---

## Links

| | |
|---|---|
| 🌐 **Portal** | [babiesiq.tech](https://babiesiq.tech) |
| 📚 **API Docs** | [babiesiq.tech/docs](https://babiesiq.tech/docs) |
| 📦 **SDK Page** | [babiesiq.tech/sdk](https://babiesiq.tech/sdk) |
| 💰 **Pricing** | [babiesiq.tech/pricing](https://babiesiq.tech/pricing) |
| 📡 **API Status** | [babyapi.pro](https://babyapi.pro) |
| 💬 **Telegram** | [@babiesiq](https://t.me/babiesiq) |
| 🐛 **Issues** | [github.com/BabiesIQ/_metaAPI/issues](https://github.com/BabiesIQ/_metaAPI/issues) |
| ⚙️ **API Server** | [github.com/BabiesIQ/BabiesIQ_API](https://github.com/BabiesIQ/BabiesIQ_API) |

---

<div align="center">

Made with ❤️ by the BabiesIQ team &nbsp;·&nbsp; MIT License

[![API](https://img.shields.io/badge/babyapi.pro-Live-22c55e?style=flat-square)](https://babyapi.pro)
[![Telegram](https://img.shields.io/badge/@BabiesIQ-2CA5E0?style=flat-square&logo=telegram&logoColor=white)](https://t.me/babiesiq)
[![GitHub](https://img.shields.io/badge/BabiesIQ%2F__metaAPI-181717?style=flat-square&logo=github)](https://github.com/BabiesIQ/_metaAPI)

</div>
