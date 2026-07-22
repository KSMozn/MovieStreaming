import "server-only";
import { cache } from "react";
import { tmdbGetTitle } from "@/lib/tmdbClient";
import { pickTrailer, type Trailer } from "@/lib/trailer";
import type { Locale } from "@/lib/title-i18n";
import type { MediaType } from "@/types";

// Best official trailer for a title. Reuses the same TMDb title fetch as
// getTitleDetails (videos are appended to that request and Next memoizes it),
// so this adds no extra network call within a render. Degrades to null.
export const getTitleTrailer = cache(
  async (
    tmdbId: number,
    mediaType: MediaType,
    locale: Locale = "en"
  ): Promise<Trailer | null> => {
    if (!Number.isFinite(tmdbId) || tmdbId <= 0) return null;
    try {
      const title = await tmdbGetTitle(tmdbId, mediaType);
      return pickTrailer(title.videos?.results, locale);
    } catch {
      return null;
    }
  }
);
