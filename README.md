<div align="center">

<img src="https://babiesiq.tech/favicon.ico" width="72" alt="BabiesIQ Logo" />

# BabiesIQ

### Developer-First YouTube Media Streaming API

**Audio · Video · Search · EQ Presets · Thumbnails · Multi-language SDKs**

[![API Status](https://img.shields.io/badge/API-Live-22c55e?style=flat-square)](https://babyapi.pro)
[![Version](https://img.shields.io/badge/Portal-v1.0-6366f1?style=flat-square)](https://babiesiq.tech)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Telegram](https://img.shields.io/badge/Community-Telegram-2CA5E0?style=flat-square&logo=telegram)](https://t.me/babiesiq)

**Portal:** [babiesiq.tech](https://babiesiq.tech) &nbsp;·&nbsp; **API:** `https://api.babiesiq.tech` &nbsp;·&nbsp; **Docs:** [babiesiq.tech/docs](https://babiesiq.tech/docs) &nbsp;·&nbsp; **Status:** [babyapi.pro](https://babyapi.pro)

</div>

---

## What is BabiesIQ?

BabiesIQ is a **developer-first REST API** for streaming and downloading YouTube media — audio, video, thumbnails — with built-in EQ processing, CDN delivery, and usage metering.

**This repository** is the **developer portal and SDK monorepo** — the web dashboard at [babiesiq.tech](https://babiesiq.tech) where developers sign up, manage API keys, monitor usage, and handle billing. It also ships the official client SDKs for JavaScript/TypeScript, Python, Go, and PHP.

The backend API server lives at → [`BabiesIQ/BabiesIQ_API`](https://github.com/BabiesIQ/BabiesIQ_API) (Go + Gin + MongoDB + Redis + yt-dlp + ffmpeg).

---

## Features

| | |
|---|---|
| 🎵 **Audio Streaming** | High-quality MP3 / M4A / Opus / WebM from any YouTube URL or search query |
| 🎬 **Video Streaming** | HD / 4K video with quality selection (144p → 4K) |
| 🔍 **Search API** | Structured JSON results from YouTube search |
| 🎛️ **EQ Presets** | 30+ equalizer presets — bass boost, nightcore, 8D, lofi, slowed + reverb, and more |
| ⏩ **Seek & Stream** | Start playback from any timestamp |
| 🖼️ **Thumbnail Generator** | 20 stylized thumbnail designs, Python-powered |
| 📊 **Usage Dashboard** | Real-time request tracking, daily limits, plan overview |
| 💳 **Billing** | Plan upgrades via Razorpay (INR), subscription management |
| 🤖 **Telegram Bot** | Admin management + Telegram CDN-backed media delivery |
| 📦 **4 Official SDKs** | JavaScript/TypeScript, Python, Go, PHP — all in this repo |

---

## Quick Start

### 1. Get a Free API Key

[Sign up at babiesiq.tech](https://babiesiq.tech/signup) → Dashboard → **API Keys** → Generate

### 2. Make Your First Request

```bash
# Search for a song
curl "https://api.babiesiq.tech/media/search?q=Tum+Hi+Ho" \
  -H "X-API-Key: biq_YOUR_KEY"

# Stream audio
curl "https://api.babiesiq.tech/media/song?q=Tum+Hi+Ho" \
  -H "X-API-Key: biq_YOUR_KEY" -L -o song.mp3

# Stream video (720p)
curl "https://api.babiesiq.tech/media/video?q=https://youtu.be/VIDEO_ID&quality=720p" \
  -H "X-API-Key: biq_YOUR_KEY" -L -o video.mp4

# Thumbnail (design #3)
curl "https://api.babiesiq.tech/media/thumbnail?id=VIDEO_ID&design=3" \
  -H "X-API-Key: biq_YOUR_KEY" -L -o thumb.jpg
```

**Authentication:** Pass your key as `X-API-Key: biq_YOUR_KEY` header **or** `?api_key=biq_YOUR_KEY` query param.

---

## API Reference

### Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/media/song` | GET | Audio stream or download |
| `/media/video` | GET | Video stream or download |
| `/media/search` | GET | Search YouTube |
| `/media/thumbnail` | GET | Generate stylized thumbnail |
| `/api/stream/:id` | GET | CDN stream by stream ID |
| `/health` | GET | API health check |

### Common Parameters

| Parameter | Type | Description |
|---|---|---|
| `q` | string | YouTube URL or search query |
| `quality` | string | `high`, `medium`, `low` for audio; `144p`–`4K` for video |
| `eq` | string | EQ preset — `bass_boost`, `treble_boost`, `nightcore`, `8d_audio`, `lofi`, `slowed_reverb`, etc. |
| `download` | boolean | Return download URL instead of stream URL |
| `seek` | number | Start timestamp in seconds |

➡️ **Full parameter docs:** [babiesiq.tech/docs](https://babiesiq.tech/docs)

### Response Format

All endpoints return a consistent JSON envelope:

```json
{
  "success": true,
  "data": { ... }
}
```

On error:

```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

---

## SDKs

All official SDKs live in `sdk/` in this repo and share the same API design.

### JavaScript / TypeScript

```bash
npm install @babiesiq/sdk
# or
yarn add @babiesiq/sdk
```

```typescript
import { BabiesIQ } from "@babiesiq/sdk";

const client = new BabiesIQ({ apiKey: "biq_YOUR_KEY" });

// Search
const results = await client.search.query("Tum Hi Ho");

// Get audio stream URL
const song = await client.songs.search("Tum Hi Ho");
console.log(song.stream_url);  // ready to play

// With EQ preset + download link
const bass = await client.songs.get("VIDEO_ID", { eq: "bass_boost", download: false });

// Get video
const video = await client.videos.get("VIDEO_ID", { download: false });

// Thumbnail
const thumb = await client.thumbnails.get("VIDEO_ID");
console.log(thumb.url);
```

> **Source:** [`sdk/javascript/`](./sdk/javascript/) &nbsp;·&nbsp; **SDK README:** [`sdk/javascript/README.md`](./sdk/javascript/README.md)

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

# With EQ preset
song_bass = client.songs.get("VIDEO_ID", eq="bass_boost")

# Video
video = client.videos.get("VIDEO_ID")

# Thumbnail
thumb = client.thumbnails.get("VIDEO_ID")
print(thumb.url)
```

> **Source:** [`sdk/python/`](./sdk/python/) &nbsp;·&nbsp; **SDK README:** [`sdk/python/README.md`](./sdk/python/README.md)

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

    // Audio stream
    song, _ := client.Songs.Search("Tum Hi Ho")
    fmt.Println(song.StreamURL)

    // Video
    video, _ := client.Videos.Get("VIDEO_ID", nil)
    fmt.Println(video.StreamURL)
}
```

> **Source:** [`sdk/go/`](./sdk/go/) &nbsp;·&nbsp; **SDK README:** [`sdk/go/README.md`](./sdk/go/README.md)

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

// Audio stream
$song = $client->songs->search('Tum Hi Ho');
echo $song->stream_url;

// Video
$video = $client->videos->get('VIDEO_ID');

// Thumbnail
$thumb = $client->thumbnails->get('VIDEO_ID');
```

> **Source:** [`sdk/php/`](./sdk/php/) &nbsp;·&nbsp; **SDK README:** [`sdk/php/README.md`](./sdk/php/README.md)

---

## Plans & Limits

| Plan | Daily Requests | Features |
|---|---|---|
| **Free** | 500 req/day | All endpoints, all EQ presets |
| **Starter** | Higher limits | Priority queue |
| **Pro** | Higher limits | Faster CDN, advanced features |
| **Enterprise** | Custom | Dedicated support, custom SLA |

Upgrade anytime from your dashboard → [babiesiq.tech/pricing](https://babiesiq.tech/pricing)

---

## Repository Structure

```
_metaAPI/
├── src/                        # React + TypeScript web portal
│   ├── components/             # Shared UI components (header, footer, layouts)
│   ├── api.ts                  # Backend REST client (auth, profile, billing)
│   └── App.tsx                 # Root app + routing
│
├── sdk/                        # Official client SDKs
│   ├── javascript/             # @babiesiq/sdk — TypeScript/JS SDK
│   ├── python/                 # biq-api — Python SDK (PyPI)
│   ├── go/                     # Go SDK
│   └── php/                    # PHP SDK
│
├── cli/                        # Go-based CLI tool (audio/video downloader)
├── public/                     # Static assets, fonts
├── .github/workflows/          # CI: Netlify deploy + Python SDK publish
├── netlify.toml                # Netlify build & redirect config
└── package.json                # Vite + React 19 project
```

---

## Portal Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Routing | TanStack Router v1 |
| Data Fetching | TanStack Query v5 |
| UI Components | shadcn/ui + Radix UI primitives |
| Styling | Tailwind CSS v3 |
| Animations | Motion (Framer Motion v12) |
| State Management | Zustand |
| Forms & Validation | React Hook Form + Zod |
| Charts | Recharts |
| Internationalization | i18next + react-i18next |
| 3D / WebGL | Three.js + React Three Fiber |
| Auth | Session-based (email + OTP) + Google OAuth |
| Payments | Razorpay (INR) |
| Deployment | Netlify |

---

## Local Development

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (recommended) or npm ≥ 10
- A running instance of [`BabiesIQ_API`](https://github.com/BabiesIQ/BabiesIQ_API) (see its README for setup)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/BabiesIQ/_metaAPI.git
cd _metaAPI

# 2. Install dependencies
npm install

# 3. Configure environment
cp env.json.example env.json
# Edit env.json — set BACKEND_URL to your local API server (e.g. http://localhost:8080)
```

### Run in Development

```bash
npm run dev
# Portal is available at http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output goes to dist/
```

### Other Scripts

```bash
npm run typecheck   # TypeScript type check (no emit)
npm run check       # Biome lint check
npm run fix         # Biome auto-fix
```

---

## Deployment

### Frontend (Netlify) — Automatic

Every push to `main` triggers a Netlify build via GitHub Actions:

```
Build command : npm run build
Publish dir   : dist/
```

Redirects and SPA routing are configured in [`netlify.toml`](./netlify.toml) and [`public/_redirects`](./public/_redirects).

### Alternative Platforms

This is a static Vite build — deploy anywhere that serves static files:

```bash
npm run build
# Upload the dist/ folder to:
# - Vercel, Cloudflare Pages, GitHub Pages, Railway (static), or any nginx/Apache server
```

---

## Backend API Server

The API that powers BabiesIQ's streaming is a separate private repository:

**[→ BabiesIQ/BabiesIQ_API](https://github.com/BabiesIQ/BabiesIQ_API)**

Built with:

- **Go + Gin** — high-performance HTTP server
- **yt-dlp + ffmpeg** — YouTube downloading and audio processing
- **Telegram CDN** — media storage and delivery at scale
- **MongoDB** — user accounts, API keys, usage records
- **MySQL** — billing and payment records
- **Redis** — session store, rate limiting, stream token cache
- **Razorpay** — payment gateway (INR)
- **Brevo** — transactional email (OTP, welcome, billing)
- **Telegram Bot** — admin management, disk/RAM monitoring, DB backups

Deployment: **Railway** · Self-host: see `BabiesIQ_API/start.sh` and `BabiesIQ_API/README.md`

---

## Contributing

We welcome contributions to the portal UI and SDK clients.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
npm run dev          # start dev server
npm run check        # lint before committing
npm run typecheck    # ensure no type errors
```

Open a pull request against `main`.

For **SDK contributions**, see the individual READMEs:
- [`sdk/javascript/README.md`](./sdk/javascript/README.md)
- [`sdk/python/README.md`](./sdk/python/README.md)
- [`sdk/go/README.md`](./sdk/go/README.md)
- [`sdk/php/README.md`](./sdk/php/README.md)

For **bugs and feature requests**, open an [issue](https://github.com/BabiesIQ/_metaAPI/issues) or reach out on [Telegram](https://t.me/babiesiq).

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
