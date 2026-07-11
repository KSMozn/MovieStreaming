import "server-only";
import { cache } from "react";
import { tmdbGetTitle } from "@/lib/tmdbClient";
import { getAvailability } from "@/lib/watchmodeClient";
import type { AvailabilityDto, MediaType } from "@/types";

// Server-side availability lookup mirroring /api/movies/[tmdbId]/availability.
// Returns null on failure so pages can degrade gracefully (the client island
// can still refetch interactively).
export const getTitleAvailability = cache(
  async (
    tmdbId: number,
    mediaType: MediaType,
    country: string
  ): Promise<AvailabilityDto | null> => {
    if (!Number.isFinite(tmdbId) || tmdbId <= 0) return null;
    try {
      const t = await tmdbGetTitle(tmdbId, mediaType).catch(() => null);
      const imdbId =
        mediaType === "tv"
          ? t?.external_ids?.imdb_id ?? null
          : t?.imdb_id ?? null;
      return await getAvailability({
        tmdbId,
        mediaType,
        imdbId,
        country: country.toUpperCase()
      });
    } catch {
      return null;
    }
  }
);
