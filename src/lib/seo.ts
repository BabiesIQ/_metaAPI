import { useEffect } from "react";

export const SITE_ORIGIN = "https://babiesiq.tech";
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/assets/banner.svg`;

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  robots?: string;
  jsonLd?: Record<string, unknown>;
};

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
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
  useEffect(() => {
    const canonical = new URL(path, SITE_ORIGIN).toString();

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", robots);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", DEFAULT_OG_IMAGE);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", DEFAULT_OG_IMAGE);
    upsertCanonical(canonical);

    if (jsonLd) {
      upsertJsonLd(jsonLd);
    }
  }, [description, jsonLd, path, robots, title, type]);
}