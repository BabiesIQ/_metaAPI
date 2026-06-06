import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, "dist");

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.static(DIST));

// ── Health / Ping endpoint ────────────────────────────────────────────────────
app.get("/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/health", (_req, res) => res.json({ status: "ok", ts: Date.now() }));

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.get("*", (_req, res) => {
  res.sendFile(path.join(DIST, "index.html"));
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
