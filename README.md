<div align="center">

<img src="https://babiesiq.tech/favicon.ico" width="64" alt="BabiesIQ Logo" />

# BabiesIQ — Media Streaming API Platform

**YouTube Audio · Video · Search · EQ Presets · CLI · Multi-language SDKs**

[![API Status](https://img.shields.io/badge/API-Live-22c55e?style=for-the-badge)](https://babyapi.pro)&nbsp;[![Version](https://img.shields.io/badge/v1.0.0-stable-6366f1?style=for-the-badge)](https://babiesiq.tech)&nbsp;[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)&nbsp;[![Developers](https://img.shields.io/badge/300K%2B-Developers-f59e0b?style=for-the-badge)](https://babiesiq.tech)

**Dashboard:** [babiesiq.tech](https://babiesiq.tech) &nbsp;|&nbsp; **API Base:** `https://api.babiesiq.tech` &nbsp;|&nbsp; **Docs:** [babiesiq.tech/docs](https://babiesiq.tech/docs)

</div>

---

## What is BabiesIQ?

BabiesIQ is a **developer-first media streaming API** that gives you:

- 🎵 **Audio streaming** — high-quality MP3/AAC/FLAC/Opus from any YouTube URL or search query
- 🎬 **Video streaming** — HD/4K video with format & codec control
- 🔍 **Search API** — structured JSON results from YouTube search
- 🎛️ **EQ Presets** — 30+ equalizer presets (bass boost, nightcore, 8D, lofi, slowed + reverb…)
- ⏩ **Seek & clip** — start from any timestamp, cut any duration
- 🖥️ **CLI tool** — download audio/video directly from the terminal
- 📦 **4 SDKs** — Python, JavaScript/TypeScript, Go, PHP

No scraping. No bots. Just a clean REST API — get your key, make a request, get your stream.

---

## Quick Start — 60 seconds

### 1. Get a free API key

[Sign up at babiesiq.tech](https://babiesiq.tech/signup) → Dashboard → API Keys → Generate

### 2. Make your first request

```bash
# Search for a song
curl "https://api.babiesiq.tech/media/search?q=Tum+Hi+Ho" \
  -H "X-API-Key: YOUR_KEY"

# Stream audio (returns MP3)
curl "https://api.babiesiq.tech/media/song?q=Tum+Hi+Ho&quality=high" \
  -H "X-API-Key: YOUR_KEY" -o song.mp3

# Get a video
curl "https://api.babiesiq.tech/media/video?q=https://youtu.be/ID&quality=720p" \
  -H "X-API-Key: YOUR_KEY" -o video.mp4
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/media/song` | GET | Audio stream / download |
| `/media/video` | GET | Video stream / download |
| `/media/search` | GET | Search YouTube |
| `/media/thumbnail` | GET | Thumbnail image |
| `/media/formats` | GET | Available quality formats |
| `/media/meta` | GET | Metadata only (coming soon) |

**Authentication:** `X-API-Key: YOUR_KEY` header **or** `?api_key=YOUR_KEY` query param

➡️ **Full API docs with all parameters:** [babiesiq.tech/docs](https://babiesiq.tech/docs)

---

## SDKs

Install in your language of choice:

### Python

```bash
pip install biq-api
```

```python
from babiesiq import BabiesIQClient

client = BabiesIQClient(api_key="YOUR_KEY")
results = client.search("Tum Hi Ho")
url = client.get_stream_url("Tum Hi Ho", quality="high")
print(url)
```

### JavaScript / TypeScript

```bash
npm install babiesiq
```

```typescript
import { BabiesIQClient } from "babiesiq";

const client = new BabiesIQClient({ apiKey: "YOUR_KEY" });
const results = await client.search("Tum Hi Ho");
const url = await client.getStreamUrl("Tum Hi Ho", { quality: "high" });
console.log(url);
```

### Go

```bash
go get github.com/BabiesIQ/babiesiq-sdk-go
```

```go
import babiesiq "github.com/BabiesIQ/babiesiq-sdk-go"

client := babiesiq.NewClient("YOUR_KEY")
results, _ := client.Search("Tum Hi Ho")
url, _ := client.GetStreamURL("Tum Hi Ho", babiesiq.Quality("high"))
fmt.Println(url)
```

### PHP

```bash
composer require babiesiq/babiesiq-php
```

```php
use BabiesIQ\BabiesIQClient;

$client = new BabiesIQClient('YOUR_KEY');
$results = $client->search('Tum Hi Ho');
$url = $client->getStreamUrl('Tum Hi Ho', ['quality' => 'high']);
echo $url;
```

---

## CLI Tool

```bash
# Install
go install github.com/BabiesIQ/web/cli@latest

# Configure
babiesiq configure --api-key YOUR_KEY

# Download audio
babiesiq song "Tum Hi Ho" --quality high --format mp3

# Download video
babiesiq video "https://youtu.be/ID" --quality 720p

# Search
babiesiq search "Arijit Singh" --limit 5
```

---

## Plans

| Plan | API calls/day | Price |
|------|--------------|-------|
| **Free** | 500 | ₹0 forever |
| **Pro** | 2,500 | ₹49/mo |
| **Business** | 10,000 | ₹149/mo |
| **Enterprise** | Unlimited | Custom |

[See full pricing →](https://babiesiq.tech/pricing)

---

## Repository Structure

```
BabiesIQ/web/
│
├── src/                        # React + Vite frontend (TypeScript)
│   ├── pages/                  # Route-level page components
│   │   ├── Home.tsx            # Landing page
│   │   ├── Docs.tsx            # Full API documentation
│   │   ├── Sdk.tsx             # SDK landing page (/sdk)
│   │   ├── Pricing.tsx         # Pricing plans
│   │   ├── Contact.tsx         # Contact form
│   │   ├── Login.tsx           # Auth — login
│   │   ├── Signup.tsx          # Auth — register
│   │   ├── Dashboard.tsx       # User dashboard
│   │   └── admin/              # Admin panel pages
│   ├── components/             # Shared UI components
│   │   ├── Header.tsx          # Navigation bar
│   │   ├── Footer.tsx          # Footer with newsletter
│   │   ├── Layout.tsx          # Page wrapper
│   │   ├── TryItWidget.tsx     # Live API demo widget
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Utility libraries
│   │   ├── api.ts              # API client (axios/fetch)
│   │   ├── config.ts           # Runtime config loader
│   │   ├── i18n.ts             # Internationalization (EN, HI, KO, ZH)
│   │   └── domain-verify.ts    # Deployment authorization
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # Zustand state management
│   └── App.tsx                 # Router setup (TanStack Router)
│
├── sdk/                        # Official SDKs (open source)
│   ├── python/                 # biq-api — pip install biq-api
│   │   ├── babiesiq/           # Package source
│   │   └── pyproject.toml
│   ├── javascript/             # babiesiq — npm install babiesiq
│   │   ├── src/
│   │   └── package.json
│   ├── go/                     # go get github.com/BabiesIQ/babiesiq-sdk-go
│   │   ├── babiesiq.go
│   │   └── go.mod
│   └── php/                    # babiesiq/babiesiq-php — composer require
│       ├── src/
│       └── composer.json
│
├── cli/                        # BabiesIQ CLI (Go)
│   ├── main.go
│   └── go.mod
│
├── dist/                       # Pre-built static site (served by server.js)
│   ├── index.html
│   └── assets/
│
├── server.js                   # Express static file server + self-ping keep-alive
├── index.html                  # Vite entry point
├── vite.config.js              # Vite build config
├── tailwind.config.js          # Tailwind CSS config
├── package.json                # npm dependencies
└── caffeine.toml               # Build manifest (assets deployment)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 5 |
| **Routing** | TanStack Router |
| **Styling** | Tailwind CSS v3, shadcn/ui, Radix UI |
| **Animation** | Motion (Framer Motion) |
| **State** | Zustand, TanStack Query |
| **i18n** | i18next (English, Hindi, Korean, Chinese) |
| **Charts** | Recharts |
| **Server** | Express.js (static file server) |
| **Build** | Vite + esbuild |

---

## Run Locally

```bash
# Clone
git clone https://github.com/BabiesIQ/web.git
cd web

# Install dependencies
npm install

# Set backend URL (optional — defaults to api.babiesiq.tech)
echo '{ "BACKEND_BASE_URL": "https://api.babiesiq.tech" }' > public/config.json

# Dev server
npm run dev
# → Opens http://localhost:5173

# Or build and serve (production mode)
npm run build
npm start
# → Opens http://localhost:3000
```

**Environment variables (optional):**

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `BACKEND_BASE_URL` | `https://api.babiesiq.tech` | Backend API URL |
| `WEBSITE_MODE` | `live` | `live` or `test` |
| `APP_URL` | auto-detect | Public URL for self-ping keep-alive |

---

## Deploy

The repo includes config files for all major platforms — pick any:

### One-click deploys

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/BabiesIQ/web)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/babiesiq)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/BabiesIQ/web)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/BabiesIQ/web)

[![Deploy to Vercel](https://img.shields.io/badge/▲_Deploy_to_Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/BabiesIQ/web)
[![Deploy to Koyeb](https://img.shields.io/badge/Deploy_to_Koyeb-121212?style=for-the-badge)](https://app.koyeb.com/deploy?type=git&repository=github.com/BabiesIQ/web&branch=main&name=babiesiq-web)

### Platform configs included

| File | Platform |
|------|----------|
| `Procfile` | Heroku |
| `railway.json` + `nixpacks.toml` | Railway |
| `netlify.toml` | Netlify |
| `vercel.json` | Vercel |
| `app.json` | Heroku app manifest |
| `.replit` | Replit |
| `server.js` | Any Node.js host |

> **Note:** `dist/` is pre-built and committed. Most platforms (Railway, Render, Koyeb) can serve it directly without a build step — just `npm install --omit=dev && npm start`.

### VPS (Ubuntu/Debian)

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# Clone + install
git clone https://github.com/BabiesIQ/web.git
cd web && npm install --omit=dev

# Run with PM2
npm i -g pm2
pm2 start server.js --name babiesiq
pm2 startup && pm2 save

# Nginx reverse proxy
sudo nano /etc/nginx/sites-available/babiesiq
```

```nginx
server {
    listen 80;
    server_name babiesiq.tech www.babiesiq.tech;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/babiesiq /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Free SSL
sudo certbot --nginx -d babiesiq.tech -d www.babiesiq.tech
```

---

## Self-Ping Keep-Alive

`server.js` includes a built-in **anti-sleep self-ping** that pings `/ping` every 14 minutes to prevent free-tier sleep on Render, Railway, etc.

Auto-detects your platform URL. Override with:
```bash
APP_URL=https://your-app.onrender.com npm start
```

---

## Contributing

1. Fork → `git checkout -b feature/my-feature`
2. Make changes in `src/`
3. `npm run dev` to test locally
4. `npm run build` to verify build
5. Open a Pull Request

For SDK contributions, see the individual README files in `sdk/python/`, `sdk/javascript/`, `sdk/go/`, `sdk/php/`.

---

## Links

| | |
|---|---|
| 🌐 Website | [babiesiq.tech](https://babiesiq.tech) |
| 📚 API Docs | [babiesiq.tech/docs](https://babiesiq.tech/docs) |
| 📦 SDK Page | [babiesiq.tech/sdk](https://babiesiq.tech/sdk) |
| 💰 Pricing | [babiesiq.tech/pricing](https://babiesiq.tech/pricing) |
| 💬 Telegram | [@babiesiq](https://t.me/babiesiq) |
| 🐛 Issues | [github.com/BabiesIQ/web/issues](https://github.com/BabiesIQ/web/issues) |
| 📡 API Status | [babyapi.pro](https://babyapi.pro) |

---

<div align="center">

Made with ❤️ by the BabiesIQ team &nbsp;·&nbsp; MIT License

[![API](https://img.shields.io/badge/babyapi.pro-Live-22c55e?style=flat-square)](https://babyapi.pro)&nbsp;[![Telegram](https://img.shields.io/badge/@BabiesIQ-2CA5E0?style=flat-square&logo=telegram&logoColor=white)](https://t.me/babiesiq)&nbsp;[![GitHub](https://img.shields.io/badge/BabiesIQ%2Fweb-181717?style=flat-square&logo=github)](https://github.com/BabiesIQ/web)

</div>
