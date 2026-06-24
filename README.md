<div align="center">

# 🎵 BabyAPI — Media Streaming API

**Song · Video · Seek · EQ · Metadata · FFmpeg Quality Control**

[![API Status](https://img.shields.io/badge/API-Live-22c55e?style=for-the-badge&logo=statuspage&logoColor=white)](https://babyapi.pro)&nbsp;[![Version](https://img.shields.io/badge/v1.0.0-stable-6366f1?style=for-the-badge)](https://babyapi.pro)&nbsp;[![FFmpeg](https://img.shields.io/badge/FFmpeg-Powered-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)](https://ffmpeg.org)&nbsp;[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**Website URL:** `https://babiesIQ.Tech`
**Backend URL:** `https://api.babiesIQ.Tech`

</div>

---

## ⚡ Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/media/song` | `GET` | Song stream / download |
| `/media/video` | `GET` | Video stream / download |
| `/media/search` | `GET` | Search songs & videos |
| `/media/meta` | `GET` | Metadata only (no download) <br> <span style="color:red">🚧 Soon Available</span> |
| `/media/thumbnail` | `GET` | Thumbnail image |
| `/media/formats` | `GET` | Available quality formats list |
| `/media/playlist` | `GET` | Playlist info & all tracks <br> <span style="color:red">🚧 Soon Available</span> |
---

## 🔑 Authentication

```http
X-API-Key: YOUR_API_KEY
```
Ya query param: `?api_key=YOUR_API_KEY` — **Key generate karo:** [babiesiq.tech/dashboard/keys](https://babiesiq.tech/dashboard/keys)

---

## 🎵 Song Request — `GET /media/song`

<details>
<summary><b>📋 All Parameters (click to expand)</b></summary>

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `q` | string | ✅ | — | Search query ya direct URL |
| `quality` | string | ❌ | `high` | `low` `medium` `high` `lossless` |
| `format` | string | ❌ | `mp3` | `mp3` `m4a` `ogg` `opus` `flac` |
| `bitrate` | number | ❌ | `320` | `64` `128` `192` `256` `320` (kbps) |
| `seek` | string | ❌ | `0` | Start position — `30` ya `1:30` ya `01:30:00` |
| `duration` | string | ❌ | full | Clip duration — `60` ya `1:00` |
| `eq` | string | ❌ | `flat` | Equalizer preset |
| `eq_args` | string | ❌ | — | Custom EQ — `bass=5,treble=3,mid=-2` |
| `volume` | number | ❌ | `100` | Volume level `1–200` (%) |
| `speed` | number | ❌ | `1.0` | Playback speed `0.5–4.0` |
| `pitch` | number | ❌ | `0` | Pitch shift in semitones `-12` to `+12` |
| `mono` | boolean | ❌ | `false` | Stereo to mono convert |
| `normalize` | boolean | ❌ | `false` | Audio normalize (loudness) |
| `stream` | boolean | ❌ | `false` | Direct stream URL return karo |
| `raw_url` | boolean | ❌ | `false` | Raw CDN URL (no processing) |
| `filename` | string | ❌ | auto | Custom output filename |

</details>

<details>
<summary><b>💡 Examples (click to expand)</b></summary>

```bash
# Basic song download
GET /media/song?q=Kesariya+Arijit+Singh&quality=high&format=mp3

# Direct URL se download
GET /media/song?q=https://youtu.be/dQw4w9WgXcQ&format=m4a&bitrate=256

# Seek 30 sec se start, 60 sec clip lo
GET /media/song?q=Tum+Hi+Ho&seek=0:30&duration=60

# Bass boost ke saath
GET /media/song?q=Raataan+Lambiyan&eq=bass_boost&quality=high

# Custom EQ — bass +8, treble +4, mid -2
GET /media/song?q=Believer+Imagine+Dragons&eq_args=bass=8,treble=4,mid=-2,presence=2

# Slow + pitch down
GET /media/song?q=Aashiqui+2+title+song&speed=0.85&pitch=-2

# Stream URL (bot ke liye)
GET /media/song?q=Tujhe+Kitna+Chahne+Lage&stream=true
```

</details>

---

## 🎬 Video Request — `GET /media/video`

<details>
<summary><b>📋 All Parameters (click to expand)</b></summary>

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `q` | string | ✅ | — | Search query ya direct URL |
| `quality` | string | ❌ | `720p` | `144p` `240p` `360p` `480p` `720p` `1080p` `1440p` `4k` |
| `format` | string | ❌ | `mp4` | `mp4` `webm` `mkv` `mov` |
| `vcodec` | string | ❌ | `h264` | `h264` `h265` `vp9` `av1` |
| `acodec` | string | ❌ | `aac` | `aac` `mp3` `opus` `vorbis` |
| `fps` | number | ❌ | original | Force FPS — `24` `30` `60` |
| `seek` | string | ❌ | `0` | Start time — `1:30` ya `90` sec |
| `duration` | string | ❌ | full | Clip length — `00:01:00` |
| `end` | string | ❌ | — | End time — `3:45` |
| `crf` | number | ❌ | `23` | Quality factor `0`(best)–`51`(worst) |
| `preset` | string | ❌ | `medium` | `ultrafast` `fast` `medium` `slow` `veryslow` |
| `scale` | string | ❌ | — | Custom resolution `1280x720` ya `640:-1` |
| `eq` | string | ❌ | `flat` | Audio EQ preset |
| `eq_args` | string | ❌ | — | Custom audio EQ |
| `audio_only` | boolean | ❌ | `false` | Video se sirf audio nikalo |
| `no_audio` | boolean | ❌ | `false` | Silent video |
| `compress` | boolean | ❌ | `false` | Telegram/WhatsApp size compress |
| `max_size` | string | ❌ | — | Max file size — `50MB` `100MB` `2GB` |
| `stream` | boolean | ❌ | `false` | Stream URL return karo |
| `thumbnail` | boolean | ❌ | `false` | Thumbnail include karo response mein |

</details>

<details>
<summary><b>💡 Examples (click to expand)</b></summary>

```bash
# HD video download
GET /media/video?q=https://youtu.be/VIDEO_ID&quality=1080p&format=mp4

# Telegram bot ke liye compressed (50MB max)
GET /media/video?q=Movie+Song+Name&quality=720p&compress=true&max_size=50MB

# 1:30 se 3:00 tak clip
GET /media/video?q=https://youtu.be/ID&seek=1:30&end=3:00&quality=480p

# High quality slow encode (best output)
GET /media/video?q=4K+Nature+Video&quality=1080p&crf=18&preset=slow

# H265 codec — same quality, half size
GET /media/video?q=VIDEO_URL&scale=1280x720&vcodec=h265&crf=20

# Stream URL only (streaming bot)
GET /media/video?q=https://youtu.be/ID&quality=720p&stream=true
```

</details>

---

## ⏩ Seek Args

Seek **3 formats** mein kaam karta hai:

```
seconds   →  seek=90          → 90 seconds se start
mm:ss     →  seek=1:30        → 1 min 30 sec
hh:mm:ss  →  seek=01:30:00    → 1 hour 30 min
```

<details>
<summary><b>Seek + Duration + End combinations (click to expand)</b></summary>

```bash
# 2:00 se start, 30 seconds clip
GET /media/song?q=SONG&seek=2:00&duration=30

# 1:00 se 2:30 tak (end auto-calculate)
GET /media/video?q=VIDEO&seek=1:00&end=2:30

# Chorus pe jump (example)
GET /media/song?q=Levitating+Dua+Lipa&seek=0:47&duration=45

# FFmpeg ke andar jo hota hai:
ffmpeg -ss 01:30 -i input.mp4 -t 60 -c copy output.mp4
#       ↑ seek               ↑ duration
```

</details>

---

## 🎛️ EQ Args — Equalizer

### Preset EQ — `eq=PRESET_NAME`

| Preset | Effect | Best For |
|--------|--------|---------|
| `flat` | No EQ (default) | Original sound |
| `bass_boost` | Bass +8, Sub +6 | Hip-hop, EDM, Trap |
| `bass_reduce` | Bass -6 | Podcast, Voice |
| `treble_boost` | Treble +6, Air +4 | Classical, Acoustic |
| `vocal_boost` | Mid +5, Presence +3 | Vocals, Podcast |
| `vocal_reduce` | Mid -4 | Karaoke mode |
| `loudness` | V-curve bass+treble | General music |
| `soft` | Soft highs, smooth | Lo-fi, Chill |
| `rock` | Bass +4, Treble +5 | Rock, Metal |
| `pop` | Vocal +3, Treble +2 | Pop, Bollywood |
| `jazz` | Mid +3, Bass +2 | Jazz, Blues |
| `classical` | Treble +4, Reverb | Classical |
| `gaming` | Surround, Bass +3 | Gaming audio |
| `nightcore` | Speed +25%, Pitch +3 | Nightcore |
| `slowed` | Speed -15%, Pitch -2 | Slowed + reverb |
| `8d` | 8D spatial audio | Headphone effect |

```bash
GET /media/song?q=SONG&eq=bass_boost   # Bass boost
GET /media/song?q=SONG&eq=nightcore    # Nightcore
GET /media/song?q=SONG&eq=slowed       # Slowed + Reverb
GET /media/song?q=SONG&eq=8d           # 8D Audio
```

### Custom EQ — `eq_args=key=val,key=val`

```
eq_args=bass=8,treble=4,mid=-2,presence=3,sub=5,air=2,volume=120,reverb=20
```

<details>
<summary><b>All EQ Keys & Ranges (click to expand)</b></summary>

| Key | Range | Frequency | Description |
|-----|-------|-----------|-------------|
| `sub` | `-15` to `+15` | 20–60 Hz | Sub-bass |
| `bass` | `-15` to `+15` | 60–250 Hz | Bass |
| `mid` | `-15` to `+15` | 500 Hz–2 kHz | Midrange |
| `upper_mid` | `-15` to `+15` | 2–4 kHz | Upper mid |
| `presence` | `-15` to `+15` | 4–6 kHz | Presence |
| `treble` | `-15` to `+15` | 6–12 kHz | Highs |
| `air` | `-15` to `+15` | 12–20 kHz | Air/brilliance |
| `reverb` | `0` to `100` | — | Reverb amount (%) |
| `volume` | `1` to `200` | — | Volume (%) |
| `speed` | `0.5` to `4.0` | — | Tempo |
| `pitch` | `-12` to `+12` | — | Pitch (semitones) |

```bash
# Custom bass boost + vocal enhance
GET /media/song?q=SONG&eq_args=bass=10,sub=6,mid=3,presence=4,treble=2

# Karaoke — vocal remove
GET /media/song?q=SONG&eq_args=mid=-8,upper_mid=-6,vocal_remove=true

# Lofi effect
GET /media/song?q=SONG&eq_args=treble=-4,bass=3,reverb=30,speed=0.93,pitch=-1

# FFmpeg equivalent:
ffmpeg -i input.mp3 \
  -af "equalizer=f=100:width_type=o:width=2:g=8,\
       equalizer=f=1000:width_type=o:width=2:g=3,\
       equalizer=f=10000:width_type=o:width=2:g=4,\
       volume=1.2" output.mp3
```

</details>

---

## 📊 Metadata — `GET /media/meta`

```bash
GET /media/meta?q=https://youtu.be/VIDEO_ID
GET /media/meta?q=Tum+Hi+Ho+Aashiqui+2
```

<details>
<summary><b>Full Response Format (click to expand)</b></summary>

```json
{
  "success": true,
  "data": {
    "id": "abc123xyz",
    "title": "Tum Hi Ho",
    "artist": "Arijit Singh",
    "album": "Aashiqui 2",
    "year": 2013,
    "genre": "Bollywood",
    "language": "Hindi",
    "duration": 261,
    "duration_formatted": "4:21",
    "thumbnail": "https://cdn.babyapi.pro/thumb/abc123.jpg",
    "thumbnails": {
      "default": "https://i.ytimg.com/vi/ID/default.jpg",
      "medium":  "https://i.ytimg.com/vi/ID/mqdefault.jpg",
      "high":    "https://i.ytimg.com/vi/ID/hqdefault.jpg",
      "maxres":  "https://i.ytimg.com/vi/ID/maxresdefault.jpg"
    },
    "source_url": "https://youtube.com/watch?v=abc123",
    "platform": "youtube",
    "views": 850000000,
    "likes": 4200000,
    "channel": "T-Series",
    "upload_date": "2013-04-22",
    "tags": ["arijit", "bollywood", "romantic"],
    "formats": [
      { "quality": "mp3_128",  "bitrate": 128,  "size_mb": 4.2,  "format": "mp3" },
      { "quality": "mp3_320",  "bitrate": 320,  "size_mb": 10.5, "format": "mp3" },
      { "quality": "m4a_256",  "bitrate": 256,  "size_mb": 8.4,  "format": "m4a" },
      { "quality": "flac",     "bitrate": 1411, "size_mb": 46.2, "format": "flac" }
    ],
    "video_formats": [
      { "quality": "360p",  "fps": 30, "vcodec": "h264", "size_mb": 18  },
      { "quality": "720p",  "fps": 30, "vcodec": "h264", "size_mb": 68  },
      { "quality": "1080p", "fps": 60, "vcodec": "h264", "size_mb": 145 }
    ],
    "lyrics_available": true,
    "subtitles": ["en", "hi"],
    "is_live": false,
    "age_restricted": false
  }
}
```

</details>

---

## 🔧 FFmpeg Quality Control

<details>
<summary><b>🎵 Audio Quality (click to expand)</b></summary>

```bash
# Bitrate control
GET /media/song?q=SONG&bitrate=320&format=mp3

# Lossless (FLAC)
GET /media/song?q=SONG&format=flac&quality=lossless

# Opus — smallest size, great quality (Discord/Telegram best)
GET /media/song?q=SONG&format=opus&bitrate=128

# VBR — Variable Bitrate (size vs quality balance)
GET /media/song?q=SONG&format=mp3&vbr=true&vbr_quality=2
# vbr_quality: 0(best ~245kbps) → 9(worst ~65kbps)
```

**FFmpeg equivalent:**
```bash
ffmpeg -i input -c:a libmp3lame -b:a 320k output.mp3   # MP3 320kbps
ffmpeg -i input -c:a flac output.flac                   # FLAC lossless
ffmpeg -i input -c:a libopus -b:a 128k output.opus      # Opus (Telegram)
ffmpeg -i input -c:a libmp3lame -q:a 2 output.mp3       # VBR quality 2
```

</details>

<details>
<summary><b>🎬 Video Quality (click to expand)</b></summary>

```bash
# CRF — best control (18=excellent, 23=good, 28=acceptable)
GET /media/video?q=VIDEO&crf=18&preset=slow

# H265 — same quality, half the size
GET /media/video?q=VIDEO&vcodec=h265&crf=20&quality=1080p

# Fast encode (server speed priority)
GET /media/video?q=VIDEO&preset=ultrafast&quality=720p

# Best quality output (slow)
GET /media/video?q=VIDEO&preset=veryslow&crf=16&quality=1080p
```

**FFmpeg equivalent:**
```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 18 -preset slow output.mp4
ffmpeg -i input.mp4 -c:v libx265 -crf 20 -preset medium output.mp4
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 23 output.mp4
ffmpeg -i input.mp4 -r 30 -c:v libx264 output.mp4
```

</details>

<details>
<summary><b>📦 Size Management (click to expand)</b></summary>

```bash
# Telegram (50MB limit)
GET /media/video?q=VIDEO&quality=720p&max_size=50MB&compress=true

# WhatsApp (16MB limit)
GET /media/video?q=VIDEO&quality=480p&max_size=16MB&compress=true

# Discord (10MB limit)
GET /media/video?q=VIDEO&quality=360p&max_size=10MB&compress=true

# Audio only from video (smallest size)
GET /media/video?q=VIDEO&audio_only=true&format=mp3&bitrate=192
```

**FFmpeg equivalent:**
```bash
ffmpeg -i input.mp4 -fs 50M -c:v libx264 output.mp4   # Target 50MB
```

</details>

---

## 📡 Response & Error Format

<details>
<summary><b>✅ Success Response (click to expand)</b></summary>

```json
{
  "success": true,
  "data": {
    "title": "Song/Video title",
    "artist": "Artist name",
    "duration": 261,
    "duration_formatted": "4:21",
    "thumbnail": "https://cdn.babyapi.pro/thumb/abc.jpg",
    "stream_url": "https://cdn.babyapi.pro/stream/abc123?token=xyz",
    "download_url": "https://cdn.babyapi.pro/dl/abc123.mp3",
    "format": "mp3",
    "quality": "high",
    "bitrate": 320,
    "size_bytes": 10485760,
    "size_mb": 10.0,
    "eq_applied": "bass_boost",
    "seek_applied": "1:30",
    "expires_at": "2025-06-06T11:00:00Z"
  },
  "meta": {
    "processing_time_ms": 842,
    "cached": false,
    "ffmpeg_used": true
  }
}
```

</details>

<details>
<summary><b>❌ Error Response & Codes (click to expand)</b></summary>

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "No results found for the given query.",
  "code": 404
}
```

| Code | Error | Fix |
|------|-------|-----|
| `401` | `INVALID_API_KEY` | Key check karo |
| `403` | `QUOTA_EXCEEDED` | Plan upgrade karo |
| `404` | `NOT_FOUND` | Query/URL change karo |
| `422` | `INVALID_PARAMS` | Params check karo |
| `429` | `RATE_LIMITED` | Thoda wait karo |
| `500` | `PROCESSING_ERROR` | Retry karo |
| `503` | `PLATFORM_BLOCKED` | Diff source use karo |

**Rate limit headers:**
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1749207600
```

</details>

---

## 🚦 Plans & Rate Limits

| Plan | Req/min | Max Audio | Max Video | Max Size | EQ/FFmpeg |
|------|---------|-----------|-----------|----------|-----------|
| **Free** | 10 | 128 kbps | 480p | 50 MB | Basic presets |
| **Basic** | 60 | 320 kbps | 720p | 200 MB | All presets |
| **Pro** | 300 | Lossless | 1080p | 2 GB | Custom `eq_args` |
| **Enterprise** | Unlimited | Lossless | 4K | Unlimited | Full FFmpeg params |

**Get API Key:** [babiesiq.tech/dashboard/keys](https://babiesiq.tech/dashboard/keys) · **Upgrade:** [babiesiq.tech/pricing](https://babiesiq.tech/pricing)

---

## 💡 Best Practices

```bash
# ✅ Bot ke liye — stream URL lo, server pe file mat rakho
GET /media/song?q=SONG&stream=true

# ✅ Telegram voice — opus format (smallest, best quality)
GET /media/song?q=SONG&format=opus&bitrate=128

# ✅ Video size limit — compress=true use karo
GET /media/video?q=VIDEO&compress=true&max_size=50MB

# ✅ Direct URL doge to cache milegi — fast response
GET /media/song?q=https://youtu.be/POPULAR_ID

# ✅ Metadata pehle lo, phir user ki choice se download
GET /media/meta?q=QUERY  →  GET /media/video?q=URL&quality=USER_CHOICE

# ❌ Same song bar bar naya request mat karo
#    stream_url reuse karo jab tak expires_at nahi aata

# ❌ 1080p lo + phir compress karo = waste
#    Direct sahi quality lo (720p agar 50MB chahiye)
```

---

## 🛠️ Developer — Self-Host / Deploy

> **Frontend (BabiesIQ Dashboard):** [github.com/BabiesIQ/web](https://github.com/BabiesIQ/web)

### ☁️ Cloud PaaS (Recommended)

<details>
<summary><b>🟣 Heroku — Best for production</b></summary>

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/BabiesIQ/web)

```bash
heroku login
heroku create YOUR-APP-NAME
git push heroku main
heroku open

# Custom domain
heroku domains:add babiesiq.tech --app YOUR-APP-NAME
heroku certs:auto:enable --app YOUR-APP-NAME
```
> ✅ No sleep | Custom domain free | Basic plan $7/mo

</details>

<details>
<summary><b>🚂 Railway — Free tier, no sleep</b></summary>

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/babiesiq)

```bash
npm i -g @railway/cli
railway login && railway init && railway up
```
> ✅ Auto-detects Node.js | 500 hours/month free | No sleep

</details>

<details>
<summary><b>🎨 Render — Easy setup</b></summary>

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/BabiesIQ/web)

Dashboard mein:
- **Build:** `npm install && npm run build`
- **Start:** `npm start`

> ⚠️ Free tier sleeps after 15 min — self-ping built-in hai ✅

</details>

<details>
<summary><b>☁️ Koyeb — Free, always-on</b></summary>

[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&repository=github.com/BabiesIQ/web&branch=main&name=babiesiq-web)

```bash
koyeb app create babiesiq-web \
  --git github.com/BabiesIQ/web --git-branch main \
  --build-command "npm install && npm run build" \
  --run-command "npm start" --ports 3000:http
```
> ✅ Free always-on instance | Custom domain | No sleep

</details>

### ⚡ Serverless (Static Frontend)

<details>
<summary><b>▲ Vercel — Fastest deploy</b></summary>

[![Deploy to Vercel](https://img.shields.io/badge/▲_Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https://github.com/BabiesIQ/web)

```bash
npm i -g vercel && vercel --prod
```
> ✅ `vercel.json` included | SPA routing auto-configured | Free unlimited

</details>

<details>
<summary><b>🌿 Netlify — Free & fast</b></summary>

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/BabiesIQ/web)

```bash
npm i -g netlify-cli && npm run build
netlify deploy --prod --dir=dist
```
> ✅ `netlify.toml` + `_redirects` included | Free unlimited

</details>

### 🖥️ Self-Hosted

<details>
<summary><b>💻 Replit — Quick dev/test</b></summary>

[![Run on Replit](https://img.shields.io/badge/▶_Run-Replit-F26207?style=for-the-badge&logo=replit&logoColor=white)](https://replit.com/github/BabiesIQ/web)

Import hone ke baad shell mein:
```bash
npm install && npm run build
```
> `.replit` config included | Set `APP_URL` env var for anti-sleep ping

</details>

<details>
<summary><b>🖥️ VPS — Full control (Ubuntu/Debian)</b></summary>

```bash
# 1. Node.js 20 install
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx certbot python3-certbot-nginx

# 2. Clone + build
git clone https://github.com/BabiesIQ/web.git && cd web npm install && npm run build

# 3. PM2 se always-on chalao
npm i -g pm2
pm2 start server.js --name babiesiq && pm2 startup && pm2 save

# 4. Nginx reverse proxy
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

# 5. Free SSL (Let's Encrypt)
sudo certbot --nginx -d babiesiq.tech -d www.babiesiq.tech
```
> ✅ Full control | Custom everything | SSL free via Let's Encrypt

</details>

### 📊 Platform Comparison

| Platform | Free | Sleep | Custom Domain | Best For |
|----------|------|-------|---------------|---------|
| **Heroku** | ❌ $7/mo | ❌ No | ✅ | Production |
| **Railway** | ✅ 500h | ❌ No | ✅ | Dev + Prod |
| **Render** | ✅ | ✅ 15min* | ✅ | Demos |
| **Koyeb** | ✅ | ❌ No | ✅ | Production |
| **Vercel** | ✅ ∞ | ❌ Serverless | ✅ | Static |
| **Netlify** | ✅ ∞ | ❌ Serverless | ✅ | Static |
| **Replit** | ✅ | ✅ 30min* | 💰 Paid | Development |
| **VPS** | 💰 | ❌ No | ✅ | Full control |

*Self-ping built-in — automatically prevent sleep ✅

---

<div align="center">

**[🌐 Dashboard](https://babiesiq.tech) · [📚 Docs](https://babiesiq.tech/docs) · [💬 Telegram](https://t.me/babiesiq) · [🐛 Issues](https://github.com/BabiesIQ/web/issues)**

[![API](https://img.shields.io/badge/babyapi.pro-Live-22c55e?style=for-the-badge&logo=statuspage&logoColor=white)](https://babyapi.pro)&nbsp;[![Telegram](https://img.shields.io/badge/@BabiesIQ-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/babiesiq)

</div>
