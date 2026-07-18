import "server-only";
import { cache } from "react";
import { tmdbGetReleaseDates } from "@/lib/tmdbClient";
import { computeTheatricalStatus, type TheatricalStatus } from "@/lib/theatrical";
import type { MediaType } from "@/types";

// Server-side "is this in theaters in {country} now?" lookup. Movies only —
// TV has no theatrical release. Degrades to { state: "none" } on any failure so
// the notice simply doesn't render (never blocks the page).
export const getTheatricalStatus = cache(
  async (
    tmdbId: number,
    mediaType: MediaType,
    country: string
  ): Promise<TheatricalStatus> => {
    if (mediaType !== "movie") return { state: "none" };
    if (!Number.isFinite(tmdbId) || tmdbId <= 0) return { state: "none" };
    try {
      const res = await tmdbGetReleaseDates(tmdbId);
      return computeTheatricalStatus(res.results, country, new Date());
    } catch {
      return { state: "none" };
    }
  }
);
