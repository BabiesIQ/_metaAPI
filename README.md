<div align="center">

# 🎵 BabyAPI — Media Streaming API

**Song · Video · Seek · EQ · Metadata · FFmpeg Quality Control**

[![API Status](https://img.shields.io/badge/API-Live-22c55e?style=for-the-badge&logo=statuspage&logoColor=white)](https://babyapi.pro)&nbsp;
[![Version](https://img.shields.io/badge/v1.0.0-stable-6366f1?style=for-the-badge)](https://babyapi.pro)&nbsp;
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Powered-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)](https://ffmpeg.org)&nbsp;
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**Base URL:** `https://babyapi.pro/api/v1`

</div>

---

## ⚡ Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/media/song` | `GET` | Song stream / download |
| `/media/video` | `GET` | Video stream / download |
| `/media/search` | `GET` | Search songs & videos |
| `/media/meta` | `GET` | Metadata only (no download) |
| `/media/thumbnail` | `GET` | Thumbnail image |
| `/media/lyrics` | `GET` | Song lyrics |
| `/media/formats` | `GET` | Available quality formats |
| `/media/playlist` | `GET` | Playlist info & tracks |

---

## 🔑 Authentication

Har request mein API key header mein bhejo:

```http
X-API-Key: YOUR_API_KEY
```

Ya query param se bhi kaam karta hai:
```
?api_key=YOUR_API_KEY
```

**Key generate karo:** [babiesiq.tech/dashboard/keys](https://babiesiq.tech/dashboard/keys)

---

## 🎵 Song Request

### `GET /media/song`

YouTube, Spotify, SoundCloud ya kisi bhi supported platform se song stream/download karo.

#### Parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `q` | string | ✅ | — | Search query ya direct URL |
| `quality` | string | ❌ | `high` | `low` `medium` `high` `lossless` |
| `format` | string | ❌ | `mp3` | `mp3` `m4a` `ogg` `opus` `flac` |
| `bitrate` | number | ❌ | `320` | `64` `128` `192` `256` `320` (kbps) |
| `seek` | string | ❌ | `0` | Start position — `30` ya `1:30` ya `01:30:00` |
| `duration` | string | ❌ | full | Clip duration — `60` ya `1:00` |
| `eq` | string | ❌ | `flat` | Equalizer preset (details neeche) |
| `eq_args` | string | ❌ | — | Custom EQ — `bass=5,treble=3,mid=-2` |
| `volume` | number | ❌ | `100` | Volume level `1–200` (%) |
| `speed` | number | ❌ | `1.0` | Playback speed `0.5–4.0` |
| `pitch` | number | ❌ | `0` | Pitch shift in semitones `-12` to `+12` |
| `mono` | boolean | ❌ | `false` | Stereo to mono convert |
| `normalize` | boolean | ❌ | `false` | Audio normalize (loudness) |
| `stream` | boolean | ❌ | `false` | Direct stream URL return karo |
| `raw_url` | boolean | ❌ | `false` | Raw CDN URL return karo (no processing) |
| `filename` | string | ❌ | auto | Custom output filename |

#### Examples

```bash
# Basic song download
GET /media/song?q=Kesariya+Arijit+Singh&quality=high&format=mp3

# Specific URL se
GET /media/song?q=https://youtu.be/dQw4w9WgXcQ&format=m4a&bitrate=256

# Seek 30 seconds se start karo, 60 sec clip lo
GET /media/song?q=Tum+Hi+Ho&seek=0:30&duration=60

# Bass boost ke saath
GET /media/song?q=Raataan+Lambiyan&eq=bass_boost&quality=high

# Custom EQ — bass +8, treble +4, mid -2
GET /media/song?q=Believer+Imagine+Dragons&eq_args=bass=8,treble=4,mid=-2,presence=2

# Slow + pitch down
GET /media/song?q=Aashiqui+2+title+song&speed=0.85&pitch=-2

# Stream URL chahiye (bot ke liye)
GET /media/song?q=Tujhe+Kitna+Chahne+Lage&stream=true
```

---

## 🎬 Video Request

### `GET /media/video`

Video stream / download with full quality control.

#### Parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `q` | string | ✅ | — | Search query ya direct URL |
| `quality` | string | ❌ | `720p` | `144p` `240p` `360p` `480p` `720p` `1080p` `1440p` `4k` |
| `format` | string | ❌ | `mp4` | `mp4` `webm` `mkv` `mov` |
| `vcodec` | string | ❌ | `h264` | `h264` `h265` `vp9` `av1` |
| `acodec` | string | ❌ | `aac` | `aac` `mp3` `opus` `vorbis` |
| `fps` | number | ❌ | original | Force FPS — `24` `30` `60` |
| `seek` | string | ❌ | `0` | Start time — `1:30` ya `90` (seconds) |
| `duration` | string | ❌ | full | Clip length — `00:01:00` |
| `end` | string | ❌ | — | End time — `3:45` (seek ke saath use karo) |
| `crf` | number | ❌ | `23` | Quality factor `0`(best)–`51`(worst) — `18` recommended |
| `preset` | string | ❌ | `medium` | FFmpeg preset `ultrafast` `fast` `medium` `slow` `veryslow` |
| `scale` | string | ❌ | — | Custom resolution `1280x720` ya `640:-1` |
| `eq` | string | ❌ | `flat` | Audio EQ preset |
| `eq_args` | string | ❌ | — | Custom audio EQ |
| `audio_only` | boolean | ❌ | `false` | Video se sirf audio nikalo |
| `no_audio` | boolean | ❌ | `false` | Silent video |
| `compress` | boolean | ❌ | `false` | Telegram/WhatsApp ke liye size compress |
| `max_size` | string | ❌ | — | Max file size — `50MB` `100MB` `2GB` |
| `stream` | boolean | ❌ | `false` | Stream URL return karo |
| `thumbnail` | boolean | ❌ | `false` | Video thumbnail include karo response mein |

#### Examples

```bash
# HD video download
GET /media/video?q=https://youtu.be/VIDEO_ID&quality=1080p&format=mp4

# Telegram bot ke liye compressed (max 50MB)
GET /media/video?q=Movie+Song+Name&quality=720p&compress=true&max_size=50MB

# 1:30 se 3:00 tak clip
GET /media/video?q=https://youtu.be/ID&seek=1:30&end=3:00&quality=480p

# High quality, slow encode (best quality output)
GET /media/video?q=4K+Nature+Video&quality=1080p&crf=18&preset=slow

# Custom scale, h265 codec
GET /media/video?q=VIDEO_URL&scale=1280x720&vcodec=h265&crf=20

# Stream URL only (streaming bot ke liye)
GET /media/video?q=https://youtu.be/ID&quality=720p&stream=true
```

---

## ⏩ Seek Args — Detailed

Seek parameter teen formats mein accept karta hai:

```
seconds     →  seek=90           (90 seconds se start)
mm:ss       →  seek=1:30         (1 minute 30 seconds)
hh:mm:ss    →  seek=01:30:00     (1 hour 30 minutes)
```

**Seek + Duration combination:**
```bash
# 2:00 se start, 30 seconds clip
GET /media/song?q=SONG&seek=2:00&duration=30

# 1:00 se 2:30 tak (end se duration auto-calculate)
GET /media/video?q=VIDEO&seek=1:00&end=2:30

# Fast forward to chorus (example)
GET /media/song?q=Levitating+Dua+Lipa&seek=0:47&duration=45
```

**FFmpeg ke andar jo hota hai:**
```bash
ffmpeg -ss 01:30 -i input.mp4 -t 60 -c copy output.mp4
#       ↑ seek    ↑ input     ↑ duration
```

---

## 🎛️ EQ Args — Equalizer

### Preset EQ (`eq=PRESET_NAME`)

| Preset | Description | Best For |
|--------|-------------|---------|
| `flat` | No EQ (default) | Original sound |
| `bass_boost` | Bass +8, Sub +6 | Hip-hop, EDM, Trap |
| `bass_reduce` | Bass -6 | Podcast, Voice |
| `treble_boost` | Treble +6, Air +4 | Classical, Acoustic |
| `vocal_boost` | Mid +5, Presence +3 | Vocals, Podcast |
| `vocal_reduce` | Mid -4 | Karaoke mode |
| `loudness` | V-curve (bass+treble) | General music |
| `soft` | Soft highs, smooth mids | Lo-fi, Chill |
| `rock` | Bass +4, Treble +5 | Rock, Metal |
| `pop` | Vocal +3, Treble +2 | Pop, Bollywood |
| `jazz` | Mid +3, Bass +2 | Jazz, Blues |
| `classical` | Treble +4, Reverb | Classical |
| `gaming` | Surround, Bass +3 | Gaming audio |
| `nightcore` | Speed +25%, Pitch +3 | Nightcore style |
| `slowed` | Speed -15%, Pitch -2 | Slowed + reverb |
| `8d` | 8D spatial audio | Headphone effect |

```bash
# Preset use karna
GET /media/song?q=SONG&eq=bass_boost

# Nightcore
GET /media/song?q=Kesariya&eq=nightcore

# Slowed + Reverb
GET /media/song?q=Tum+Hi+Ho&eq=slowed

# 8D Audio
GET /media/song?q=Believer&eq=8d
```

### Custom EQ Args (`eq_args=...`)

Comma-separated key=value format:

```
eq_args=bass=8,treble=4,mid=-2,presence=3,sub=5,air=2,volume=120,reverb=20
```

| Key | Range | Description |
|-----|-------|-------------|
| `bass` | `-15` to `+15` | Low frequencies (60-250 Hz) |
| `sub` | `-15` to `+15` | Sub-bass (20-60 Hz) |
| `mid` | `-15` to `+15` | Midrange (500 Hz-2 kHz) |
| `upper_mid` | `-15` to `+15` | Upper mid (2-4 kHz) |
| `presence` | `-15` to `+15` | Presence (4-6 kHz) |
| `treble` | `-15` to `+15` | Highs (6-12 kHz) |
| `air` | `-15` to `+15` | Air/brilliance (12-20 kHz) |
| `reverb` | `0` to `100` | Reverb amount (%) |
| `volume` | `1` to `200` | Volume (%) |
| `speed` | `0.5` to `4.0` | Tempo |
| `pitch` | `-12` to `+12` | Pitch (semitones) |

```bash
# Custom bass boost + vocal
GET /media/song?q=SONG&eq_args=bass=10,sub=6,mid=3,presence=4,treble=2

# Karaoke (vocal remove)
GET /media/song?q=SONG&eq_args=mid=-8,upper_mid=-6,vocal_remove=true

# Lofi effect
GET /media/song?q=SONG&eq_args=treble=-4,bass=3,reverb=30,speed=0.93,pitch=-1
```

**FFmpeg ke andar equivalent:**
```bash
ffmpeg -i input.mp3 \
  -af "equalizer=f=100:width_type=o:width=2:g=8, \
       equalizer=f=1000:width_type=o:width=2:g=3, \
       equalizer=f=10000:width_type=o:width=2:g=4, \
       volume=1.2" \
  output.mp3
```

---

## 📊 Metadata Response

### `GET /media/meta`

Download kiye bina sirf metadata lo.

```bash
GET /media/meta?q=https://youtu.be/VIDEO_ID
GET /media/meta?q=Tum+Hi+Ho+Aashiqui+2
```

#### Response Format

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
      "medium": "https://i.ytimg.com/vi/ID/mqdefault.jpg",
      "high": "https://i.ytimg.com/vi/ID/hqdefault.jpg",
      "maxres": "https://i.ytimg.com/vi/ID/maxresdefault.jpg"
    },
    "source_url": "https://youtube.com/watch?v=abc123",
    "platform": "youtube",
    "views": 850000000,
    "likes": 4200000,
    "channel": "T-Series",
    "upload_date": "2013-04-22",
    "description": "Official Music Video...",
    "tags": ["arijit", "bollywood", "romantic"],
    "formats": [
      { "quality": "mp3_128", "bitrate": 128, "size_mb": 4.2, "format": "mp3" },
      { "quality": "mp3_320", "bitrate": 320, "size_mb": 10.5, "format": "mp3" },
      { "quality": "m4a_256", "bitrate": 256, "size_mb": 8.4, "format": "m4a" },
      { "quality": "flac",    "bitrate": 1411, "size_mb": 46.2, "format": "flac" }
    ],
    "video_formats": [
      { "quality": "360p",  "fps": 30, "vcodec": "h264", "size_mb": 18 },
      { "quality": "720p",  "fps": 30, "vcodec": "h264", "size_mb": 68 },
      { "quality": "1080p", "fps": 60, "vcodec": "h264", "size_mb": 145 }
    ],
    "lyrics_available": true,
    "subtitles": ["en", "hi"],
    "is_live": false,
    "age_restricted": false
  }
}
```

---

## 🔧 FFmpeg Quality Control

API internally FFmpeg use karta hai — tum directly FFmpeg params bhi pass kar sakte ho:

### Audio Quality

```bash
# Bitrate control
GET /media/song?q=SONG&bitrate=320&format=mp3

# Lossless (FLAC)
GET /media/song?q=SONG&format=flac&quality=lossless

# Opus (smallest size, great quality — Discord/Telegram ke liye best)
GET /media/song?q=SONG&format=opus&bitrate=128

# VBR (Variable Bitrate — size vs quality balance)
GET /media/song?q=SONG&format=mp3&vbr=true&vbr_quality=2
# vbr_quality: 0(best,~245kbps) to 9(worst,~65kbps)
```

**FFmpeg equivalent:**
```bash
# MP3 320kbps
ffmpeg -i input -c:a libmp3lame -b:a 320k output.mp3

# FLAC lossless
ffmpeg -i input -c:a flac output.flac

# Opus (Telegram voice)
ffmpeg -i input -c:a libopus -b:a 128k output.opus

# VBR quality 2
ffmpeg -i input -c:a libmp3lame -q:a 2 output.mp3
```

### Video Quality

```bash
# CRF — best quality control (18=excellent, 23=good, 28=acceptable)
GET /media/video?q=VIDEO&crf=18&preset=slow

# Size-based compression (Telegram 50MB limit ke liye)
GET /media/video?q=VIDEO&max_size=50MB&quality=720p

# H265 — same quality, half size
GET /media/video?q=VIDEO&vcodec=h265&crf=20&quality=1080p

# Fast encode (server fast response chahiye)
GET /media/video?q=VIDEO&preset=ultrafast&quality=720p

# High quality, slow but best output
GET /media/video?q=VIDEO&preset=veryslow&crf=16&quality=1080p
```

**FFmpeg equivalent:**
```bash
# H264 good quality
ffmpeg -i input.mp4 -c:v libx264 -crf 18 -preset slow output.mp4

# H265 (half size same quality)
ffmpeg -i input.mp4 -c:v libx265 -crf 20 -preset medium output.mp4

# Target file size (~50MB)
ffmpeg -i input.mp4 -fs 50M -c:v libx264 output.mp4

# Scale to 720p
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 23 output.mp4

# Force 30fps
ffmpeg -i input.mp4 -r 30 -c:v libx264 output.mp4
```

### Size Management

```bash
# Telegram Bot ke liye (50MB limit)
GET /media/video?q=VIDEO&quality=720p&max_size=50MB&compress=true

# WhatsApp ke liye (16MB limit)
GET /media/video?q=VIDEO&quality=480p&max_size=16MB&compress=true

# Discord ke liye (10MB limit)
GET /media/video?q=VIDEO&quality=360p&max_size=10MB&compress=true

# Sirf audio chahiye from video (smallest size)
GET /media/video?q=VIDEO&audio_only=true&format=mp3&bitrate=192
```

---

## 🤖 Use Cases — Sab Platforms

### Telegram Music Bot

```python
import requests

API = "https://babyapi.pro/api/v1"
KEY = "YOUR_API_KEY"

# Song request
def get_song(query, quality="high", eq=None):
    params = {
        "q": query,
        "quality": quality,
        "format": "mp3",
        "stream": "true",
        "api_key": KEY
    }
    if eq:
        params["eq"] = eq
    r = requests.get(f"{API}/media/song", params=params)
    return r.json()["data"]["stream_url"]

# Video request  
def get_video(query, quality="720p"):
    params = {
        "q": query,
        "quality": quality,
        "compress": "true",
        "max_size": "50MB",
        "stream": "true",
        "api_key": KEY
    }
    r = requests.get(f"{API}/media/video", params=params)
    return r.json()

# Seek example — jo user ne timestamp diya
def get_song_clip(query, seek="1:30", duration="60"):
    params = {
        "q": query,
        "seek": seek,
        "duration": duration,
        "format": "mp3",
        "api_key": KEY
    }
    r = requests.get(f"{API}/media/song", params=params)
    return r.json()
```

### Discord Music Bot (Node.js)

```javascript
const BASE = "https://babyapi.pro/api/v1";
const KEY = "YOUR_API_KEY";

// Stream URL for Discord voice (opus format best)
async function getStreamUrl(query, options = {}) {
  const params = new URLSearchParams({
    q: query,
    format: "opus",
    bitrate: "128",
    stream: "true",
    api_key: KEY,
    ...options,
  });
  const res = await fetch(`${BASE}/media/song?${params}`);
  const data = await res.json();
  return data.data.stream_url;
}

// With EQ
const url = await getStreamUrl("Kesariya", { eq: "bass_boost" });

// With seek (user ne !play song 1:30 kiya)
const url = await getStreamUrl("Tum Hi Ho", { seek: "1:30" });
```

### Video Streaming App (React/Next.js)

```javascript
const BASE = "https://babyapi.pro/api/v1";

// Metadata fetch for player UI
async function fetchMeta(videoUrl) {
  const res = await fetch(
    `${BASE}/media/meta?q=${encodeURIComponent(videoUrl)}&api_key=YOUR_KEY`
  );
  return res.json();
}

// Stream URL for <video> tag
async function getVideoStream(query, quality = "720p") {
  const params = new URLSearchParams({
    q: query, quality, stream: "true", api_key: "YOUR_KEY",
  });
  const res = await fetch(`${BASE}/media/video?${params}`);
  const data = await res.json();
  return data.data.stream_url; // → <video src={streamUrl}/>
}

// With seek (video player timestamp se)
async function seekVideo(url, timestamp) {
  // Convert seconds to HH:MM:SS
  const h = Math.floor(timestamp / 3600);
  const m = Math.floor((timestamp % 3600) / 60);
  const s = Math.floor(timestamp % 60);
  const seek = `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return getVideoStream(url, "720p", { seek });
}
```

### YouTube Downloader Bot

```python
# Metadata + all formats show karo user ko
def get_formats(url):
    r = requests.get(f"{API}/media/formats", params={"q": url, "api_key": KEY})
    return r.json()["data"]

# User ne quality choose kiya, download karo
def download(url, quality="1080p", format="mp4"):
    params = {
        "q": url,
        "quality": quality,
        "format": format,
        "crf": "18",
        "preset": "fast",
        "api_key": KEY
    }
    r = requests.get(f"{API}/media/video", params=params, stream=True)
    with open(f"video.{format}", "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
```

### Karaoke App

```bash
# Vocal remove + instrumental only
GET /media/song?q=SONG&eq_args=mid=-10,upper_mid=-8,vocal_remove=true&format=mp3

# Just vocals (for karaoke practice)
GET /media/song?q=SONG&eq_args=bass=-8,sub=-10,vocal_enhance=true&format=mp3
```

---

## 📡 Response Format (All Endpoints)

### Success

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

### Error

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "No results found for the given query.",
  "code": 404
}
```

#### Error Codes

| Code | Error | Fix |
|------|-------|-----|
| `401` | `INVALID_API_KEY` | Key check karo |
| `403` | `QUOTA_EXCEEDED` | Plan upgrade karo |
| `404` | `NOT_FOUND` | Query/URL change karo |
| `422` | `INVALID_PARAMS` | Params check karo |
| `429` | `RATE_LIMITED` | Thoda ruko, retry karo |
| `500` | `PROCESSING_ERROR` | Server error, retry |
| `503` | `PLATFORM_BLOCKED` | Platform blocked, VPN ya diff source |

---

## 🚦 Rate Limits

| Plan | Requests/min | Max Quality | Max Size | EQ/FFmpeg |
|------|-------------|-------------|----------|-----------|
| **Free** | 10 | 128kbps / 480p | 50MB | Basic presets only |
| **Basic** | 60 | 320kbps / 720p | 200MB | All presets |
| **Pro** | 300 | Lossless / 1080p | 2GB | Custom EQ args |
| **Enterprise** | Unlimited | 4K / Lossless | Unlimited | Full FFmpeg params |

**Headers in response:**
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1749207600
```

---

## 💡 Tips & Best Practices

```bash
# ✅ Bot ke liye — stream URL lo, file download mat karo server pe
GET /media/song?q=SONG&stream=true

# ✅ Telegram ke liye — opus format (smallest, best quality)
GET /media/song?q=SONG&format=opus&bitrate=128

# ✅ Video size limit ke liye — compress=true use karo
GET /media/video?q=VIDEO&compress=true&max_size=50MB

# ✅ Cache hoti hain popular songs — fast response milega
GET /media/song?q=https://youtu.be/POPULAR_VIDEO_ID

# ✅ Metadata pehle lo, format choice baad mein
GET /media/meta?q=QUERY  →  GET /media/video?q=URL&quality=USER_CHOICE

# ❌ Ye mat karo — bar bar same song naya request
# Cache karo locally ya stream_url reuse karo (expires_at dekho)

# ❌ Itna high quality mat lo agar compress karna hai
# 1080p download + compress = waste. Direct 720p lo.
```

---

<div align="center">

**[🌐 Dashboard](https://babiesiq.tech) · [📚 Full Docs](https://babiesiq.tech/docs) · [💬 Support](https://t.me/babiesiq) · [🐛 Issues](https://github.com/BabiesIQ/web/issues)**

[![API](https://img.shields.io/badge/babyapi.pro-Live-22c55e?style=for-the-badge&logo=statuspage&logoColor=white)](https://babyapi.pro)&nbsp;
[![Telegram](https://img.shields.io/badge/@BabiesIQ-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/babiesiq)

</div>
