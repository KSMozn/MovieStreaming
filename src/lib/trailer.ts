// Picks the best official trailer from TMDb's curated /videos data and builds
// the trusted YouTube URLs for it. We only ever use TMDb-provided keys (studio-
// curated), embedded through YouTube's privacy-enhanced player — never an
// arbitrary third-party video URL.

import type { TmdbVideo } from "@/lib/tmdbClient";
import type { Locale } from "@/lib/title-i18n";

export interface Trailer {
  key: string;
  name: string;
  publishedAt: string | null;
}

// Higher score = better pick. Official trailers beat unofficial; trailers beat
// teasers; teasers beat clips/featurettes.
function typeScore(v: TmdbVideo): number {
  const t = v.type.toLowerCase();
  let base: number;
  if (t === "trailer") base = 40;
  else if (t === "teaser") base = 20;
  else base = 0; // Clip, Featurette, Behind the Scenes, etc.
  return base + (v.official ? 8 : 0);
}

export function pickTrailer(
  videos: TmdbVideo[] | undefined,
  locale: Locale = "en"
): Trailer | null {
  if (!videos || videos.length === 0) return null;
  const youtube = videos.filter(
    (v) => v.site === "YouTube" && typeof v.key === "string" && v.key.length > 0
  );
  if (youtube.length === 0) return null;

  const preferLang = locale === "ar" ? "ar" : "en";
  const langBonus = (v: TmdbVideo): number => {
    const lang = (v.iso_639_1 ?? "").toLowerCase();
    if (lang === preferLang) return 4;
    if (lang === "en") return 2; // English is the safe universal fallback
    return 0;
  };

  const best = [...youtube].sort((a, b) => {
    const s = typeScore(b) + langBonus(b) - (typeScore(a) + langBonus(a));
    if (s !== 0) return s;
    // Tie-break: newest published first, then larger resolution.
    const da = Date.parse(a.published_at ?? "") || 0;
    const db = Date.parse(b.published_at ?? "") || 0;
    if (db !== da) return db - da;
    return (b.size ?? 0) - (a.size ?? 0);
  })[0];

  // Ignore non-trailer/teaser clips entirely — better no trailer than a
  // random featurette masquerading as one.
  if (typeScore(best) < 20) return null;
  return {
    key: best.key,
    name: best.name,
    publishedAt: best.published_at ?? null
  };
}

export function youtubeThumb(key: string): string {
  return `https://i.ytimg.com/vi/${key}/hqdefault.jpg`;
}

// Privacy-enhanced (no-cookie) official YouTube embed. autoplay is only added
// once the visitor explicitly clicks play (facade), never on initial render.
export function youtubeEmbedUrl(key: string, autoplay = false): string {
  const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
  if (autoplay) params.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
    key
  )}?${params.toString()}`;
}

export function youtubeWatchUrl(key: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(key)}`;
}
