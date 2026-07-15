import type { Metadata } from "next";
import { absoluteUrl, isIndexingEnabled, site } from "@/lib/site";

// English → Arabic path pairs that are true content equivalents. Only these
// emit hreflang alternates; pages without an exact Arabic equivalent must
// not claim one.
export const LOCALIZED_PATHS: Record<string, string> = {
  "/": "/ar",
  "/about": "/ar/about",
  "/how-it-works": "/ar/how-it-works",
  "/where-to-watch": "/ar/where-to-watch",
  "/supported-countries": "/ar/supported-countries",
  "/countries/egypt": "/ar/countries/egypt",
  "/countries/saudi-arabia": "/ar/countries/saudi-arabia",
  "/countries/united-arab-emirates": "/ar/countries/united-arab-emirates",
  "/countries/united-states": "/ar/countries/united-states",
  "/countries/united-kingdom": "/ar/countries/united-kingdom",
  "/countries/canada": "/ar/countries/canada",
  "/faq": "/ar/faq",
  "/data-sources": "/ar/data-sources"
};

const AR_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(LOCALIZED_PATHS).map(([en, ar]) => [ar, en])
);

export function languageAlternates(
  path: string
): Record<string, string> | undefined {
  const en = AR_TO_EN[path] ?? (LOCALIZED_PATHS[path] ? path : undefined);
  if (!en) return undefined;
  const ar = LOCALIZED_PATHS[en];
  return {
    en: absoluteUrl(en),
    ar: absoluteUrl(ar),
    "x-default": absoluteUrl(en)
  };
}

export interface PageMetadataInput {
  title: string;
  description: string;
  /** Canonical path, e.g. "/movie/27205". Query params never belong here. */
  path: string;
  noindex?: boolean;
  ogType?: "website" | "article" | "video.movie" | "video.tv_show" | "profile";
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  locale?: "en" | "ar";
  /**
   * Explicit hreflang alternates for dynamic routes (title/country pages) that
   * aren't in the static LOCALIZED_PATHS map. When omitted, alternates are
   * derived from LOCALIZED_PATHS via the canonical path. Pass absolute URLs.
   */
  languages?: Record<string, string>;
}

// Central metadata builder: every indexable page gets a self-referencing
// canonical on the production origin, Open Graph and Twitter data, and an
// explicit robots policy.
export function pageMetadata(input: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(input.path);
  const noindex = input.noindex === true || !isIndexingEnabled();
  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
      languages: input.languages ?? languageAlternates(input.path)
    },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: site.name,
      type: input.ogType === "video.movie" || input.ogType === "video.tv_show"
        ? "video.other"
        : input.ogType ?? "website",
      locale: input.locale === "ar" ? "ar_AR" : "en_US",
      ...(input.images ? { images: input.images } : {})
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description
    }
  };
}

export function truncateDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 60))}…`;
}
