import type { MetadataRoute } from "next";
import { absoluteUrl, isIndexingEnabled, site } from "@/lib/site";
import { LOCALIZED_PATHS } from "@/lib/seo/metadata";
import { PROVIDER_CONTENT } from "@/content/providers";
import { GUIDES } from "@/content/guides";
import { getPopularIndex } from "@/lib/popularIndex";

// Catalogue policy: we deliberately do NOT enumerate upstream IDs. Title
// URLs come from the existing cached popular-title index (a curated,
// bounded set with full metadata), capped defensively. Search URLs, API
// URLs, and query-parameter states never enter the sitemap.
const MAX_CATALOGUE_URLS = 600;

const STATIC_PATHS = [
  "/",
  "/about",
  "/how-it-works",
  "/where-to-watch",
  "/streaming-services",
  "/supported-countries",
  "/providers",
  "/movies",
  "/tv-shows",
  "/guides",
  "/faq",
  "/data-sources",
  "/press",
  "/support",
  "/privacy",
  "/terms"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexingEnabled()) return [];

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();

  function add(path: string, lastModified: Date = now) {
    const url = absoluteUrl(path);
    if (seen.has(url)) return;
    seen.add(url);
    entries.push({ url, lastModified });
  }

  for (const path of STATIC_PATHS) add(path);
  for (const country of site.countries) add(`/countries/${country.slug}`);
  for (const provider of PROVIDER_CONTENT) add(`/providers/${provider.slug}`);
  for (const guide of GUIDES) {
    add(`/guides/${guide.slug}`, new Date(guide.dateModified));
  }
  // Arabic equivalents (only true content pairs, from the hreflang map).
  for (const arPath of Object.values(LOCALIZED_PATHS)) add(arPath);

  // Curated catalogue titles (cached upstream; failure degrades gracefully).
  try {
    const popular = await getPopularIndex();
    for (const item of popular.slice(0, MAX_CATALOGUE_URLS)) {
      if (!item.tmdbId || !item.title) continue;
      const base = item.mediaType === "tv" ? "/tv" : "/movie";
      add(`${base}/${item.tmdbId}`);
    }
  } catch {
    // Static + editorial URLs still ship if the catalogue source is down.
  }

  return entries;
}
