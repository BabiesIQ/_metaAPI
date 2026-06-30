<div align="center">

<img src="https://raw.githubusercontent.com/BabiesIQ/_metaAPI/main/assets/banner.svg" width="100%" alt="BabiesIQ Banner"/>

</div>

<div align="center">

[![API Status](https://img.shields.io/badge/API-Live-22c55e?style=flat-square)](https://api.babiesiq.tech)
[![Version](https://img.shields.io/badge/Portal-v1.0-6366f1?style=flat-square)](https://babiesiq.tech)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Telegram](https://img.shields.io/badge/Support-@BabiesIQ-2CA5E0?style=flat-square&logo=telegram&logoColor=white)](https://t.me/BabiesIQ)

**Portal:** [babiesiq.tech](https://babiesiq.tech) &nbsp;·&nbsp; **API Base:** `https://api.babiesiq.tech` &nbsp;·&nbsp; **Docs:** [babiesiq.tech/docs](https://babiesiq.tech/docs)

</div>

---

## What is BabiesIQ?

**BabiesIQ** is a **developer-first tech & coding community** founded in **2019**, focused on building modern developer tools, open-source projects, and high-performance APIs.

Our flagship product, **_metaAPI**, is a powerful streaming platform that provides fast media streaming, secure delivery, and developer-friendly REST APIs. Alongside our products, BabiesIQ regularly shares coding tips, backend architecture guides, API integrations, DevOps practices, and real-world engineering knowledge to help developers build scalable applications.

**This repository** serves as the official **developer portal and SDK monorepo**, powering the web dashboard at **https://babiesiq.tech**, where developers can create projects, generate API keys, monitor usage, manage billing, and access documentation. It also includes the official SDKs for JavaScript/TypeScript, Python, Go, and PHP.

Beyond APIs, BabiesIQ actively welcomes **developer collaborations**, open-source contributions, technical partnerships, and community-driven innovation to build the next generation of developer tools together.

---

## Features

| | |
|---|---|
| <img src="https://cdn.simpleicons.org/soundcloud/ff7700" height="16" align="absmiddle"/> **Audio Streaming** | MP3 / M4A / Opus / WebM · search query or YouTube URL |
| <img src="https://cdn.simpleicons.org/youtube/FF0000" height="16" align="absmiddle"/> **Video Streaming** | HD / 4K · search query or YouTube URL |
| <img src="https://cdn.simpleicons.org/algolia/003DFF" height="16" align="absmiddle"/> **Search** | Structured JSON results from any YouTube search |
| <img src="https://cdn.simpleicons.org/audacity/0000CC" height="16" align="absmiddle"/> **EQ Presets** | 30+ presets — bass boost, nightcore, 8D, lofi, slowed + reverb … |
| <img src="https://cdn.simpleicons.org/ffmpeg/007808" height="16" align="absmiddle"/> **Seek** | Start audio/video from any timestamp (seconds) |
| <img src="https://cdn.simpleicons.org/letsencrypt/003A70" height="16" align="absmiddle"/> **Secure Tokens** | Every stream URL is one-time-use and user-scoped |
| <img src="https://cdn.simpleicons.org/canva/00C4CC" height="16" align="absmiddle"/> **Thumbnail Generator** | 20 stylised designs, Python-powered |
| <img src="https://cdn.simpleicons.org/grafana/F46800" height="16" align="absmiddle"/> **Usage Dashboard** | Real-time request tracking, daily limits, plan overview |
| <img src="https://cdn.simpleicons.org/razorpay/02042B" height="16" align="absmiddle"/> **Billing** | Plan upgrades via Razorpay (INR) |
| <img src="https://cdn.simpleicons.org/npm/CB3837" height="16" align="absmiddle"/> **4 Official SDKs** | JavaScript/TypeScript, Python, Go, PHP |

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
| `channel` | string | ❌ | Channel name |
| `duration` | string | ❌ | Duration label |
| `views` | string | ❌ | View count label |
| `brand` | string | ❌ | Brand/watermark override |

---

## SDKs

### <img src="https://cdn.simpleicons.org/javascript/F7DF1E" height="18" align="absmiddle"/> <img src="https://cdn.simpleicons.org/typescript/3178C6" height="18" align="absmiddle"/> JavaScript / TypeScript

```bash
npm install @babiesiq/sdk
```

```ts
import { BabiesIQ } from '@babiesiq/sdk';

const client = new BabiesIQ('biq_YOUR_KEY');

// Search
const results = await client.search.query('Tum Hi Ho');

// Audio stream
const song = await client.songs.search('Tum Hi Ho');
console.log(song.streamUrl);

// Video stream
const video = await client.videos.get('VIDEO_ID');

// Thumbnail
const thumb = await client.thumbnails.get('VIDEO_ID');
```

> Source: [`sdk/js/`](./sdk/js/) · [README](./sdk/js/README.md)

---

### <img src="https://cdn.simpleicons.org/python/3776AB" height="18" align="absmiddle"/> Python

```bash
pip install biq-api
```

```python
from babiesiq import BabiesIQ

client = BabiesIQ("biq_YOUR_KEY")

# Search
results = client.search.query("Tum Hi Ho")

# Audio
song = client.songs.search("Tum Hi Ho")
print(song.stream_url)

# Video
video = client.videos.get("VIDEO_ID")

# Thumbnail
thumb = client.thumbnails.get("VIDEO_ID")
```

> Source: [`sdk/python/`](./sdk/python/) · [README](./sdk/python/README.md)

---

### <img src="https://cdn.simpleicons.org/go/00ADD8" height="18" align="absmiddle"/> Go

```bash
go get github.com/babiesiq/sdk-go
```

```go
package main

import (
    "fmt"
    biq "github.com/babiesiq/sdk-go"
)

func main() {
    client := biq.NewClient("biq_YOUR_KEY")

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

### <img src="https://cdn.simpleicons.org/php/777BB4" height="18" align="absmiddle"/> PHP

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

## Deploy

One-click deploy to your preferred platform:

<div align="center">

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/BabiesIQ/_metaAPI)
&nbsp;&nbsp;
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FBabiesIQ%2F_metaAPI)
&nbsp;&nbsp;
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/BabiesIQ/_metaAPI)
&nbsp;&nbsp;
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/BabiesIQ/_metaAPI)

<br/>

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/BabiesIQ/_metaAPI)
&nbsp;&nbsp;
[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&repository=github.com/BabiesIQ/_metaAPI&branch=main&name=babiesiq-portal)

</div>

> **Note:** This is the **developer portal** (React + Vite frontend). For the backend API server, see [`BabiesIQ/BabiesIQ_API`](https://github.com/BabiesIQ/BabiesIQ_API).

**Platform notes:**

| Platform | Build Command | Publish Dir | Notes |
|---|---|---|---|
| **Netlify** | `npm run build` | `dist/` | Auto-deploys on push to `main` · SPA via `netlify.toml` |
| **Vercel** | `npm run build` | `dist/` | Set Framework preset = Vite |
| **Railway** | `npm run build` | `dist/` | Add static file server |
| **Render** | `npm run build` | `dist/` | Choose Static Site type |
| **Heroku** | `npm run build` | — | Use `heroku-buildpack-static` |
| **Koyeb** | `npm run build` | `dist/` | Static deployment |

SPA routing is handled by [`netlify.toml`](./netlify.toml) and [`public/_redirects`](./public/_redirects) — copy the `_redirects` rule to your platform's equivalent if needed.

---

## Contributing

```bash
git checkout -b feature/your-feature
npm run dev          # start dev server
npm run check        # lint
npm run typecheck    # type check
# open a PR against main
```

For SDK contributions see individual READMEs in `sdk/`. For bugs and feature requests, open an [issue](https://github.com/BabiesIQ/_metaAPI/issues) or reach out on [Telegram](https://t.me/BabiesIQ).

---

## Links

| | |
|---|---|
| <img src="https://cdn.simpleicons.org/googlechrome/4285F4" height="16" align="absmiddle"/> **Portal** | [babiesiq.tech](https://babiesiq.tech) |
| <img src="https://cdn.simpleicons.org/gitbook/3884FF" height="16" align="absmiddle"/> **API Docs** | [babiesiq.tech/docs](https://babiesiq.tech/docs) |
| <img src="https://cdn.simpleicons.org/npm/CB3837" height="16" align="absmiddle"/> **SDK Page** | [babiesiq.tech/sdk](https://babiesiq.tech/sdk) |
| <img src="https://cdn.simpleicons.org/razorpay/02042B" height="16" align="absmiddle"/> **Pricing** | [babiesiq.tech/pricing](https://babiesiq.tech/pricing) |
| <img src="https://cdn.simpleicons.org/telegram/2CA5E0" height="16" align="absmiddle"/> **Telegram** | [@BabiesIQ](https://t.me/BabiesIQ) |
| <img src="https://cdn.simpleicons.org/github/181717" height="16" align="absmiddle"/> **Issues** | [github.com/BabiesIQ/_metaAPI/issues](https://github.com/BabiesIQ/_metaAPI/issues) |
| <img src="https://cdn.simpleicons.org/go/00ADD8" height="16" align="absmiddle"/> **API Server** | [github.com/BabiesIQ/BabiesIQ_API](https://github.com/BabiesIQ/BabiesIQ_API) |

---

<div align="center">

Made with ❤️ by the BabiesIQ team &nbsp;·&nbsp; MIT License

[![Telegram](https://img.shields.io/badge/@BabiesIQ-2CA5E0?style=flat-square&logo=telegram&logoColor=white)](https://t.me/BabiesIQ)
[![GitHub](https://img.shields.io/badge/BabiesIQ%2F__metaAPI-181717?style=flat-square&logo=github)](https://github.com/BabiesIQ/_metaAPI)

</div>
