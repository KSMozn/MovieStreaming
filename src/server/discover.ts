import "server-only";
import { cache } from "react";
import { tmdbDiscover, type DiscoverResultDto } from "@/lib/tmdbClient";
import type { MediaType } from "@/types";

// Curated server-side selections for the /movies and /tv-shows hubs and the
// server-rendered homepage. Small, cached, and bounded — hub pages must not
// enumerate the whole catalogue.
export const getPopularTitles = cache(
  async (mediaType: MediaType, limit = 18): Promise<DiscoverResultDto[]> => {
    try {
      const res = await tmdbDiscover({ mediaType, sortBy: "popularity.desc" });
      return res.results.slice(0, limit);
    } catch {
      return [];
    }
  }
);

export const getTopRatedTitles = cache(
  async (mediaType: MediaType, limit = 18): Promise<DiscoverResultDto[]> => {
    try {
      const res = await tmdbDiscover({
        mediaType,
        sortBy: "vote_average.desc",
        voteCountGte: 1000
      });
      return res.results.slice(0, limit);
    } catch {
      return [];
    }
  }
);
