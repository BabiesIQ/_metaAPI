import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const siteOrigin = "https://babiesiq.tech";
const defaultOgImage = siteOrigin + "/assets/banner.svg";
const routeData = JSON.parse(await fs.readFile(path.join(root, "src/lib/seo-routes.json"), "utf8"));
const routes = routeData.routes;

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}

function replaceWholeTag(html, marker, replacement) {
  const start = html.indexOf(marker);
  if (start < 0) return html;
  const end = html.indexOf(">", start);
  if (end < 0) return html;
  return html.slice(0, start) + replacement + html.slice(end + 1);
}

function replaceMeta(html, attribute, key, value) {
  const tag = '<meta ' + attribute + '="' + key + '" content="' + escapeHtml(value) + '" />';
  const marker = '<meta ' + attribute + '="' + key + '"';
  if (html.includes(marker)) return replaceWholeTag(html, marker, tag);
  return html.replace("</head>", "    " + tag + "\n  </head>");
}

function replaceTitle(html, title) {
  const start = html.indexOf("<title>");
  const end = html.indexOf("</title>", start);
  if (start < 0 || end < 0) throw new Error("Missing title element in dist/index.html");
  return html.slice(0, start) + "<title>" + escapeHtml(title) + "</title>" + html.slice(end + 8);
}

function fallbackMarkup(page) {
  const links = routes.map((item) => '<li><a href="' + escapeHtml(item.path) + '">' + escapeHtml(item.label) + '</a></li>').join("");
  return '<!--SEO_FALLBACK_START--><main class="seo-fallback" style="max-width:68rem;margin:0 auto;padding:3rem 1.5rem;color:#e7e7ed;font-family:system-ui,sans-serif"><p style="color:#8b86ff;font-size:.75rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase">BabiesIQ · Developer platform</p><h1 style="font-size:clamp(2rem,5vw,3.25rem);line-height:1.1;margin:1rem 0">' + escapeHtml(page.heading) + '</h1><p style="max-width:48rem;color:#a4a4b2;line-height:1.7">' + escapeHtml(page.summary) + '</p><nav aria-label="Public pages"><ul style="display:flex;flex-wrap:wrap;gap:.75rem 1.25rem;padding:1.5rem 0 0 1.25rem">' + links + '</ul></nav></main><!--SEO_FALLBACK_END-->';
}

function buildPage(baseHtml, page) {
  const canonical = new URL(page.path, siteOrigin).toString();
  let html = replaceTitle(baseHtml, page.title);
  html = replaceWholeTag(html, '<link rel="canonical"', '<link rel="canonical" href="' + escapeHtml(canonical) + '" />');
  html = replaceWholeTag(html, '<link rel="icon" type="image/svg+xml"', '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,' + encodeURIComponent(page.iconSvg) + '" />');
  html = replaceMeta(html, "name", "description", page.description);
  html = replaceMeta(html, "name", "robots", "index, follow");
  html = replaceMeta(html, "property", "og:title", page.title);
  html = replaceMeta(html, "property", "og:description", page.description);
  html = replaceMeta(html, "property", "og:type", "website");
  html = replaceMeta(html, "property", "og:url", canonical);
  html = replaceMeta(html, "property", "og:image", defaultOgImage);
  html = replaceMeta(html, "property", "og:site_name", "BabiesIQ");
  html = replaceMeta(html, "name", "twitter:card", "summary_large_image");
  html = replaceMeta(html, "name", "twitter:title", page.title);
  html = replaceMeta(html, "name", "twitter:description", page.description);
  html = replaceMeta(html, "name", "twitter:image", defaultOgImage);
  const rootMarker = '<div id="root">';
  const rootStart = html.indexOf(rootMarker);
  const rootEnd = html.indexOf("</div>", rootStart + rootMarker.length);
  if (rootStart < 0 || rootEnd < 0) throw new Error("Missing empty #root element in dist/index.html");
  html = html.slice(0, rootStart) + rootMarker + fallbackMarkup(page) + html.slice(rootEnd);
  return html.replaceAll('src="./assets/', 'src="/assets/').replaceAll('href="./assets/', 'href="/assets/');
}

const baseHtml = await fs.readFile(path.join(dist, "index.html"), "utf8");
for (const page of routes) {
  const html = buildPage(baseHtml, page);
  const outputPath = page.path === "/" ? path.join(dist, "index.html") : path.join(dist, page.path.slice(1), "index.html");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, "utf8");
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((page) => '  <url><loc>' + escapeHtml(new URL(page.path, siteOrigin).toString()) + '</loc></url>'),
  '</urlset>',
  ""
].join("\n");
await fs.writeFile(path.join(dist, "sitemap.xml"), sitemap, "utf8");
console.log("Generated " + routes.length + " route-specific SEO pages and sitemap.xml");
