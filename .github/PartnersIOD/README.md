<div align="center">

<img src="https://babiesiq.tech/logo.png" width="90" alt="BabiesIQ"/>

# 🎵 BabiesIQ · PartnersIOD
### White-Label Music API — Partner Integration Guide

[![API Status](https://img.shields.io/badge/API-Online-brightgreen?style=flat-square)](https://api.babiesiq.tech)
[![Support](https://img.shields.io/badge/Support-Telegram-blue?style=flat-square&logo=telegram)](https://t.me/+q43QONRtkrg5NGFk)
[![Repo](https://img.shields.io/badge/Source-_metaAPI-black?style=flat-square&logo=github)](https://github.com/BabiesIQ/_metaAPI)

---

> **Select your language · अपनी भाषा चुनें · Выберите язык · ቋንቋዎን ይምረጡ**

</div>

---

<!-- ═══════════════════════════════════════════════════════════ ENGLISH -->
<details open>
<summary><b>🇬🇧 &nbsp;English — Partner Setup Guide</b></summary>

<br/>

## What is PartnersIOD?

`BabiesIQ/_metaAPI` is a **fully white-label Music API client** — you clone it, brand it as your own, and ship it to your users. The heavy lifting (streaming, search, lyrics, metadata, CDN) runs on BabiesIQ infrastructure at `api.babiesiq.tech`, completely **invisible** to your users.

---

## ⚡ Quick Overview

```
Your Brand Website  ──▶  api.yourdomain.com  ──▶  api.babiesiq.tech
       ↑                         ↑                         ↑
  Your logo/UI           Your proxy layer           Our engine
  Your domain            Forwards silently          Hidden from user
```

---

## 📋 Step 1 — Clone & Brand

```bash
git clone https://github.com/BabiesIQ/_metaAPI.git my-music-api
cd my-music-api
```

Open the repo and replace these values with your brand:

| File / Field | What to change | Example |
|---|---|---|
| `package.json` → `name` | Your project name | `"my-music-api"` |
| `README.md` | Your brand name, logo URL | `MyMusic API` |
| `src/config.ts` → `APP_NAME` | Brand name in code | `"MyMusic"` |
| `public/logo.png` | Your logo file | Upload your logo |
| `src/config.ts` → `SUPPORT_URL` | Your support link | Your Telegram/email |

> ⚠️ **DO NOT** change `api.babiesiq.tech` anywhere in the code. That is the engine — it must stay hidden and untouched.

### 🔑 Critical — Set Your Proxy URL in `public/config.json`

**This step is mandatory if you are using Method 2 (your own proxy server).** Skip only if you are using Method 1 (Embedded, direct calls to api.babiesiq.tech).

Open `public/config.json` and set `BACKEND_BASE_URL` to your **proxy server URL** (not `api.babiesiq.tech`):

```json
{
  "BACKEND_BASE_URL": "https://api.yoursite.com"
}
```

Replace `https://api.yoursite.com` with the actual URL of your proxy. This is how the frontend knows to route all API calls — including Google OAuth — through your proxy instead of calling `api.babiesiq.tech` directly.

> If you skip this step, Google login will break: the OAuth session cookie will be set on `api.babiesiq.tech` (not your proxy domain), so `getMe()` will return 401 and users will be stuck in a login loop.

---

## 🔒 Step 2 — Hide the Backend (Two Methods)

### ✅ Method 1 — Embedded (Easiest)

Your website makes API calls directly to `api.babiesiq.tech` from the **frontend**. The API URL is buried deep inside minified/bundled JS — regular users never see it. Works well for simple websites.

**How it looks to the user:**
```
User sees:  mymusic.com
Calls go to: api.babiesiq.tech  (hidden in minified code)
```

> ✦ Add `.env` to `.gitignore` so your API keys never appear in your public repo.

---

### ✅ Method 2 — Reverse Proxy (Recommended · Most Professional)

Set up a proxy so all traffic appears to come from **your own domain**. CORS works perfectly, cookies are forwarded, stream URLs are rewritten to your domain, and `api.babiesiq.tech` is completely invisible.

**How it looks to the user:**
```
User sees:  api.mymusic.com  ← your domain
Reality:    api.babiesiq.tech ← silently behind it
```

**What the proxy does automatically:**
- `/api/song` and `/api/video` responses → `stream` URL rewritten to your domain
- Google Sign-In → after login, redirect goes to your domain (not api.babiesiq.tech)
- Audio/video streaming → zero-buffer pass-through
- All cookies, headers, IP — forwarded as-is

---

#### Option A — Nginx (VPS / Linux server)

```nginx
# /etc/nginx/sites-available/api.mymusic.com
# First run: sudo certbot --nginx -d api.mymusic.com

server {
    listen 80;
    server_name api.mymusic.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.mymusic.com;

    ssl_certificate     /etc/letsencrypt/live/api.mymusic.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.mymusic.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_session_cache   shared:SSL:10m;

    # ── Route 1: Audio/Video stream bytes — zero-buffer pass-through ──────────
    location ~ ^/api/stream/ {
        proxy_pass              https://api.babiesiq.tech;
        proxy_ssl_server_name   on;
        proxy_ssl_name          api.babiesiq.tech;
        proxy_http_version      1.1;
        proxy_set_header        Host              api.babiesiq.tech;
        proxy_set_header        X-Real-IP         $remote_addr;
        proxy_set_header        X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_set_header        X-Forwarded-Host  $host;
        proxy_pass_request_headers on;

        proxy_buffering             off;
        proxy_cache                 off;
        proxy_read_timeout          3600s;
        proxy_send_timeout          3600s;
        proxy_request_buffering     off;
        chunked_transfer_encoding   on;
    }

    # ── Route 2: Song & Video — rewrite stream URL to your domain ─────────────
    location ~ ^/api/(song|video) {
        # Handle CORS preflight first
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin      $http_origin always;
            add_header Access-Control-Allow-Credentials true always;
            add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;
            return 204;
        }

        proxy_pass              https://api.babiesiq.tech;
        proxy_ssl_server_name   on;
        proxy_ssl_name          api.babiesiq.tech;
        proxy_http_version      1.1;
        proxy_set_header        Host              api.babiesiq.tech;
        proxy_set_header        X-Real-IP         $remote_addr;
        proxy_set_header        X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_set_header        X-Forwarded-Host  $host;
        proxy_pass_request_headers on;
        proxy_pass_request_body    on;
        proxy_pass_header       Set-Cookie;
        proxy_cookie_domain     api.babiesiq.tech api.mymusic.com;

        # Disable compression so sub_filter can read the JSON body
        proxy_set_header        Accept-Encoding "";

        # Rewrite api.babiesiq.tech → your domain in the JSON stream URL
        sub_filter              'api.babiesiq.tech' 'api.mymusic.com';
        sub_filter_once         off;
        sub_filter_types        application/json text/plain;

        # Rewrite Location header (Google OAuth redirects back to your domain)
        proxy_redirect          https://api.babiesiq.tech/ https://api.mymusic.com/;

        # Strip the backend's CORS headers before adding our own.
        # Without this, both Nginx (add_header) AND the backend set
        # Access-Control-Allow-Origin → duplicate headers → Chrome/mobile
        # throws "Failed to fetch" and Google login silently breaks.
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Credentials;
        proxy_hide_header Access-Control-Allow-Methods;
        proxy_hide_header Access-Control-Allow-Headers;
        proxy_hide_header Access-Control-Expose-Headers;
        proxy_hide_header Access-Control-Max-Age;

        add_header Access-Control-Allow-Origin      $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;
    }

    # ── Route 3: Everything else (auth, Google OAuth, health, etc.) ───────────
    location / {
        # Handle CORS preflight first — before proxy_pass
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin      $http_origin always;
            add_header Access-Control-Allow-Credentials true always;
            add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;
            return 204;
        }

        proxy_pass              https://api.babiesiq.tech;
        proxy_ssl_server_name   on;
        proxy_ssl_name          api.babiesiq.tech;
        proxy_http_version      1.1;
        proxy_set_header        Host              api.babiesiq.tech;
        proxy_set_header        X-Real-IP         $remote_addr;
        proxy_set_header        X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_set_header        X-Forwarded-Host  $host;
        proxy_pass_request_headers on;
        proxy_pass_request_body    on;
        proxy_pass_header       Set-Cookie;
        proxy_cookie_domain     api.babiesiq.tech api.mymusic.com;

        # Rewrite Location header — after Google login, user lands on your domain
        proxy_redirect          https://api.babiesiq.tech/ https://api.mymusic.com/;

        # Strip the backend's CORS headers before adding our own.
        # Without this, both Nginx (add_header) AND the backend set
        # Access-Control-Allow-Origin → duplicate headers → Chrome/mobile
        # throws "Failed to fetch" and Google login silently breaks.
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Credentials;
        proxy_hide_header Access-Control-Allow-Methods;
        proxy_hide_header Access-Control-Allow-Headers;
        proxy_hide_header Access-Control-Expose-Headers;
        proxy_hide_header Access-Control-Max-Age;

        add_header Access-Control-Allow-Origin      $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;

        # Standard timeouts for JSON API (not streaming)
        proxy_connect_timeout   10s;
        proxy_read_timeout      60s;
        proxy_send_timeout      60s;
    }
}
```

```bash
# Reload nginx after editing
sudo nginx -t && sudo systemctl reload nginx
```

---

#### Option B — Node.js / Express Proxy

```bash
npm install http-proxy-middleware express
```

```js
// proxy-server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.set('trust proxy', true);

const BACKEND       = 'https://api.babiesiq.tech';
const YOUR_DOMAIN   = 'api.mymusic.com';          // ← change this
const SONG_VIDEO_RE = /^\/api\/(song|video)/;

app.use('/', createProxyMiddleware({
  target:            BACKEND,
  changeOrigin:      true,
  secure:            true,
  selfHandleResponse: true,   // we write the response manually so we can rewrite bodies
  cookieDomainRewrite: { 'api.babiesiq.tech': YOUR_DOMAIN },

  on: {
    proxyReq: (proxyReq, req) => {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      proxyReq.setHeader('X-Real-IP', ip);
      proxyReq.setHeader('X-Forwarded-For', ip);
      proxyReq.setHeader('X-Forwarded-Proto', 'https');
      // Tell the backend which proxy host the request came through.
      // Used by the OAuth flow to identify the partner when Referer is absent.
      proxyReq.setHeader('X-Forwarded-Host', req.headers.host || YOUR_DOMAIN);

      // Remove Accept-Encoding on song/video so we get plain JSON (not gzip)
      if (SONG_VIDEO_RE.test(req.url)) {
        proxyReq.removeHeader('Accept-Encoding');
      }
    },

    proxyRes: (proxyRes, req, res) => {
      const userHost = req.headers.host || YOUR_DOMAIN;

      // ── CORS headers ──────────────────────────────────────────────────────
      const origin = req.headers['origin'] || '*';
      res.setHeader('Access-Control-Allow-Origin',      origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers',     'Authorization, Content-Type, X-API-Key, X-Request-ID');

      // ── Rewrite Location header ────────────────────────────────────────────
      // Only rewrite if the Location starts with the backend URL (safe prefix match).
      // Avoids accidentally corrupting the Google OAuth URL (which may contain
      // api.babiesiq.tech URL-encoded inside a query param).
      const location = proxyRes.headers['location'];
      if (location && location.startsWith('https://api.babiesiq.tech')) {
        res.setHeader('Location', `https://${userHost}` + location.slice('https://api.babiesiq.tech'.length));
        delete proxyRes.headers['location'];
      }

      // Copy remaining headers (including Set-Cookie — forwarded as-is so the
      // browser stores the session cookie on your proxy domain, not babiesiq.tech)
      Object.entries(proxyRes.headers).forEach(([k, v]) => res.setHeader(k, v));
      res.statusCode = proxyRes.statusCode;

      // ── Song / Video: buffer body and replace stream URL ──────────────────
      if (SONG_VIDEO_RE.test(req.url)) {
        const chunks = [];
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
          let body = Buffer.concat(chunks).toString('utf8');
          // Replace backend domain in the "stream" URL with your domain
          body = body.replace(/https:\/\/api\.babiesiq\.tech/g, `https://${userHost}`);
          res.setHeader('Content-Length', Buffer.byteLength(body));
          res.end(body);
        });
        return;
      }

      // ── All other routes: pipe response directly (streaming safe) ─────────
      proxyRes.pipe(res);
    },

    error: (err, req, res) => {
      res.status(502).json({ success: false, error: 'Gateway error' });
    }
  }
}));

app.listen(3000, () => console.log('Proxy running on :3000'));
```

```bash
# Run with PM2 for production
npm install -g pm2
pm2 start proxy-server.js --name my-api-proxy
pm2 save
```

---

#### Option C — Cloudflare Worker (Free · No server needed)

```js
// Cloudflare Worker — paste this in Workers dashboard
export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);
    const userDomain  = incomingUrl.hostname;    // e.g. api.mymusic.com
    incomingUrl.hostname = 'api.babiesiq.tech';

    // ── CORS preflight ────────────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin':      request.headers.get('Origin') || '*',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods':     'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers':     'Authorization, Content-Type, X-API-Key, X-Request-ID',
          'Access-Control-Max-Age':           '86400',
        },
      });
    }

    // ── Forward request ────────────────────────────────────────────────────────
    const proxyReq = new Request(incomingUrl.toString(), {
      method:  request.method,
      headers: request.headers,
      body:    ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',   // intercept 302 so we can rewrite Location header
    });

    const response = await fetch(proxyReq);

    // ── Build response headers ─────────────────────────────────────────────────
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin',      request.headers.get('Origin') || '*');
    newHeaders.set('Access-Control-Allow-Credentials', 'true');
    newHeaders.set('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers',     'Authorization, Content-Type, X-API-Key, X-Request-ID');

    // ── Rewrite Location header (Google OAuth redirect after login) ────────────
    const location = response.headers.get('location');
    if (location) {
      newHeaders.set('location', location.replace('https://api.babiesiq.tech', `https://${userDomain}`));
    }

    // ── Song / Video: rewrite stream URL in JSON body ──────────────────────────
    const path = incomingUrl.pathname;
    if (/^\/api\/(song|video)/.test(path)) {
      const body    = await response.text();
      const rewritten = body.replace(/https:\/\/api\.babiesiq\.tech/g, `https://${userDomain}`);
      newHeaders.set('Content-Length', new TextEncoder().encode(rewritten).length.toString());
      return new Response(rewritten, {
        status:     response.status,
        statusText: response.statusText,
        headers:    newHeaders,
      });
    }

    // ── All other routes: stream response as-is ────────────────────────────────
    return new Response(response.body, {
      status:     response.status,
      statusText: response.statusText,
      headers:    newHeaders,
    });
  }
};
```

> Set your Worker's **Route** to `api.mymusic.com/*` in the Cloudflare dashboard. No server costs.

---

## 📣 Step 3 — Register Your Domain (REQUIRED)

> **⚠️ This step is mandatory. Without it, all your API calls will return `401 Unauthorized`.**

After setting up your proxy or website, you must tell us your domain so we can **whitelist it** in our security layer.

<a href="https://t.me/+q43QONRtkrg5NGFk">
  <img src="https://img.shields.io/badge/▶ Contact Support Now-Telegram-blue?style=for-the-badge&logo=telegram" alt="Contact Support"/>
</a>

**Send us this message:**
```
Domain Registration Request
My domain: api.mymusic.com   (or mymusic.com)
Project:   [your project name]
Method:    [Nginx / Node / Cloudflare / Direct]
```

We will add your domain to the trusted list within **24 hours**.

---

## ✅ Step 4 — Test Your Setup

```bash
# Replace with your actual domain
curl -s https://api.mymusic.com/api/song?query=Tl4bQBfOtbg | jq .stream
# Expected: "https://api.mymusic.com/api/stream/audio_xxx?token=..."
#           ↑ your domain, NOT api.babiesiq.tech

curl -I https://api.mymusic.com/health
# Expected: HTTP/2 200
```

---

## 🆘 Need Help?

| Channel | Link |
|---|---|
| Support Chat | [t.me/+q43QONRtkrg5NGFk](https://t.me/+q43QONRtkrg5NGFk) |
| Documentation | [babiesiq.tech/docs](https://babiesiq.tech/docs) |
| Source Repo | [github.com/BabiesIQ/_metaAPI](https://github.com/BabiesIQ/_metaAPI) |

</details>

---

<!-- ═══════════════════════════════════════════════════════════ HINDI -->
<details>
<summary><b>🇮🇳 &nbsp;हिंदी — पार्टनर सेटअप गाइड</b></summary>

<br/>

## PartnersIOD क्या है?

`BabiesIQ/_metaAPI` एक **पूरी तरह White-Label Music API** है — आप इसे clone करो, अपने brand का नाम लगाओ, और अपने users को दो। असली काम (streaming, search, lyrics, metadata) `api.babiesiq.tech` पर होता है जो आपके users को **बिल्कुल नहीं दिखता**।

---

## ⚡ संक्षिप्त Overview

```
आपकी Website  ──▶  api.yoursite.com  ──▶  api.babiesiq.tech
      ↑                    ↑                      ↑
आपका logo/UI         आपका proxy layer        असली engine
आपका domain          सब silently forward      User को नहीं दिखता
```

---

## 📋 Step 1 — Clone करो और Brand लगाओ

```bash
git clone https://github.com/BabiesIQ/_metaAPI.git mera-music-api
cd mera-music-api
```

नीचे दिए files खोलो और अपना brand name डालो:

| File / Field | क्या बदलना है | Example |
|---|---|---|
| `package.json` → `name` | Project का नाम | `"mera-music-api"` |
| `README.md` | आपका brand name, logo | `MeraMusic API` |
| `src/config.ts` → `APP_NAME` | Code में brand name | `"MeraMusic"` |
| `public/logo.png` | अपना logo upload करो | — |
| `src/config.ts` → `SUPPORT_URL` | आपका support link | आपका Telegram |

> ⚠️ **`api.babiesiq.tech` को कभी मत बदलो।** यह engine है — यह हमेशा hidden रहना चाहिए।

### 🔑 ज़रूरी — `public/config.json` में Proxy URL सेट करो

**यह step तब mandatory है जब आप Method 2 (अपना proxy server) use कर रहे हो।** Method 1 (Embedded) use करने वालों के लिए ज़रूरी नहीं।

`public/config.json` खोलो और `BACKEND_BASE_URL` को अपने **proxy server URL** पर set करो (`api.babiesiq.tech` नहीं):

```json
{
  "BACKEND_BASE_URL": "https://api.apnisite.com"
}
```

`https://api.apnisite.com` की जगह अपना actual proxy URL डालो। इससे frontend सभी API calls — Google OAuth समेत — आपके proxy से करता है।

> अगर यह step skip किया, तो Google login टूट जाएगा: session cookie `api.babiesiq.tech` पर set होगी (आपके proxy domain पर नहीं), जिससे `getMe()` 401 return करेगा और users login loop में फंस जाएंगे।

---

## 🔒 Step 2 — Backend छुपाओ (दो तरीके)

### ✅ तरीका 1 — Embedded (सबसे आसान)

आपकी website सीधे `api.babiesiq.tech` को call करती है। यह URL minified JavaScript के अंदर छुपा रहता है — आम user कभी नहीं देख पाता।

> ✦ `.env` को `.gitignore` में ज़रूर डालो ताकि API keys public न हों।

---

### ✅ तरीका 2 — Reverse Proxy (सबसे Professional)

एक proxy layer लगाओ जो आपके domain से आने वाला सब request `api.babiesiq.tech` को silently forward करे।

**Proxy automatically यह करेगा:**
- `/api/song` और `/api/video` response में `stream` URL → आपका domain
- Google Sign-In के बाद redirect → आपके domain पर (api.babiesiq.tech नहीं)
- Audio/video streaming → zero-buffer pass-through
- सभी cookies, headers, IP → as-is forward

```
User देखता है:  api.meramusic.com  ← आपका domain
असलियत:        api.babiesiq.tech ← पर्दे के पीछे
```

---

#### Nginx (VPS / Linux server)

```nginx
# Setup: sudo certbot --nginx -d api.meramusic.com

server {
    listen 80;
    server_name api.meramusic.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.meramusic.com;

    ssl_certificate     /etc/letsencrypt/live/api.meramusic.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.meramusic.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_session_cache   shared:SSL:10m;

    # ── Route 1: Audio/Video stream bytes ─────────────────────────────────────
    location ~ ^/api/stream/ {
        proxy_pass              https://api.babiesiq.tech;
        proxy_ssl_server_name   on;
        proxy_ssl_name          api.babiesiq.tech;
        proxy_http_version      1.1;
        proxy_set_header        Host              api.babiesiq.tech;
        proxy_set_header        X-Real-IP         $remote_addr;
        proxy_set_header        X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_set_header        X-Forwarded-Host  $host;
        proxy_pass_request_headers on;
        proxy_buffering             off;
        proxy_cache                 off;
        proxy_read_timeout          3600s;
        proxy_send_timeout          3600s;
        proxy_request_buffering     off;
        chunked_transfer_encoding   on;
    }

    # ── Route 2: Song & Video — stream URL rewrite ────────────────────────────
    location ~ ^/api/(song|video) {
        # Handle CORS preflight first
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin      $http_origin always;
            add_header Access-Control-Allow-Credentials true always;
            add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;
            return 204;
        }

        proxy_pass              https://api.babiesiq.tech;
        proxy_ssl_server_name   on;
        proxy_ssl_name          api.babiesiq.tech;
        proxy_http_version      1.1;
        proxy_set_header        Host              api.babiesiq.tech;
        proxy_set_header        X-Real-IP         $remote_addr;
        proxy_set_header        X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_set_header        X-Forwarded-Host  $host;
        proxy_pass_request_headers on;
        proxy_pass_request_body    on;
        proxy_pass_header       Set-Cookie;
        proxy_cookie_domain     api.babiesiq.tech api.meramusic.com;

        proxy_set_header        Accept-Encoding "";

        # JSON mein stream URL rewrite
        sub_filter              'api.babiesiq.tech' 'api.meramusic.com';
        sub_filter_once         off;
        sub_filter_types        application/json text/plain;

        # Google login ke baad Location header rewrite
        proxy_redirect          https://api.babiesiq.tech/ https://api.meramusic.com/;

        # Backend ke CORS headers strip karo — warna Nginx aur backend dono
        # Access-Control-Allow-Origin add karte hain → duplicate headers →
        # Chrome/mobile "Failed to fetch" throw karta hai → Google login toot jaata hai
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Credentials;
        proxy_hide_header Access-Control-Allow-Methods;
        proxy_hide_header Access-Control-Allow-Headers;
        proxy_hide_header Access-Control-Expose-Headers;
        proxy_hide_header Access-Control-Max-Age;

        add_header Access-Control-Allow-Origin      $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;
    }

    # ── Route 3: Baaki sab (auth, Google OAuth, health, etc.) ─────────────────
    location / {
        # Handle CORS preflight first — before proxy_pass
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin      $http_origin always;
            add_header Access-Control-Allow-Credentials true always;
            add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;
            return 204;
        }

        proxy_pass              https://api.babiesiq.tech;
        proxy_ssl_server_name   on;
        proxy_ssl_name          api.babiesiq.tech;
        proxy_http_version      1.1;
        proxy_set_header        Host              api.babiesiq.tech;
        proxy_set_header        X-Real-IP         $remote_addr;
        proxy_set_header        X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_set_header        X-Forwarded-Host  $host;
        proxy_pass_request_headers on;
        proxy_pass_request_body    on;
        proxy_pass_header       Set-Cookie;
        proxy_cookie_domain     api.babiesiq.tech api.meramusic.com;

        # Google login ke baad Location header rewrite
        proxy_redirect          https://api.babiesiq.tech/ https://api.meramusic.com/;

        # Backend ke CORS headers strip karo — warna Nginx aur backend dono
        # Access-Control-Allow-Origin add karte hain → duplicate headers →
        # Chrome/mobile "Failed to fetch" throw karta hai → Google login toot jaata hai
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Credentials;
        proxy_hide_header Access-Control-Allow-Methods;
        proxy_hide_header Access-Control-Allow-Headers;
        proxy_hide_header Access-Control-Expose-Headers;
        proxy_hide_header Access-Control-Max-Age;

        add_header Access-Control-Allow-Origin      $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;

        # Standard timeouts for JSON API (not streaming)
        proxy_connect_timeout   10s;
        proxy_read_timeout      60s;
        proxy_send_timeout      60s;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

#### Node.js / Express

```bash
npm install http-proxy-middleware express
```

```js
// proxy-server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.set('trust proxy', true);

const BACKEND       = 'https://api.babiesiq.tech';
const YOUR_DOMAIN   = 'api.meramusic.com';       // ← apna domain yahan
const SONG_VIDEO_RE = /^\/api\/(song|video)/;

app.use('/', createProxyMiddleware({
  target:             BACKEND,
  changeOrigin:       true,
  secure:             true,
  selfHandleResponse: true,
  cookieDomainRewrite: { 'api.babiesiq.tech': YOUR_DOMAIN },

  on: {
    proxyReq: (proxyReq, req) => {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      proxyReq.setHeader('X-Real-IP', ip);
      proxyReq.setHeader('X-Forwarded-For', ip);
      proxyReq.setHeader('X-Forwarded-Proto', 'https');
      // Backend ko batao ki request kis proxy host se aayi — OAuth flow ke liye zaroori
      proxyReq.setHeader('X-Forwarded-Host', req.headers.host || YOUR_DOMAIN);
      if (SONG_VIDEO_RE.test(req.url)) {
        proxyReq.removeHeader('Accept-Encoding');
      }
    },

    proxyRes: (proxyRes, req, res) => {
      const userHost = req.headers.host || YOUR_DOMAIN;

      // CORS
      const origin = req.headers['origin'] || '*';
      res.setHeader('Access-Control-Allow-Origin',      origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers',     'Authorization, Content-Type, X-API-Key, X-Request-ID');

      // Location header rewrite — sirf tab jab backend URL se shuru ho
      // (safe prefix match — Google OAuth URL ke query params ko corrupt nahi karta)
      const location = proxyRes.headers['location'];
      if (location && location.startsWith('https://api.babiesiq.tech')) {
        res.setHeader('Location', `https://${userHost}` + location.slice('https://api.babiesiq.tech'.length));
        delete proxyRes.headers['location'];
      }

      // Baaki headers copy karo (Set-Cookie bhi — browser proxy domain par cookie store karega)
      Object.entries(proxyRes.headers).forEach(([k, v]) => res.setHeader(k, v));
      res.statusCode = proxyRes.statusCode;

      // Song/Video: JSON body mein stream URL rewrite
      if (SONG_VIDEO_RE.test(req.url)) {
        const chunks = [];
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
          let body = Buffer.concat(chunks).toString('utf8');
          body = body.replace(/https:\/\/api\.babiesiq\.tech/g, `https://${userHost}`);
          res.setHeader('Content-Length', Buffer.byteLength(body));
          res.end(body);
        });
        return;
      }

      proxyRes.pipe(res);
    },

    error: (err, req, res) => {
      res.status(502).json({ success: false, error: 'Gateway error' });
    }
  }
}));

app.listen(3000, () => console.log('Proxy chal raha hai :3000 pe'));
```

```bash
npm install -g pm2
pm2 start proxy-server.js --name mera-api-proxy
pm2 save
```

---

#### Cloudflare Worker (Free — कोई server नहीं चाहिए)

```js
// Cloudflare Workers dashboard mein paste karo
export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);
    const userDomain  = incomingUrl.hostname;   // api.meramusic.com
    incomingUrl.hostname = 'api.babiesiq.tech';

    // OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin':      request.headers.get('Origin') || '*',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods':     'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers':     'Authorization, Content-Type, X-API-Key, X-Request-ID',
          'Access-Control-Max-Age':           '86400',
        },
      });
    }

    const proxyReq = new Request(incomingUrl.toString(), {
      method:  request.method,
      headers: request.headers,
      body:    ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',  // 302 khud handle karo taaki Location rewrite ho sake
    });

    const response = await fetch(proxyReq);

    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin',      request.headers.get('Origin') || '*');
    newHeaders.set('Access-Control-Allow-Credentials', 'true');
    newHeaders.set('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers',     'Authorization, Content-Type, X-API-Key, X-Request-ID');

    // Google login ke baad Location header rewrite
    const location = response.headers.get('location');
    if (location) {
      newHeaders.set('location', location.replace('https://api.babiesiq.tech', `https://${userDomain}`));
    }

    // Song/Video: JSON body mein stream URL rewrite
    if (/^\/api\/(song|video)/.test(incomingUrl.pathname)) {
      const body = await response.text();
      const rewritten = body.replace(/https:\/\/api\.babiesiq\.tech/g, `https://${userDomain}`);
      newHeaders.set('Content-Length', new TextEncoder().encode(rewritten).length.toString());
      return new Response(rewritten, {
        status:     response.status,
        statusText: response.statusText,
        headers:    newHeaders,
      });
    }

    return new Response(response.body, {
      status:     response.status,
      statusText: response.statusText,
      headers:    newHeaders,
    });
  }
};
```

> Cloudflare dashboard mein Route ko `api.meramusic.com/*` par set karo।

---

## 📣 Step 3 — अपना Domain Register करो (ज़रूरी!)

> **⚠️ बिना इस step के सब API calls `401 Unauthorized` देंगी।**

Setup के बाद हमें अपना domain बताओ ताकि हम उसे **whitelist** करें।

<a href="https://t.me/+q43QONRtkrg5NGFk">
  <img src="https://img.shields.io/badge/▶ Support से Contact करो-Telegram-blue?style=for-the-badge&logo=telegram" alt="Contact Support"/>
</a>

**यह message भेजो:**
```
Domain Registration Request
मेरा domain: api.meramusic.com
Project: [आपके project का नाम]
Method: [Nginx / Node / Cloudflare / Direct]
```

**24 घंटे के अंदर** आपका domain trusted list में add हो जाएगा।

---

## ✅ Step 4 — Test करो

```bash
curl -s https://api.meramusic.com/api/song?query=Tl4bQBfOtbg | grep stream
# Expected: "stream": "https://api.meramusic.com/api/stream/..."
#                                ↑ aapka domain, api.babiesiq.tech nahi

curl -I https://api.meramusic.com/health
# Expected: HTTP/2 200
```

---

## 🆘 Help चाहिए?

| | Link |
|---|---|
| Support Chat | [t.me/+q43QONRtkrg5NGFk](https://t.me/+q43QONRtkrg5NGFk) |
| Documentation | [babiesiq.tech/docs](https://babiesiq.tech/docs) |
| Source Repo | [github.com/BabiesIQ/_metaAPI](https://github.com/BabiesIQ/_metaAPI) |

</details>

---

<!-- ═══════════════════════════════════════════════════════════ RUSSIAN -->
<details>
<summary><b>🇷🇺 &nbsp;Русский — Руководство по настройке партнёра</b></summary>

<br/>

## Что такое PartnersIOD?

`BabiesIQ/_metaAPI` — это **полностью White-Label Music API клиент** — клонируйте, добавьте свой бренд и запустите для своих пользователей. Вся нагрузка (стриминг, поиск, тексты, метаданные, CDN) работает на инфраструктуре BabiesIQ по адресу `api.babiesiq.tech`, полностью **невидимо** для ваших пользователей.

---

## ⚡ Краткий обзор

```
Ваш сайт  ──▶  api.vashsite.ru  ──▶  api.babiesiq.tech
    ↑                 ↑                       ↑
Ваш логотип/UI   Ваш proxy слой          Наш движок
Ваш домен        Тихая переадресация     Скрыт от пользователя
```

---

## 📋 Шаг 1 — Клонирование и брендинг

```bash
git clone https://github.com/BabiesIQ/_metaAPI.git moy-music-api
cd moy-music-api
```

Откройте файлы и замените на данные вашего бренда:

| Файл / Поле | Что менять | Пример |
|---|---|---|
| `package.json` → `name` | Название проекта | `"moy-music-api"` |
| `README.md` | Название бренда, логотип | `MyMusic API` |
| `src/config.ts` → `APP_NAME` | Название в коде | `"MyMusic"` |
| `public/logo.png` | Ваш логотип | Загрузите файл |
| `src/config.ts` → `SUPPORT_URL` | Ваша ссылка поддержки | Ваш Telegram |

> ⚠️ **Никогда не меняйте `api.babiesiq.tech`** в коде. Это движок — он должен оставаться скрытым.

---

## 🔒 Шаг 2 — Скрытие бэкенда (два метода)

### ✅ Метод 1 — Встроенный (самый простой)

Ваш сайт обращается напрямую к `api.babiesiq.tech` из фронтенда. URL спрятан в минифицированном JS — обычные пользователи его никогда не увидят.

> ✦ Добавьте `.env` в `.gitignore`, чтобы ключи не попали в публичный репозиторий.

---

### ✅ Метод 2 — Обратный прокси (рекомендуется)

Настройте прокси — весь трафик выглядит как с вашего домена, `api.babiesiq.tech` полностью невидим.

**Прокси делает автоматически:**
- В `/api/song` и `/api/video` ответах URL стрима → ваш домен
- После входа через Google → редирект на ваш домен (не api.babiesiq.tech)
- Аудио/видео стриминг → без буферизации
- Все куки, заголовки, IP → передаются как есть

```
Пользователь видит:  api.mymusic.ru  ← ваш домен
На самом деле:       api.babiesiq.tech ← скрыт за ним
```

---

#### Nginx (VPS / Linux)

```nginx
# Setup: sudo certbot --nginx -d api.mymusic.ru

server {
    listen 80;
    server_name api.mymusic.ru;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.mymusic.ru;

    ssl_certificate     /etc/letsencrypt/live/api.mymusic.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.mymusic.ru/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_session_cache   shared:SSL:10m;

    # ── Маршрут 1: Байты аудио/видео — без буферизации ────────────────────────
    location ~ ^/api/stream/ {
        proxy_pass              https://api.babiesiq.tech;
        proxy_ssl_server_name   on;
        proxy_ssl_name          api.babiesiq.tech;
        proxy_http_version      1.1;
        proxy_set_header        Host              api.babiesiq.tech;
        proxy_set_header        X-Real-IP         $remote_addr;
        proxy_set_header        X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_set_header        X-Forwarded-Host  $host;
        proxy_pass_request_headers on;
        proxy_buffering             off;
        proxy_cache                 off;
        proxy_read_timeout          3600s;
        proxy_send_timeout          3600s;
        proxy_request_buffering     off;
        chunked_transfer_encoding   on;
    }

    # ── Маршрут 2: Song & Video — перезапись URL стрима ───────────────────────
    location ~ ^/api/(song|video) {
        # Handle CORS preflight first
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin      $http_origin always;
            add_header Access-Control-Allow-Credentials true always;
            add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;
            return 204;
        }

        proxy_pass              https://api.babiesiq.tech;
        proxy_ssl_server_name   on;
        proxy_ssl_name          api.babiesiq.tech;
        proxy_http_version      1.1;
        proxy_set_header        Host              api.babiesiq.tech;
        proxy_set_header        X-Real-IP         $remote_addr;
        proxy_set_header        X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_set_header        X-Forwarded-Host  $host;
        proxy_pass_request_headers on;
        proxy_pass_request_body    on;
        proxy_pass_header       Set-Cookie;
        proxy_cookie_domain     api.babiesiq.tech api.mymusic.ru;

        proxy_set_header        Accept-Encoding "";

        # Перезаписать домен бэкенда в JSON ответе
        sub_filter              'api.babiesiq.tech' 'api.mymusic.ru';
        sub_filter_once         off;
        sub_filter_types        application/json text/plain;

        # Перезапись Location после Google OAuth
        proxy_redirect          https://api.babiesiq.tech/ https://api.mymusic.ru/;

        # Strip backend CORS headers to prevent duplicates
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Credentials;
        proxy_hide_header Access-Control-Allow-Methods;
        proxy_hide_header Access-Control-Allow-Headers;
        proxy_hide_header Access-Control-Expose-Headers;
        proxy_hide_header Access-Control-Max-Age;

        add_header Access-Control-Allow-Origin      $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;
    }

    # ── Маршрут 3: Всё остальное (auth, Google OAuth, health и др.) ───────────
    location / {
        # Handle CORS preflight first — before proxy_pass
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin      $http_origin always;
            add_header Access-Control-Allow-Credentials true always;
            add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;
            return 204;
        }

        proxy_pass              https://api.babiesiq.tech;
        proxy_ssl_server_name   on;
        proxy_ssl_name          api.babiesiq.tech;
        proxy_http_version      1.1;
        proxy_set_header        Host              api.babiesiq.tech;
        proxy_set_header        X-Real-IP         $remote_addr;
        proxy_set_header        X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_set_header        X-Forwarded-Host  $host;
        proxy_pass_request_headers on;
        proxy_pass_request_body    on;
        proxy_pass_header       Set-Cookie;
        proxy_cookie_domain     api.babiesiq.tech api.mymusic.ru;

        # Перезапись Location после Google OAuth
        proxy_redirect          https://api.babiesiq.tech/ https://api.mymusic.ru/;

        # Strip backend CORS headers to prevent duplicates
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Credentials;
        proxy_hide_header Access-Control-Allow-Methods;
        proxy_hide_header Access-Control-Allow-Headers;
        proxy_hide_header Access-Control-Expose-Headers;
        proxy_hide_header Access-Control-Max-Age;

        add_header Access-Control-Allow-Origin      $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;

        # Standard timeouts for JSON API (not streaming)
        proxy_connect_timeout   10s;
        proxy_read_timeout      60s;
        proxy_send_timeout      60s;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

#### Node.js / Express

```js
// proxy-server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.set('trust proxy', true);

const BACKEND       = 'https://api.babiesiq.tech';
const YOUR_DOMAIN   = 'api.mymusic.ru';           // ← ваш домен
const SONG_VIDEO_RE = /^\/api\/(song|video)/;

app.use('/', createProxyMiddleware({
  target:             BACKEND,
  changeOrigin:       true,
  secure:             true,
  selfHandleResponse: true,
  cookieDomainRewrite: { 'api.babiesiq.tech': YOUR_DOMAIN },

  on: {
    proxyReq: (proxyReq, req) => {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      proxyReq.setHeader('X-Real-IP', ip);
      proxyReq.setHeader('X-Forwarded-For', ip);
      proxyReq.setHeader('X-Forwarded-Proto', 'https');
      if (SONG_VIDEO_RE.test(req.url)) {
        proxyReq.removeHeader('Accept-Encoding');
      }
    },

    proxyRes: (proxyRes, req, res) => {
      const userHost = req.headers.host || YOUR_DOMAIN;

      const origin = req.headers['origin'] || '*';
      res.setHeader('Access-Control-Allow-Origin',      origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers',     'Authorization, Content-Type, X-API-Key, X-Request-ID');

      // Перезапись Location после Google OAuth
      const location = proxyRes.headers['location'];
      if (location) {
        res.setHeader('Location', location.replace('https://api.babiesiq.tech', `https://${userHost}`));
        delete proxyRes.headers['location'];
      }

      Object.entries(proxyRes.headers).forEach(([k, v]) => res.setHeader(k, v));
      res.statusCode = proxyRes.statusCode;

      // Song/Video: перезапись URL стрима в JSON теле
      if (SONG_VIDEO_RE.test(req.url)) {
        const chunks = [];
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
          let body = Buffer.concat(chunks).toString('utf8');
          body = body.replace(/https:\/\/api\.babiesiq\.tech/g, `https://${userHost}`);
          res.setHeader('Content-Length', Buffer.byteLength(body));
          res.end(body);
        });
        return;
      }

      proxyRes.pipe(res);
    },

    error: (err, req, res) => {
      res.status(502).json({ success: false, error: 'Gateway error' });
    }
  }
}));

app.listen(3000, () => console.log('Прокси запущен на :3000'));
```

```bash
npm install -g pm2
pm2 start proxy-server.js --name my-api-proxy
pm2 save
```

---

#### Cloudflare Worker (Бесплатно — без сервера)

```js
export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);
    const userDomain  = incomingUrl.hostname;
    incomingUrl.hostname = 'api.babiesiq.tech';

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin':      request.headers.get('Origin') || '*',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods':     'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers':     'Authorization, Content-Type, X-API-Key, X-Request-ID',
          'Access-Control-Max-Age':           '86400',
        },
      });
    }

    const proxyReq = new Request(incomingUrl.toString(), {
      method:  request.method,
      headers: request.headers,
      body:    ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',  // перехватываем 302 для перезаписи Location
    });

    const response = await fetch(proxyReq);

    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin',      request.headers.get('Origin') || '*');
    newHeaders.set('Access-Control-Allow-Credentials', 'true');
    newHeaders.set('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers',     'Authorization, Content-Type, X-API-Key, X-Request-ID');

    // Перезапись Location после Google OAuth
    const location = response.headers.get('location');
    if (location) {
      newHeaders.set('location', location.replace('https://api.babiesiq.tech', `https://${userDomain}`));
    }

    // Song/Video: перезапись URL стрима в JSON теле
    if (/^\/api\/(song|video)/.test(incomingUrl.pathname)) {
      const body = await response.text();
      const rewritten = body.replace(/https:\/\/api\.babiesiq\.tech/g, `https://${userDomain}`);
      newHeaders.set('Content-Length', new TextEncoder().encode(rewritten).length.toString());
      return new Response(rewritten, {
        status:     response.status,
        statusText: response.statusText,
        headers:    newHeaders,
      });
    }

    return new Response(response.body, {
      status:     response.status,
      statusText: response.statusText,
      headers:    newHeaders,
    });
  }
};
```

> В панели Cloudflare установите Route: `api.mymusic.ru/*`

---

## 📣 Шаг 3 — Регистрация домена (ОБЯЗАТЕЛЬНО)

> **⚠️ Без этого шага все запросы вернут `401 Unauthorized`.**

После настройки прокси или сайта сообщите нам ваш домен, чтобы мы добавили его в **список доверенных**.

<a href="https://t.me/+q43QONRtkrg5NGFk">
  <img src="https://img.shields.io/badge/▶ Написать в Support-Telegram-blue?style=for-the-badge&logo=telegram" alt="Support"/>
</a>

**Отправьте нам:**
```
Domain Registration Request
Мой домен: api.mymusic.ru
Проект: [название вашего проекта]
Метод: [Nginx / Node / Cloudflare / Direct]
```

Ваш домен будет добавлен в течение **24 часов**.

---

## ✅ Шаг 4 — Тестирование

```bash
curl -s https://api.mymusic.ru/api/song?query=Tl4bQBfOtbg | grep stream
# Ожидается: "stream": "https://api.mymusic.ru/api/stream/..."
#                                ↑ ваш домен, не api.babiesiq.tech

curl -I https://api.mymusic.ru/health
# Ожидаемый ответ: HTTP/2 200
```

---

## 🆘 Нужна помощь?

| | Ссылка |
|---|---|
| Поддержка | [t.me/+q43QONRtkrg5NGFk](https://t.me/+q43QONRtkrg5NGFk) |
| Документация | [babiesiq.tech/docs](https://babiesiq.tech/docs) |
| Репозиторий | [github.com/BabiesIQ/_metaAPI](https://github.com/BabiesIQ/_metaAPI) |

</details>

---

<!-- ═══════════════════════════════════════════════════════════ AMHARIC -->
<details>
<summary><b>🇪🇹 &nbsp;አማርኛ — የፓርትነር ማዋቀሪያ መመሪያ</b></summary>

<br/>

## PartnersIOD ምንድን ነው?

`BabiesIQ/_metaAPI` **ሙሉ White-Label የሙዚቃ API ደንበኛ** ነው — ኮፒ ያድርጉ፣ የራስዎን ብራንድ ያስቀምጡ፣ ለተጠቃሚዎችዎ ያቅርቡ። ዋናው ሥራ (streaming, search, lyrics, metadata, CDN) `api.babiesiq.tech` ላይ ይሠራል — ለተጠቃሚዎችዎ **ሙሉ በሙሉ ሚስጥራዊ ነው**።

---

## ⚡ አጭር ማጠቃለያ

```
የእርስዎ ድህረ-ገጽ ──▶ api.yoursite.com ──▶ api.babiesiq.tech
        ↑                  ↑                     ↑
  የእርስዎ ሎጎ/UI       Proxy ሽፋን          ዋናው ሞተር
  የእርስዎ ዶሜን        ጥያቄዎችን ያስተላልፋል   ለተጠቃሚ አይታይም
```

---

## 📋 ደረጃ 1 — ኮፒ ያድርጉ እና ብራንድ ያድርጉ

```bash
git clone https://github.com/BabiesIQ/_metaAPI.git yene-music-api
cd yene-music-api
```

እነዚህ ፋይሎች ይክፈቱ እና የብራንድዎን ስም ይቀይሩ:

| ፋይል / መስክ | ምን ይቀይሩ | ምሳሌ |
|---|---|---|
| `package.json` → `name` | የፕሮጀክቱ ስም | `"yene-music-api"` |
| `README.md` | የብራንድ ስም, ሎጎ | `YeneMusic API` |
| `src/config.ts` → `APP_NAME` | በኮድ ውስጥ ብራንድ | `"YeneMusic"` |
| `public/logo.png` | የእርስዎ ሎጎ | ፋይሉን ይጫኑ |
| `src/config.ts` → `SUPPORT_URL` | የድጋፍ ሊንክ | Telegram ሊንክዎ |

> ⚠️ **`api.babiesiq.tech`ን ፈጽሞ አይቀይሩ።** ይህ ሞተሩ ነው — ሁልጊዜ ሚስጥር ሆኖ መቆየት አለበት።

---

## 🔒 ደረጃ 2 — Backend ሚስጥር ያድርጉ (ሁለት ዘዴዎች)

### ✅ ዘዴ 1 — ቀጥተኛ (ቀላሉ)

ድህረ-ገጽዎ ቀጥታ ወደ `api.babiesiq.tech` ይደውላል። URL ሚኒፋይ ከሆነ JavaScript ውስጥ ተደብቋል — ተጠቃሚዎቹ ፈጽሞ አይሹም።

> ✦ `.env` ን `.gitignore` ውስጥ ያስገቡ — API ቁልፎቹ ይፋዊ repository ውስጥ እንዳይኖሩ።

---

### ✅ ዘዴ 2 — Reverse Proxy (ምርጥ ዘዴ)

Proxy ያዋቅሩ — ሁሉም ትራፊክ ከእርስዎ ዶሜን የሚመጣ ይመስላል።

**Proxy በራስሱ የሚሠራው:**
- `/api/song` እና `/api/video` JSON ውስጥ stream URL → የእርስዎ ዶሜን
- Google Sign-In በኋላ redirect → የእርስዎ ዶሜን (api.babiesiq.tech አይደለም)
- Audio/video streaming → zero-buffer pass-through

```
ተጠቃሚ ይሄን ያያል:  api.yenemusic.com  ← የእርስዎ ዶሜን
እውነታው:          api.babiesiq.tech  ← ሚስጥር ሆኖ ሰርቷል
```

---

#### Nginx (VPS / Linux)

```nginx
# Setup: sudo certbot --nginx -d api.yenemusic.com

server {
    listen 80;
    server_name api.yenemusic.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yenemusic.com;

    ssl_certificate     /etc/letsencrypt/live/api.yenemusic.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yenemusic.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_session_cache   shared:SSL:10m;

    # ── Route 1: Audio/Video stream bytes ─────────────────────────────────────
    location ~ ^/api/stream/ {
        proxy_pass              https://api.babiesiq.tech;
        proxy_ssl_server_name   on;
        proxy_ssl_name          api.babiesiq.tech;
        proxy_http_version      1.1;
        proxy_set_header        Host              api.babiesiq.tech;
        proxy_set_header        X-Real-IP         $remote_addr;
        proxy_set_header        X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_set_header        X-Forwarded-Host  $host;
        proxy_pass_request_headers on;
        proxy_buffering             off;
        proxy_cache                 off;
        proxy_read_timeout          3600s;
        proxy_send_timeout          3600s;
        proxy_request_buffering     off;
        chunked_transfer_encoding   on;
    }

    # ── Route 2: Song & Video — stream URL rewrite ────────────────────────────
    location ~ ^/api/(song|video) {
        # Handle CORS preflight first
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin      $http_origin always;
            add_header Access-Control-Allow-Credentials true always;
            add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;
            return 204;
        }

        proxy_pass              https://api.babiesiq.tech;
        proxy_ssl_server_name   on;
        proxy_ssl_name          api.babiesiq.tech;
        proxy_http_version      1.1;
        proxy_set_header        Host              api.babiesiq.tech;
        proxy_set_header        X-Real-IP         $remote_addr;
        proxy_set_header        X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_set_header        X-Forwarded-Host  $host;
        proxy_pass_request_headers on;
        proxy_pass_request_body    on;
        proxy_pass_header       Set-Cookie;
        proxy_cookie_domain     api.babiesiq.tech api.yenemusic.com;

        proxy_set_header        Accept-Encoding "";

        sub_filter              'api.babiesiq.tech' 'api.yenemusic.com';
        sub_filter_once         off;
        sub_filter_types        application/json text/plain;

        proxy_redirect          https://api.babiesiq.tech/ https://api.yenemusic.com/;

        # Strip backend CORS headers to prevent duplicates
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Credentials;
        proxy_hide_header Access-Control-Allow-Methods;
        proxy_hide_header Access-Control-Allow-Headers;
        proxy_hide_header Access-Control-Expose-Headers;
        proxy_hide_header Access-Control-Max-Age;

        add_header Access-Control-Allow-Origin      $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;
    }

    # ── Route 3: ሌሎች (auth, Google OAuth, health, ወዘተ) ───────────────────────
    location / {
        # Handle CORS preflight first — before proxy_pass
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin      $http_origin always;
            add_header Access-Control-Allow-Credentials true always;
            add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;
            return 204;
        }

        proxy_pass              https://api.babiesiq.tech;
        proxy_ssl_server_name   on;
        proxy_ssl_name          api.babiesiq.tech;
        proxy_http_version      1.1;
        proxy_set_header        Host              api.babiesiq.tech;
        proxy_set_header        X-Real-IP         $remote_addr;
        proxy_set_header        X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_set_header        X-Forwarded-Host  $host;
        proxy_pass_request_headers on;
        proxy_pass_request_body    on;
        proxy_pass_header       Set-Cookie;
        proxy_cookie_domain     api.babiesiq.tech api.yenemusic.com;

        proxy_redirect          https://api.babiesiq.tech/ https://api.yenemusic.com/;

        # Strip backend CORS headers to prevent duplicates
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Credentials;
        proxy_hide_header Access-Control-Allow-Methods;
        proxy_hide_header Access-Control-Allow-Headers;
        proxy_hide_header Access-Control-Expose-Headers;
        proxy_hide_header Access-Control-Max-Age;

        add_header Access-Control-Allow-Origin      $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;

        # Standard timeouts for JSON API (not streaming)
        proxy_connect_timeout   10s;
        proxy_read_timeout      60s;
        proxy_send_timeout      60s;
    }
}
```

---

#### Node.js / Express

```js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
app.set('trust proxy', true);

const BACKEND       = 'https://api.babiesiq.tech';
const YOUR_DOMAIN   = 'api.yenemusic.com';        // ← ዶሜንዎ
const SONG_VIDEO_RE = /^\/api\/(song|video)/;

app.use('/', createProxyMiddleware({
  target:             BACKEND,
  changeOrigin:       true,
  secure:             true,
  selfHandleResponse: true,
  cookieDomainRewrite: { 'api.babiesiq.tech': YOUR_DOMAIN },

  on: {
    proxyReq: (proxyReq, req) => {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      proxyReq.setHeader('X-Real-IP', ip);
      proxyReq.setHeader('X-Forwarded-For', ip);
      proxyReq.setHeader('X-Forwarded-Proto', 'https');
      if (SONG_VIDEO_RE.test(req.url)) {
        proxyReq.removeHeader('Accept-Encoding');
      }
    },

    proxyRes: (proxyRes, req, res) => {
      const userHost = req.headers.host || YOUR_DOMAIN;

      const origin = req.headers['origin'] || '*';
      res.setHeader('Access-Control-Allow-Origin',      origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers',     'Authorization, Content-Type, X-API-Key, X-Request-ID');

      const location = proxyRes.headers['location'];
      if (location) {
        res.setHeader('Location', location.replace('https://api.babiesiq.tech', `https://${userHost}`));
        delete proxyRes.headers['location'];
      }

      Object.entries(proxyRes.headers).forEach(([k, v]) => res.setHeader(k, v));
      res.statusCode = proxyRes.statusCode;

      if (SONG_VIDEO_RE.test(req.url)) {
        const chunks = [];
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
          let body = Buffer.concat(chunks).toString('utf8');
          body = body.replace(/https:\/\/api\.babiesiq\.tech/g, `https://${userHost}`);
          res.setHeader('Content-Length', Buffer.byteLength(body));
          res.end(body);
        });
        return;
      }

      proxyRes.pipe(res);
    },

    error: (err, req, res) => {
      res.status(502).json({ success: false, error: 'Gateway error' });
    }
  }
}));

app.listen(3000);
```

---

#### Cloudflare Worker (ነፃ — ምንም server አያስፈልግ)

```js
export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);
    const userDomain  = incomingUrl.hostname;
    incomingUrl.hostname = 'api.babiesiq.tech';

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin':      request.headers.get('Origin') || '*',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods':     'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers':     'Authorization, Content-Type, X-API-Key, X-Request-ID',
          'Access-Control-Max-Age':           '86400',
        },
      });
    }

    const proxyReq = new Request(incomingUrl.toString(), {
      method:  request.method,
      headers: request.headers,
      body:    ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });

    const response = await fetch(proxyReq);

    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin',      request.headers.get('Origin') || '*');
    newHeaders.set('Access-Control-Allow-Credentials', 'true');
    newHeaders.set('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers',     'Authorization, Content-Type, X-API-Key, X-Request-ID');

    const location = response.headers.get('location');
    if (location) {
      newHeaders.set('location', location.replace('https://api.babiesiq.tech', `https://${userDomain}`));
    }

    if (/^\/api\/(song|video)/.test(incomingUrl.pathname)) {
      const body = await response.text();
      const rewritten = body.replace(/https:\/\/api\.babiesiq\.tech/g, `https://${userDomain}`);
      newHeaders.set('Content-Length', new TextEncoder().encode(rewritten).length.toString());
      return new Response(rewritten, {
        status:     response.status,
        statusText: response.statusText,
        headers:    newHeaders,
      });
    }

    return new Response(response.body, {
      status:     response.status,
      statusText: response.statusText,
      headers:    newHeaders,
    });
  }
};
```

> Cloudflare dashboard ውስጥ Route ን `api.yenemusic.com/*` ያዋቅሩ።

---

## 📣 ደረጃ 3 — ዶሜንዎን ይመዝግቡ (አስፈላጊ!)

> **⚠️ ይህ ደረጃ ሳያደርጉ ሁሉም ጥያቄዎች `401 Unauthorized` ይመልሳሉ።**

ዶሜንዎን ካዋቀሩ በኋላ ያሳውቁን — **Whitelist** ውስጥ ይጨምርዎታለን።

<a href="https://t.me/+q43QONRtkrg5NGFk">
  <img src="https://img.shields.io/badge/▶ Support ያግኙ-Telegram-blue?style=for-the-badge&logo=telegram" alt="Support"/>
</a>

**ይህን ይላኩ:**
```
Domain Registration Request
ዶሜኔ: api.yenemusic.com
ፕሮጀክት: [የፕሮጀክትዎ ስም]
ዘዴ: [Nginx / Node / Cloudflare / Direct]
```

**ዶሜንዎ ውስጥ 24 ሰዓት ውስጥ** ይጨምራል።

---

## ✅ ደረጃ 4 — ይሞክሩ

```bash
curl -s https://api.yenemusic.com/api/song?query=Tl4bQBfOtbg | grep stream
# Expected: "stream": "https://api.yenemusic.com/api/stream/..."

curl -I https://api.yenemusic.com/health
# Expected: HTTP/2 200
```

---

## 🆘 እርዳታ ይፈልጋሉ?

| | ሊንክ |
|---|---|
| Support Chat | [t.me/+q43QONRtkrg5NGFk](https://t.me/+q43QONRtkrg5NGFk) |
| Documentation | [babiesiq.tech/docs](https://babiesiq.tech/docs) |
| Source Repo | [github.com/BabiesIQ/_metaAPI](https://github.com/BabiesIQ/_metaAPI) |

</details>

---

<div align="center">

<br/>

**◆ BabiesIQ · PartnersIOD**

*White-Label Music Infrastructure for Developers*

[![Support](https://img.shields.io/badge/Join_Support-Telegram-blue?style=flat-square&logo=telegram)](https://t.me/+q43QONRtkrg5NGFk)
[![Docs](https://img.shields.io/badge/Documentation-babiesiq.tech-blueviolet?style=flat-square)](https://babiesiq.tech/docs)

</div>
