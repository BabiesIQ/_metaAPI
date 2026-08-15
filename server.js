import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, "dist");
const INDEX_HTML = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const SITE_ORIGIN = "https://babiesiq.tech";
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/assets/banner.svg`;

const PUBLIC_SEO = {
  "/": {
    title: "BabiesIQ | YouTube Audio & Video Streaming API",
    description:
      "BabiesIQ is a fast YouTube audio and video streaming API for developers. Search videos, get stream URLs, apply EQ presets, and build with one API key.",
  },
  "/docs": {
    title: "BabiesIQ API Docs | YouTube Audio & Video Streaming API",
    description:
      "Read the BabiesIQ REST API documentation for YouTube search, audio and video stream URLs, downloads, seek, EQ presets, rate limits, and code examples.",
  },
  "/pricing": {
    title: "BabiesIQ API Pricing | Free YouTube Streaming API Plan",
    description:
      "Compare BabiesIQ API plans for YouTube audio and video streaming, search, downloads, EQ presets, request limits, and developer support.",
  },
  "/contact": {
    title: "Contact BabiesIQ | API Support and Partnerships",
    description:
      "Contact the BabiesIQ team for API integration support, streaming API questions, business plans, partnerships, and developer help.",
  },
  "/privacy": {
    title: "BabiesIQ Privacy Policy",
    description: "Read the BabiesIQ privacy policy for the website, API, and developer accounts.",
  },
  "/terms": {
    title: "BabiesIQ Terms of Service",
    description: "Read the terms that apply to using the BabiesIQ API, website, and developer services.",
  },
  "/refund": {
    title: "BabiesIQ Refund Policy",
    description: "Read the BabiesIQ refund policy for paid API plans and developer services.",
  },
};

function escapeAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

function seoHtml(pathname) {
  const page = PUBLIC_SEO[pathname];
  const title = page?.title ?? "BabiesIQ | YouTube Audio & Video Streaming API";
  const description =
    page?.description ??
    "BabiesIQ is a fast YouTube audio and video streaming API for developers.";
  const robots = page ? "index, follow" : "noindex, follow";
  const canonical = `${SITE_ORIGIN}${pathname === "/" ? "/" : pathname}`;
  return INDEX_HTML.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${escapeAttribute(description)}" />`,
    )
    .replace(
      /<meta name="robots"[^>]*>/,
      `<meta name="robots" content="${robots}" />`,
    )
    .replace(
      /<link rel="canonical"[^>]*>/,
      `<link rel="canonical" href="${escapeAttribute(canonical)}" />`,
    )
    .replace(
      /<meta property="og:title"[^>]*>/,
      `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    )
    .replace(
      /<meta property="og:description"[^>]*>/,
      `<meta property="og:description" content="${escapeAttribute(description)}" />`,
    )
    .replace(
      /<meta property="og:url"[^>]*>/,
      `<meta property="og:url" content="${escapeAttribute(canonical)}" />`,
    )
    .replace(
      /<meta property="og:image"[^>]*>/,
      `<meta property="og:image" content="${DEFAULT_OG_IMAGE}" />`,
    )
    .replace(
      /<meta name="twitter:title"[^>]*>/,
      `<meta name="twitter:title" content="${escapeAttribute(title)}" />`,
    )
    .replace(
      /<meta name="twitter:description"[^>]*>/,
      `<meta name="twitter:description" content="${escapeAttribute(description)}" />`,
    )
    .replace(
      /<meta name="twitter:image"[^>]*>/,
      `<meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />`,
    );
}

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.static(DIST));

// ── Health / Ping endpoint ────────────────────────────────────────────────────
app.get("/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/health", (_req, res) => res.json({ status: "ok", ts: Date.now() }));

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.get("*", (req, res) => {
  res.type("html").send(seoHtml(req.path));
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ BabiesIQ Web running on port ${PORT}`);
  startKeepAlive();
});

// ── Self-Ping (Anti-Sleep) ────────────────────────────────────────────────────
// Platforms with sleep mode:
//   Render free    → sleeps after 15 min  → ping every 14 min
//   Replit free    → sleeps after 30 min  → ping every 14 min
//   Koyeb free     → no sleep ✅
//   Railway free   → no sleep ✅
//   Heroku Basic+  → no sleep ✅
//   Vercel/Netlify → serverless (no sleep issue) ✅
function getSelfUrl() {
  // Each platform exposes its own env var for the public URL
  return (
    process.env.APP_URL ||                          // Custom — set karo manually
    process.env.RENDER_EXTERNAL_URL ||              // Render
    process.env.RAILWAY_PUBLIC_DOMAIN && `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` ||
    process.env.KOYEB_PUBLIC_DOMAIN && `https://${process.env.KOYEB_PUBLIC_DOMAIN}` ||
    process.env.HEROKU_APP_NAME && `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` ||
    null
  );
}

function startKeepAlive() {
  const url = getSelfUrl();

  if (!url) {
    console.log("ℹ️  Keep-alive: No public URL detected — skipping self-ping.");
    console.log("   Tip: APP_URL env var set karo (e.g. https://yourapp.onrender.com)");
    return;
  }

  const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes
  const pingUrl = `${url}/ping`;

  console.log(`🏓 Keep-alive ping active → ${pingUrl} (every 14 min)`);

  // First ping after 1 minute (let server settle)
  setTimeout(() => ping(pingUrl), 60_000);

  // Then every 14 minutes
  setInterval(() => ping(pingUrl), PING_INTERVAL_MS);
}

async function ping(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (res.ok) {
      console.log(`🏓 Ping OK [${new Date().toISOString()}]`);
    } else {
      console.warn(`⚠️  Ping failed: HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn(`⚠️  Ping error: ${err.message}`);
  }
}
