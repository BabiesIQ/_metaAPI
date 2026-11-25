// A deployment can replace a fingerprinted lazy chunk while an older tab is open.
const RELOAD_KEY = "babiesiq-chunk-recovery-v1";
const COOLDOWN_MS = 60_000;
let attempted = false;

export function isChunkLoadError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module|loading chunk .+ failed|unable to preload css|failed to load module script|chunkloaderror/i.test(message);
}

export function recoverChunk(error: unknown) {
  if (!isChunkLoadError(error) || attempted || !navigator.onLine) return false;
  const url = new URL(window.location.href);
  // The URL marker also prevents loops when storage is disabled.
  const previous = Number(url.searchParams.get("__biq_reload") || 0);
  const now = Date.now();
  if (previous && now - previous < COOLDOWN_MS) return false;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (last && now - last < COOLDOWN_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(now));
  } catch {}
  attempted = true;
  url.searchParams.set("__biq_reload", String(now));
  window.location.replace(url.toString());
  return true;
}
