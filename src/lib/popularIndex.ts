// In-memory cache of TMDb's most popular movies and TV shows. Populated
// lazily on first use and refreshed every TTL. Lets us serve substring/
// "LIKE" matches that TMDb's word-prefix search misses
// (e.g. "venger" → Avengers, "ception" → Inception).

import { fetchJson } from "./http";
import type { MediaType, SearchResultDto } from "@/types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

function key(): string {
  const k = process.env.TMDB_API_KEY;
  if (!k) throw new Error("TMDB_API_KEY is not set");
  return k;
}

function img(path: string | null, size: "w185" | "w500"): string | null {
  return path ? `${IMG_BASE}/${size}${path}` : null;
}

export interface PopularItem extends SearchResultDto {
  popularity: number;
  /** Lowercase title cached once for fast filtering. */
  titleLower: string;
}

interface TmdbPopularMovieItem {
  id: number;
  title: string;
  release_date?: string | null;
  poster_path?: string | null;
  popularity?: number;
}
interface TmdbPopularTvItem {
  id: number;
  name: string;
  first_air_date?: string | null;
  poster_path?: string | null;
  popularity?: number;
}
interface TmdbPopularResponse<T> {
  results: T[];
}

const POPULAR_PAGES = 10;   // 10 × 20 = 200 most-popular-this-week per kind
const TOP_RATED_PAGES = 10; // 10 × 20 = 200 highest-rated of all time per kind
const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

let CACHE: PopularItem[] | null = null;
let LOADED_AT = 0;
let INFLIGHT: Promise<PopularItem[]> | null = null;

async function fetchPath(
  kind: MediaType,
  endpoint: "popular" | "top_rated",
  pageCount: number
): Promise<PopularItem[]> {
  const path = `${kind}/${endpoint}`;
  const pages = await Promise.all(
    Array.from({ length: pageCount }, (_, i) => {
      const page = i + 1;
      const url = `${TMDB_BASE}/${path}?api_key=${encodeURIComponent(
        key()
      )}&page=${page}`;
      return kind === "movie"
        ? fetchJson<TmdbPopularResponse<TmdbPopularMovieItem>>(url, {
            revalidate: 60 * 60
          })
        : fetchJson<TmdbPopularResponse<TmdbPopularTvItem>>(url, {
            revalidate: 60 * 60
          });
    })
  );

  const items: PopularItem[] = [];
  for (const p of pages) {
    for (const r of p.results) {
      const title = (r as TmdbPopularMovieItem).title ?? (r as TmdbPopularTvItem).name ?? "";
      if (!title) continue;
      const date =
        (r as TmdbPopularMovieItem).release_date ??
        (r as TmdbPopularTvItem).first_air_date ??
        null;
      items.push({
        tmdbId: r.id,
        mediaType: kind,
        title,
        titleLower: title.toLowerCase(),
        releaseYear: date ? date.slice(0, 4) : null,
        posterUrl: img(r.poster_path ?? null, "w185"),
        popularity: r.popularity ?? 0
      });
    }
  }
  return items;
}

async function fetchKind(kind: MediaType): Promise<PopularItem[]> {
  const [popular, topRated] = await Promise.all([
    fetchPath(kind, "popular", POPULAR_PAGES),
    fetchPath(kind, "top_rated", TOP_RATED_PAGES)
  ]);
  return [...popular, ...topRated];
}

async function build(): Promise<PopularItem[]> {
  const [movies, tv] = await Promise.all([fetchKind("movie"), fetchKind("tv")]);
  // Deduplicate by composite key (movies and tv use independent id spaces but we key both for safety).
  const seen = new Set<string>();
  const out: PopularItem[] = [];
  for (const item of [...movies, ...tv]) {
    const k = `${item.mediaType}-${item.tmdbId}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  out.sort((a, b) => b.popularity - a.popularity);
  return out;
}

export async function getPopularIndex(): Promise<PopularItem[]> {
  if (CACHE && Date.now() - LOADED_AT < TTL_MS) return CACHE;
  if (INFLIGHT) return INFLIGHT;
  INFLIGHT = build()
    .then((items) => {
      CACHE = items;
      LOADED_AT = Date.now();
      INFLIGHT = null;
      return items;
    })
    .catch((e) => {
      INFLIGHT = null;
      throw e;
    });
  return INFLIGHT;
}

/** Substring (LIKE %q%) match against the cached popular index. Case-insensitive. */
export function substringMatch(
  index: PopularItem[],
  q: string,
  limit = 10
): PopularItem[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return index
    .filter((it) => it.titleLower.includes(needle))
    .slice(0, limit);
}
