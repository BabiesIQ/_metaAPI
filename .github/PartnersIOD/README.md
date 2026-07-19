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

Set up a proxy so all traffic appears to come from **your own domain**. CORS works perfectly, cookies are forwarded, and `api.babiesiq.tech` is completely invisible.

**How it looks to the user:**
```
User sees:  api.mymusic.com  ← your domain
Reality:    api.babiesiq.tech ← silently behind it
```

---

#### Option A — Nginx (VPS / Linux server)

```nginx
# /etc/nginx/sites-available/api.mymusic.com
# Setup: sudo certbot --nginx -d api.mymusic.com

server {
    listen 80;
    server_name api.mymusic.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.mymusic.com;

    # SSL — auto-filled by certbot
    ssl_certificate     /etc/letsencrypt/live/api.mymusic.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.mymusic.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_session_cache   shared:SSL:10m;

    location / {
        proxy_pass          https://api.babiesiq.tech;
        proxy_http_version  1.1;

        # Backend sees request as coming from api.babiesiq.tech
        proxy_set_header    Host              api.babiesiq.tech;

        # Forward real client identity (IP, fingerprint)
        proxy_set_header    X-Real-IP         $remote_addr;
        proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto $scheme;

        # Forward all original headers (User-Agent, Authorization, X-API-Key, etc.)
        proxy_pass_request_headers on;

        # Forward request body (POST, PUT, PATCH)
        proxy_pass_request_body on;

        # Forward & rewrite cookies so they work on your domain
        proxy_pass_header   Set-Cookie;
        proxy_cookie_domain api.babiesiq.tech api.mymusic.com;

        # CORS — allows your frontend to call this without errors
        add_header Access-Control-Allow-Origin      $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;

        if ($request_method = OPTIONS) {
            return 204;
        }

        # Streaming support (audio/video)
        proxy_buffering             off;
        proxy_cache                 off;
        proxy_read_timeout          3600s;
        proxy_send_timeout          3600s;
        proxy_request_buffering     off;
        chunked_transfer_encoding   on;
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

app.use('/', createProxyMiddleware({
  target:      'https://api.babiesiq.tech',
  changeOrigin: true,   // sets Host: api.babiesiq.tech
  secure:       true,
  cookieDomainRewrite: {
    'api.babiesiq.tech': 'api.mymusic.com'
  },
  on: {
    proxyReq: (proxyReq, req) => {
      // Forward real IP and fingerprint headers
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      proxyReq.setHeader('X-Real-IP', ip);
      proxyReq.setHeader('X-Forwarded-For', ip);
      proxyReq.setHeader('X-Forwarded-Proto', 'https');
    },
    proxyRes: (proxyRes, req, res) => {
      // CORS — allow your frontend origin
      const origin = req.headers['origin'] || '*';
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-API-Key, X-Request-ID');
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
    const url = new URL(request.url);
    url.hostname = 'api.babiesiq.tech';  // redirect to real backend

    // Handle CORS preflight
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

    // Forward request with all original headers + body
    const proxyRequest = new Request(url.toString(), {
      method:  request.method,
      headers: request.headers,
      body:    ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'follow',
    });

    const response = await fetch(proxyRequest);

    // Return response with CORS headers added
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin',      request.headers.get('Origin') || '*');
    newHeaders.set('Access-Control-Allow-Credentials', 'true');
    newHeaders.set('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers',     'Authorization, Content-Type, X-API-Key, X-Request-ID');

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
curl -I https://api.mymusic.com/health

# Expected response
HTTP/2 200
access-control-allow-origin: https://mymusic.com
x-powered-by: BabiesIQ (hidden from user)
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

---

## 🔒 Step 2 — Backend छुपाओ (दो तरीके)

### ✅ तरीका 1 — Embedded (सबसे आसान)

आपकी website सीधे `api.babiesiq.tech` को call करती है। यह URL minified JavaScript के अंदर छुपा रहता है — आम user कभी नहीं देख पाता।

> ✦ `.env` को `.gitignore` में ज़रूर डालो ताकि API keys public न हों।

---

### ✅ तरीका 2 — Reverse Proxy (सबसे Professional)

एक proxy layer लगाओ जो आपके domain से आने वाला सब request `api.babiesiq.tech` को silently forward करे। CORS, cookies, fingerprint — सब कुछ सही तरीके से forward होगा।

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

    location / {
        proxy_pass          https://api.babiesiq.tech;
        proxy_http_version  1.1;

        # Backend को लगेगा request सीधे api.babiesiq.tech पे आई
        proxy_set_header    Host              api.babiesiq.tech;

        # User का असली IP और fingerprint forward करो
        proxy_set_header    X-Real-IP         $remote_addr;
        proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto $scheme;

        # सभी original headers forward (User-Agent, Authorization, X-API-Key, etc.)
        proxy_pass_request_headers on;

        # Request body भी forward (POST, PUT, PATCH के लिए)
        proxy_pass_request_body on;

        # Cookies bilkul as-is forward (session, auth सब)
        proxy_pass_header   Set-Cookie;
        proxy_cookie_domain api.babiesiq.tech api.meramusic.com;

        # CORS — आपके frontend को errors नहीं आएंगे
        add_header Access-Control-Allow-Origin      $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;

        if ($request_method = OPTIONS) {
            return 204;
        }

        # Streaming support (audio/video के लिए)
        proxy_buffering             off;
        proxy_cache                 off;
        proxy_read_timeout          3600s;
        proxy_send_timeout          3600s;
        proxy_request_buffering     off;
        chunked_transfer_encoding   on;
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

app.use('/', createProxyMiddleware({
  target:       'https://api.babiesiq.tech',
  changeOrigin: true,
  secure:       true,
  cookieDomainRewrite: { 'api.babiesiq.tech': 'api.meramusic.com' },
  on: {
    proxyReq: (proxyReq, req) => {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      proxyReq.setHeader('X-Real-IP', ip);
      proxyReq.setHeader('X-Forwarded-For', ip);
      proxyReq.setHeader('X-Forwarded-Proto', 'https');
    },
    proxyRes: (proxyRes, req, res) => {
      const origin = req.headers['origin'] || '*';
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-API-Key, X-Request-ID');
    },
    error: (err, req, res) => {
      res.status(502).json({ success: false, error: 'Gateway error' });
    }
  }
}));

app.listen(3000, () => console.log('Proxy :3000 pe chal raha hai'));
```

```bash
npm install -g pm2
pm2 start proxy-server.js --name mera-api-proxy
pm2 save
```

---

#### Cloudflare Worker (Free — कोई server नहीं चाहिए)

```js
// Cloudflare Workers dashboard में paste करो
export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'api.babiesiq.tech';

    // OPTIONS preflight handle करो
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

    // सभी headers और body silently forward करो
    const proxyRequest = new Request(url.toString(), {
      method:  request.method,
      headers: request.headers,
      body:    ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'follow',
    });

    const response = await fetch(proxyRequest);

    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin',      request.headers.get('Origin') || '*');
    newHeaders.set('Access-Control-Allow-Credentials', 'true');
    newHeaders.set('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers',     'Authorization, Content-Type, X-API-Key, X-Request-ID');

    return new Response(response.body, {
      status:     response.status,
      statusText: response.statusText,
      headers:    newHeaders,
    });
  }
};
```

> Cloudflare dashboard में Route को `api.meramusic.com/*` पर set करो।

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

Настройте прокси, чтобы весь трафик выглядел как трафик с **вашего домена**. CORS работает идеально, куки передаются, а `api.babiesiq.tech` полностью невидим.

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

    location / {
        proxy_pass          https://api.babiesiq.tech;
        proxy_http_version  1.1;

        # Бэкенд воспринимает запрос как прямой вызов к api.babiesiq.tech
        proxy_set_header    Host              api.babiesiq.tech;

        # Передаём реальный IP и fingerprint пользователя
        proxy_set_header    X-Real-IP         $remote_addr;
        proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto $scheme;

        # Все оригинальные заголовки (User-Agent, Authorization, X-API-Key и др.)
        proxy_pass_request_headers on;

        # Тело запроса (для POST, PUT, PATCH)
        proxy_pass_request_body on;

        # Куки передаём и перезаписываем домен
        proxy_pass_header   Set-Cookie;
        proxy_cookie_domain api.babiesiq.tech api.mymusic.ru;

        # CORS — фронтенд работает без ошибок
        add_header Access-Control-Allow-Origin      $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;

        if ($request_method = OPTIONS) {
            return 204;
        }

        # Поддержка стриминга (аудио/видео)
        proxy_buffering             off;
        proxy_cache                 off;
        proxy_read_timeout          3600s;
        proxy_send_timeout          3600s;
        proxy_request_buffering     off;
        chunked_transfer_encoding   on;
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

app.use('/', createProxyMiddleware({
  target:       'https://api.babiesiq.tech',
  changeOrigin: true,
  secure:       true,
  cookieDomainRewrite: { 'api.babiesiq.tech': 'api.mymusic.ru' },
  on: {
    proxyReq: (proxyReq, req) => {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      proxyReq.setHeader('X-Real-IP', ip);
      proxyReq.setHeader('X-Forwarded-For', ip);
      proxyReq.setHeader('X-Forwarded-Proto', 'https');
    },
    proxyRes: (proxyRes, req, res) => {
      const origin = req.headers['origin'] || '*';
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-API-Key, X-Request-ID');
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
// Вставьте в панель Cloudflare Workers
export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'api.babiesiq.tech';

    // Обработка preflight OPTIONS
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

    // Передаём все заголовки и тело запроса
    const proxyRequest = new Request(url.toString(), {
      method:  request.method,
      headers: request.headers,
      body:    ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'follow',
    });

    const response = await fetch(proxyRequest);

    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin',      request.headers.get('Origin') || '*');
    newHeaders.set('Access-Control-Allow-Credentials', 'true');
    newHeaders.set('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers',     'Authorization, Content-Type, X-API-Key, X-Request-ID');

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

Proxy ያዋቅሩ። ሁሉም ትራፊክ **ከእርስዎ ዶሜን** የሚመጣ ይመስላል። CORS ትክክለኛ ይሠራል፣ cookies ይተላለፋሉ፣ `api.babiesiq.tech` ሙሉ በሙሉ የማይታይ ይሆናል።

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

    location / {
        proxy_pass          https://api.babiesiq.tech;
        proxy_http_version  1.1;

        proxy_set_header    Host              api.babiesiq.tech;
        proxy_set_header    X-Real-IP         $remote_addr;
        proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto $scheme;

        proxy_pass_request_headers on;
        proxy_pass_request_body    on;

        proxy_pass_header   Set-Cookie;
        proxy_cookie_domain api.babiesiq.tech api.yenemusic.com;

        add_header Access-Control-Allow-Origin      $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers     "Authorization, Content-Type, X-API-Key, X-Request-ID, X-Requested-With" always;

        if ($request_method = OPTIONS) {
            return 204;
        }

        # Streaming (audio/video)
        proxy_buffering             off;
        proxy_cache                 off;
        proxy_read_timeout          3600s;
        proxy_send_timeout          3600s;
        proxy_request_buffering     off;
        chunked_transfer_encoding   on;
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

app.use('/', createProxyMiddleware({
  target:       'https://api.babiesiq.tech',
  changeOrigin: true,
  secure:       true,
  cookieDomainRewrite: { 'api.babiesiq.tech': 'api.yenemusic.com' },
  on: {
    proxyReq: (proxyReq, req) => {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      proxyReq.setHeader('X-Real-IP', ip);
      proxyReq.setHeader('X-Forwarded-For', ip);
      proxyReq.setHeader('X-Forwarded-Proto', 'https');
    },
    proxyRes: (proxyRes, req, res) => {
      const origin = req.headers['origin'] || '*';
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-API-Key, X-Request-ID');
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
    const url = new URL(request.url);
    url.hostname = 'api.babiesiq.tech';

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

    const proxyRequest = new Request(url.toString(), {
      method:  request.method,
      headers: request.headers,
      body:    ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'follow',
    });

    const response = await fetch(proxyRequest);

    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin',      request.headers.get('Origin') || '*');
    newHeaders.set('Access-Control-Allow-Credentials', 'true');
    newHeaders.set('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers',     'Authorization, Content-Type, X-API-Key, X-Request-ID');

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
