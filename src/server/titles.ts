import "server-only";
import { cache } from "react";
import { normalizeTmdbTitle, tmdbGetTitle } from "@/lib/tmdbClient";
import { getImdbRating } from "@/lib/omdbClient";
import type { MediaType, MovieDetailsDto } from "@/types";

// Server-side title lookup shared by generateMetadata, page rendering, and
// OG image routes. cache() deduplicates within one request so metadata and
// the page body never trigger duplicate upstream calls. Mirrors
// /api/movies/[tmdbId] exactly (same normalizers, same DTO).
export const getTitleDetails = cache(
  async (
    tmdbId: number,
    mediaType: MediaType
  ): Promise<MovieDetailsDto | null> => {
    if (!Number.isFinite(tmdbId) || tmdbId <= 0) return null;
    try {
      const title = await tmdbGetTitle(tmdbId, mediaType);
      const imdbId =
        mediaType === "tv"
          ? title.external_ids?.imdb_id ?? null
          : title.imdb_id ?? null;
      const rating = await getImdbRating(imdbId).catch(() => null);
      return normalizeTmdbTitle(title, mediaType, rating);
    } catch {
      // Upstream 404s and transport errors both surface as "no such title";
      // callers translate this into a proper 404 (never an indexable shell).
      return null;
    }
  }
);
