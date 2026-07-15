import type { MetadataRoute } from "next";
import { absoluteUrl, isIndexingEnabled, site } from "@/lib/site";
import { LOCALIZED_PATHS } from "@/lib/seo/metadata";
import { PROVIDER_CONTENT } from "@/content/providers";
import { GUIDES } from "@/content/guides";
import { getPopularIndex } from "@/lib/popularIndex";
import { titlePath } from "@/lib/title-i18n";

// Render at request time, not build time: `gcloud run deploy --source` builds
// in Cloud Build without runtime env vars (TMDB_API_KEY), so a build-time
// prerender would freeze an empty catalogue into the image. Runtime rendering
// + the popular-index in-memory cache (6h TTL) keeps upstream load low.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Catalogue policy: we deliberately do NOT enumerate upstream IDs. Titles come
// from the existing cached popular-title index (a curated, bounded set with
// full metadata), capped defensively. Each title expands into its indexable
// variants — base + one per supported country, in English and Arabic — so the
// long-tail "where to watch {title} in {country}" pages are all discoverable.
// Search URLs, API URLs, and query-parameter states never enter the sitemap.
const MAX_CATALOGUE_TITLES = 600;

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
  "/feedback",
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
  // Each title emits: base (en+ar) and one page per supported country (en+ar).
  try {
    const popular = await getPopularIndex();
    for (const item of popular.slice(0, MAX_CATALOGUE_TITLES)) {
      if (!item.tmdbId || !item.title) continue;
      const mediaType = item.mediaType === "tv" ? "tv" : "movie";
      add(titlePath(mediaType, item.tmdbId));
      add(titlePath(mediaType, item.tmdbId, { locale: "ar" }));
      for (const country of site.countries) {
        add(titlePath(mediaType, item.tmdbId, { country }));
        add(titlePath(mediaType, item.tmdbId, { country, locale: "ar" }));
      }
    }
  } catch {
    // Static + editorial URLs still ship if the catalogue source is down.
  }

  return entries;
}
