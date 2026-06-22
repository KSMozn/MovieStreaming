import { fetchJson } from "./http";
import { findProviderByName, findProviderBySourceId, PROVIDERS } from "./providers";
import { tmdbGetWatchProviders, type TmdbProvider } from "./tmdbClient";
import type {
  AvailabilityDto,
  AvailabilityType,
  MediaType,
  ProviderAvailabilityDto,
  ProviderKey
} from "@/types";

const WM_BASE = "https://api.watchmode.com/v1";

interface WatchmodeSource {
  source_id: number;
  name: string;
  type: string; // sub, free, rent, buy, tve
  region: string;
  web_url?: string | null;
  format?: string | null;
  price?: number | null;
  seasons?: number | null;
  episodes?: number | null;
  // Some Watchmode payloads include date hints; treated as optional.
  date_added?: string | null;
  expiration_date?: string | null;
  // Provider-specific category if exposed; usually absent.
  genre_name?: string | null;
}

interface WatchmodeTitleSearch {
  title_results: { id: number; imdb_id?: string | null; tmdb_id?: number | null }[];
}

function mapType(t: string): AvailabilityType {
  switch (t) {
    case "sub":
      return "subscription";
    case "free":
      return "free";
    case "rent":
      return "rent";
    case "buy":
      return "buy";
    case "ads":
      return "ads";
    default:
      return "unknown";
  }
}

async function resolveWatchmodeId(opts: {
  imdbId: string | null;
  tmdbId: number;
  mediaType: MediaType;
}): Promise<number | null> {
  const k = process.env.WATCHMODE_API_KEY;
  if (!k) return null;
  // Watchmode supports search by imdb_id or tmdb_id via search endpoint.
  // tmdb_id values must be prefixed with media type: "movie-{id}" or "tv-{id}".
  const idValue =
    opts.imdbId ?? `${opts.mediaType === "tv" ? "tv" : "movie"}-${opts.tmdbId}`;
  const idType = opts.imdbId ? "imdb_id" : "tmdb_id";
  const url = `${WM_BASE}/search/?apiKey=${encodeURIComponent(
    k
  )}&search_field=${idType}&search_value=${encodeURIComponent(idValue)}`;
  try {
    const data = await fetchJson<WatchmodeTitleSearch>(url, { revalidate: 60 * 60 });
    return data.title_results[0]?.id ?? null;
  } catch {
    return null;
  }
}

async function fetchSources(
  watchmodeId: number,
  region: string
): Promise<WatchmodeSource[]> {
  const k = process.env.WATCHMODE_API_KEY;
  if (!k) return [];
  const url = `${WM_BASE}/title/${watchmodeId}/sources/?apiKey=${encodeURIComponent(
    k
  )}&regions=${encodeURIComponent(region)}`;
  try {
    return await fetchJson<WatchmodeSource[]>(url, { revalidate: 60 * 30 });
  } catch {
    return [];
  }
}

function emptyProviderCard(key: ProviderKey): ProviderAvailabilityDto {
  const cfg = PROVIDERS.find((p) => p.key === key)!;
  return {
    providerKey: cfg.key,
    providerName: cfg.name,
    logoUrl: cfg.logoUrl,
    available: false,
    availabilityType: null,
    streamingUrl: null,
    startsAt: null,
    endsAt: null,
    providerGenre: null
  };
}

/**
 * Build an availability response that ALWAYS contains all 5 target provider
 * cards (filling unavailable ones with `available: false`).
 */
export function buildAvailabilityFromSources(
  sources: WatchmodeSource[],
  country: string,
  region: string
): AvailabilityDto {
  const byKey = new Map<ProviderKey, ProviderAvailabilityDto>();
  for (const k of PROVIDERS.map((p) => p.key)) byKey.set(k, emptyProviderCard(k));

  for (const s of sources) {
    if (s.region && region && s.region.toUpperCase() !== region.toUpperCase()) {
      continue;
    }
    const cfg =
      findProviderBySourceId(s.source_id) ?? findProviderByName(s.name);
    if (!cfg) continue;
    const existing = byKey.get(cfg.key);
    if (!existing) continue;
    // Prefer subscription entries when multiple are present; otherwise first wins.
    if (existing.available && existing.availabilityType === "subscription") continue;
    byKey.set(cfg.key, {
      providerKey: cfg.key,
      providerName: cfg.name,
      logoUrl: cfg.logoUrl,
      available: true,
      availabilityType: mapType(s.type),
      streamingUrl: s.web_url ?? null,
      startsAt: s.date_added ?? null,
      endsAt: s.expiration_date ?? null,
      providerGenre: s.genre_name ?? null
    });
  }

  return {
    country,
    providers: PROVIDERS.map((p) => byKey.get(p.key)!),
    lastCheckedAt: new Date().toISOString()
  };
}

export async function getAvailability(opts: {
  imdbId: string | null;
  tmdbId: number;
  mediaType: MediaType;
  country: string;
}): Promise<AvailabilityDto> {
  const region = opts.country.toUpperCase();

  // Primary: TMDb /watch/providers (JustWatch).
  const tmdbProviders = await tmdbGetWatchProviders(
    opts.tmdbId,
    opts.mediaType,
    region
  );
  const dto = buildAvailabilityFromTmdb(tmdbProviders, region);

  // Optional: enhance with Watchmode (deep links + dates + provider category).
  const wmId = process.env.WATCHMODE_API_KEY
    ? await resolveWatchmodeId({
        imdbId: opts.imdbId,
        tmdbId: opts.tmdbId,
        mediaType: opts.mediaType
      })
    : null;
  if (wmId) {
    const sources = await fetchSources(wmId, region);
    mergeWatchmodeIntoDto(dto, sources, region);
  }
  return dto;
}

/* ---------------- TMDb-based building ---------------- */

function tmdbTypeToAvailability(
  bucket: "flatrate" | "free" | "ads" | "rent" | "buy"
): AvailabilityType {
  switch (bucket) {
    case "flatrate":
      return "subscription";
    case "free":
      return "free";
    case "ads":
      return "ads";
    case "rent":
      return "rent";
    case "buy":
      return "buy";
  }
}

const BUCKET_PRIORITY: Array<"flatrate" | "free" | "ads" | "rent" | "buy"> = [
  "flatrate",
  "free",
  "ads",
  "rent",
  "buy"
];

export function buildAvailabilityFromTmdb(
  data: { country: { flatrate?: TmdbProvider[]; free?: TmdbProvider[]; ads?: TmdbProvider[]; rent?: TmdbProvider[]; buy?: TmdbProvider[] }; link: string | null } | null,
  region: string
): AvailabilityDto {
  const byKey = new Map<ProviderKey, ProviderAvailabilityDto>();
  for (const k of PROVIDERS.map((p) => p.key)) byKey.set(k, emptyProviderCard(k));

  if (data) {
    for (const bucket of BUCKET_PRIORITY) {
      const arr = data.country[bucket] ?? [];
      for (const p of arr) {
        const cfg = findProviderByName(p.provider_name);
        if (!cfg) continue;
        const existing = byKey.get(cfg.key)!;
        // Subscription wins; otherwise first-seen (priority order above).
        if (existing.available && existing.availabilityType === "subscription") continue;
        byKey.set(cfg.key, {
          providerKey: cfg.key,
          providerName: cfg.name,
          logoUrl: p.logo_path ?? cfg.logoUrl,
          available: true,
          availabilityType: tmdbTypeToAvailability(bucket),
          streamingUrl: data.link, // TMDb only gives a region-level JustWatch link
          startsAt: null,
          endsAt: null,
          providerGenre: null
        });
      }
    }
  }
  return {
    country: region,
    providers: PROVIDERS.map((p) => byKey.get(p.key)!),
    lastCheckedAt: new Date().toISOString()
  };
}

/* ---------------- Watchmode merge (optional enhancement) ---------------- */

function mergeWatchmodeIntoDto(
  dto: AvailabilityDto,
  sources: WatchmodeSource[],
  region: string
): void {
  for (const s of sources) {
    if (s.region && s.region.toUpperCase() !== region.toUpperCase()) continue;
    const cfg =
      findProviderBySourceId(s.source_id) ?? findProviderByName(s.name);
    if (!cfg) continue;
    const idx = dto.providers.findIndex((p) => p.providerKey === cfg.key);
    if (idx === -1) continue;
    const cur = dto.providers[idx];
    // Promote to "available" if Watchmode has it (covers MENA gaps in TMDb).
    const next: ProviderAvailabilityDto = {
      ...cur,
      available: true,
      availabilityType: cur.available
        ? cur.availabilityType
        : mapType(s.type),
      streamingUrl: s.web_url ?? cur.streamingUrl,
      startsAt: cur.startsAt ?? s.date_added ?? null,
      endsAt: cur.endsAt ?? s.expiration_date ?? null,
      providerGenre: cur.providerGenre ?? s.genre_name ?? null
    };
    dto.providers[idx] = next;
  }
}
