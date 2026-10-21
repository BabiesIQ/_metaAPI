import { useEffect } from "react";
import SEO_ROUTE_DATA from "./seo-routes.json";

export const SITE_ORIGIN = "https://babiesiq.tech";
export const DEFAULT_OG_IMAGE = SITE_ORIGIN + "/assets/banner.svg";

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  robots?: string;
  jsonLd?: Record<string, unknown>;
};

const PAGE_SEO = new Map(SEO_ROUTE_DATA.routes.map((route) => [route.path, route] as const));

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    'meta[' + attribute + '="' + key + '"]',
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );

  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }

  element.href = href;
}

function upsertPageIcon(iconSvg?: string) {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="icon"][type="image/svg+xml"]',
  );

  if (!element) {
    element = document.createElement("link");
    element.rel = "icon";
    element.type = "image/svg+xml";
    document.head.appendChild(element);
  }

  element.href = iconSvg
    ? "data:image/svg+xml," + encodeURIComponent(iconSvg)
    : "/favicon.svg";
}

function upsertJsonLd(value: Record<string, unknown>) {
  let element = document.head.querySelector<HTMLScriptElement>(
    'script[data-seo-jsonld="true"]',
  );

  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.dataset.seoJsonld = "true";
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(value);
}

export function usePageSeo({
  title,
  description,
  path,
  type = "website",
  robots = "index, follow",
  jsonLd,
}: PageSeo) {
  const route = PAGE_SEO.get(path);
  const pageTitle = route?.title ?? title;
  const pageDescription = route?.description ?? description;

  useEffect(() => {
    const canonical = new URL(path, SITE_ORIGIN).toString();

    document.title = pageTitle;
    upsertMeta("name", "description", pageDescription);
    upsertMeta("name", "robots", robots);
    upsertMeta("property", "og:title", pageTitle);
    upsertMeta("property", "og:description", pageDescription);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", DEFAULT_OG_IMAGE);
    upsertMeta("property", "og:site_name", "BabiesIQ");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", pageTitle);
    upsertMeta("name", "twitter:description", pageDescription);
    upsertMeta("name", "twitter:image", DEFAULT_OG_IMAGE);
    upsertCanonical(canonical);
    upsertPageIcon(route?.iconSvg);

    if (jsonLd) {
      upsertJsonLd(jsonLd);
    } else {
      document.head
        .querySelector('script[data-seo-jsonld="true"]')
        ?.remove();
    }
  }, [jsonLd, pageDescription, pageTitle, path, robots, route, type]);
}
