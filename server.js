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

const SEO_ROUTES = JSON.parse(
  fs.readFileSync(path.join(__dirname, "src/lib/seo-routes.json"), "utf8"),
).routes;
const PUBLIC_SEO = Object.fromEntries(SEO_ROUTES.map((route) => [route.path, route]));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("'", "&#39;");
}

function replaceWholeHeadTag(html, marker, replacement) {
  const start = html.indexOf(marker);
  if (start < 0) return html;
  const end = html.indexOf(">", start);
  if (end < 0) return html;
  return html.slice(0, start) + replacement + html.slice(end + 1);
}

function replaceMeta(html, attribute, key, value) {
  const marker = '<meta ' + attribute + '="' + key + '"';
  const tag = '<meta ' + attribute + '="' + key + '" content="' + escapeHtml(value) + '" />';
  if (html.includes(marker)) return replaceWholeHeadTag(html, marker, tag);
  return html.replace("</head>", "    " + tag + "\n  </head>");
}

function renderSeoFallback(page) {
  const links = SEO_ROUTES.map((item) => '<li><a href="' + escapeHtml(item.path) + '">' + escapeHtml(item.label) + '</a></li>').join("");
  return '<!--SEO_FALLBACK_START--><main class="seo-fallback" style="max-width:68rem;margin:0 auto;padding:3rem 1.5rem;color:#e7e7ed;font-family:system-ui,sans-serif"><p style="color:#8b86ff;font-size:.75rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase">BabiesIQ · Developer platform</p><h1 style="font-size:clamp(2rem,5vw,3.25rem);line-height:1.1;margin:1rem 0">' + escapeHtml(page.heading) + '</h1><p style="max-width:48rem;color:#a4a4b2;line-height:1.7">' + escapeHtml(page.summary) + '</p><nav aria-label="Public pages"><ul style="display:flex;flex-wrap:wrap;gap:.75rem 1.25rem;padding:1.5rem 0 0 1.25rem">' + links + '</ul></nav></main><!--SEO_FALLBACK_END-->';
}

function seoHtml(pathname) {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const page = PUBLIC_SEO[normalizedPath];
  const title = page?.title ?? "Page not found | BabiesIQ";
  const description =
    page?.description ?? "This BabiesIQ page could not be found.";
  const robots = page ? "index, follow" : "noindex, follow";
  const canonical = SITE_ORIGIN + normalizedPath;
  let html = INDEX_HTML;
  const titleStart = html.indexOf("<title>");
  const titleEnd = html.indexOf("</title>", titleStart);
  if (titleStart >= 0 && titleEnd >= 0) {
    html = html.slice(0, titleStart) + "<title>" + escapeHtml(title) + "</title>" + html.slice(titleEnd + 8);
  }
  html = replaceWholeHeadTag(html, '<link rel="canonical"', '<link rel="canonical" href="' + escapeHtml(canonical) + '" />');
  html = replaceMeta(html, "name", "description", description);
  html = replaceMeta(html, "name", "robots", robots);
  html = replaceMeta(html, "property", "og:title", title);
  html = replaceMeta(html, "property", "og:description", description);
  html = replaceMeta(html, "property", "og:type", "website");
  html = replaceMeta(html, "property", "og:url", canonical);
  html = replaceMeta(html, "property", "og:image", DEFAULT_OG_IMAGE);
  html = replaceMeta(html, "property", "og:site_name", "BabiesIQ");
  html = replaceMeta(html, "name", "twitter:card", "summary_large_image");
  html = replaceMeta(html, "name", "twitter:title", title);
  html = replaceMeta(html, "name", "twitter:description", description);
  html = replaceMeta(html, "name", "twitter:image", DEFAULT_OG_IMAGE);

  const icon = page
    ? "data:image/svg+xml," + encodeURIComponent(page.iconSvg)
    : "/favicon.svg";
  html = replaceWholeHeadTag(
    html,
    '<link rel="icon" type="image/svg+xml"',
    '<link rel="icon" type="image/svg+xml" href="' + escapeHtml(icon) + '" />',
  );

  const fallbackStart = html.indexOf("<!--SEO_FALLBACK_START-->");
  const fallbackEnd = html.indexOf("<!--SEO_FALLBACK_END-->");
  if (fallbackStart >= 0 && fallbackEnd >= fallbackStart) {
    const fallback = page ? renderSeoFallback(page) : "";
    html = html.slice(0, fallbackStart) + fallback + html.slice(fallbackEnd + "<!--SEO_FALLBACK_END-->".length);
  }
  return html;
}

// ── Static files ──────────────────────────────────────────────────────────────
// Vite's fingerprinted assets are safe to cache for a year. Runtime config and
// non-fingerprinted public files get shorter cache lifetimes.
app.use(
  express.static(DIST, {
    index: false,
    setHeaders(res, filePath) {
      const relativePath = path.relative(DIST, filePath).replaceAll(path.sep, "/");
      const fileName = path.basename(filePath);

      if (
        relativePath.startsWith("assets/index-") ||
        /\.[a-f0-9]{8,}\.(?:js|css|map)$/i.test(fileName)
      ) {
        res.setHeader(
          "Cache-Control",
          "public, max-age=31536000, immutable",
        );
        return;
      }

      if (fileName === "config.json") {
        res.setHeader(
          "Cache-Control",
          "public, max-age=300, stale-while-revalidate=86400",
        );
        return;
      }

      if (relativePath.startsWith("assets/")) {
        res.setHeader(
          "Cache-Control",
          "public, max-age=604800, stale-while-revalidate=2592000",
        );
      }
    },
  }),
);

// ── Health / Ping endpoint ────────────────────────────────────────────────────
app.get("/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/health", (_req, res) => res.json({ status: "ok", ts: Date.now() }));

const APP_ROUTES = new Set([
  "/",
  "/docs",
  "/pricing",
  "/contact",
  "/privacy",
  "/terms",
  "/refund",
  "/sitemap",
  "/login",
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth/verify-otp",
  "/auth/create-password",
  "/auth/password-success",
  "/auth/callback",
  "/banned",
  "/panel/dashboard",
  "/panel/api-keys",
  "/panel/usage",
  "/panel/billing",
  "/panel/invoices",
  "/panel/notifications",
  "/panel/profile-settings",
  "/connect/telegram",
  "/admin/login",
  "/admin/dashboard",
  "/admin/users",
  "/admin/support",
  "/admin/admins",
  "/admin/announcements",
  "/admin/domains",
]);

function isKnownAppRoute(pathname) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return (
    APP_ROUTES.has(normalized) ||
    /^\/admin\/(?:users|support)\/[^/]+$/.test(normalized)
  );
}

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.get("*", (req, res) => {
  res.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
  );
  res
    .status(isKnownAppRoute(req.path) ? 200 : 404)
    .type("html")
    .send(seoHtml(req.path));
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
