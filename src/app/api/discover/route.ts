import { NextRequest, NextResponse } from "next/server";
import {
  tmdbDiscover,
  tmdbGetPerson,
  tmdbGetTitle,
  tmdbSearchByName,
  type DiscoverResultDto
} from "@/lib/tmdbClient";
import { PROVIDERS } from "@/lib/providers";
import { DEFAULT_SORT, isSortKey, type SortKey } from "@/lib/sort";
import type { ApiError, MediaType, ProviderKey } from "@/types";

export const runtime = "nodejs";

export interface DiscoverResponse {
  results: DiscoverResultDto[];
  page: number;
  totalPages: number;
  totalResults: number;
  appliedFilters: {
    name?: string;
    year?: number | null;
    genreIds: number[];
    providerKey: ProviderKey | null;
    voteAverageGte: number | null;
    personId: number | null;
    mediaType: MediaType | "both";
    country: string;
    page: number;
    sortBy: SortKey;
  };
  warnings: string[];
}

function tmdbSortFor(sortBy: SortKey, mt: MediaType): string {
  switch (sortBy) {
    case "rating.desc":
      return "vote_average.desc";
    case "rating.asc":
      return "vote_average.asc";
    case "release.desc":
      return mt === "movie"
        ? "primary_release_date.desc"
        : "first_air_date.desc";
    case "release.asc":
      return mt === "movie"
        ? "primary_release_date.asc"
        : "first_air_date.asc";
    case "votes.desc":
      return "vote_count.desc";
    case "popularity.desc":
    default:
      return "popularity.desc";
  }
}

function compareForSort(
  a: DiscoverResultDto,
  b: DiscoverResultDto,
  sortBy: SortKey
): number {
  const yearA = a.releaseYear ? Number(a.releaseYear) : null;
  const yearB = b.releaseYear ? Number(b.releaseYear) : null;
  switch (sortBy) {
    case "rating.desc":
      return (
        (b.voteAverage ?? -1) - (a.voteAverage ?? -1) ||
        (b.voteCount ?? 0) - (a.voteCount ?? 0)
      );
    case "rating.asc":
      return (
        (a.voteAverage ?? 11) - (b.voteAverage ?? 11) ||
        (b.voteCount ?? 0) - (a.voteCount ?? 0)
      );
    case "release.desc":
      return (yearB ?? -Infinity) - (yearA ?? -Infinity);
    case "release.asc":
      return (yearA ?? Infinity) - (yearB ?? Infinity);
    case "votes.desc":
      return (b.voteCount ?? 0) - (a.voteCount ?? 0);
    case "popularity.desc":
    default:
      return (
        (b.voteCount ?? 0) - (a.voteCount ?? 0) ||
        (b.voteAverage ?? 0) - (a.voteAverage ?? 0)
      );
  }
}

function parseIntList(s: string | null): number[] {
  if (!s) return [];
  return s
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isFinite(n));
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<DiscoverResponse | ApiError>> {
  const sp = req.nextUrl.searchParams;
  const name = (sp.get("q") ?? "").trim();
  const yearRaw = sp.get("year");
  const year = yearRaw ? Number(yearRaw) : null;
  const genreIds = parseIntList(sp.get("genres"));
  const providerKey = (sp.get("provider") ?? "") as ProviderKey | "";
  const voteAverageGteRaw = sp.get("voteGte");
  const voteAverageGte = voteAverageGteRaw ? Number(voteAverageGteRaw) : null;
  const personIdRaw = sp.get("personId");
  const personId = personIdRaw ? Number(personIdRaw) : null;
  const mtRaw = (sp.get("mediaType") ?? "both") as MediaType | "both";
  const mediaType: MediaType | "both" =
    mtRaw === "movie" || mtRaw === "tv" ? mtRaw : "both";
  const country = (sp.get("country") ?? "EG").toUpperCase();
  const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
  const sortByRaw = sp.get("sortBy") ?? "";
  const sortBy: SortKey = isSortKey(sortByRaw) ? sortByRaw : DEFAULT_SORT;

  const provider = providerKey
    ? PROVIDERS.find((p) => p.key === providerKey) ?? null
    : null;
  const watchProviderIds = provider?.tmdbProviderIds ?? [];

  const warnings: string[] = [];

  try {
    // Path A: name (free text) provided → use /search and apply lightweight in-memory filters.
    if (name) {
      let results = await tmdbSearchByName(name, mediaType, year);
      if (typeof voteAverageGte === "number" && !Number.isNaN(voteAverageGte)) {
        results = results.filter(
          (r) => (r.voteAverage ?? 0) >= voteAverageGte
        );
      }
      if (genreIds.length > 0 || providerKey || personId) {
        warnings.push(
          "Genre, provider, and actor filters are not applied when searching by name. Clear the name to enable them."
        );
      }
      results.sort((a, b) => compareForSort(a, b, sortBy));
      const PAGE_SIZE = 20;
      const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
      const safePage = Math.min(Math.max(1, page), totalPages);
      const start = (safePage - 1) * PAGE_SIZE;
      return NextResponse.json({
        results: results.slice(start, start + PAGE_SIZE),
        page: safePage,
        totalPages,
        totalResults: results.length,
        appliedFilters: {
          name,
          year,
          genreIds,
          providerKey: providerKey || null,
          voteAverageGte,
          personId,
          mediaType,
          country,
          page,
          sortBy
        },
        warnings
      });
    }

    // Path B: discover (no free-text name).
    const types: MediaType[] =
      mediaType === "both" ? ["movie", "tv"] : [mediaType];

    // Path B1: actor selected → source from the person's filmography
    // (TMDb /discover/tv with_people doesn't reliably filter cast credits).
    if (personId) {
      const person = await tmdbGetPerson(personId);
      let credits = person.credits.filter((c) => types.includes(c.mediaType));
      if (year) {
        credits = credits.filter((c) => c.releaseYear === String(year));
      }
      if (typeof voteAverageGte === "number" && !Number.isNaN(voteAverageGte)) {
        credits = credits.filter(
          (c) => (c.voteAverage ?? 0) >= voteAverageGte
        );
      }

      // If genre or provider filter is also active, we need per-title genre/provider data.
      const needsTitleEnrichment =
        genreIds.length > 0 || (providerKey && watchProviderIds.length > 0);

      let results: DiscoverResultDto[] = credits.map((c) => ({
        tmdbId: c.tmdbId,
        mediaType: c.mediaType,
        title: c.title,
        releaseYear: c.releaseYear,
        posterUrl: c.posterUrl,
        voteAverage: c.voteAverage,
        voteCount: null
      }));

      if (needsTitleEnrichment) {
        // Cap enrichment to keep latency bounded.
        const top = results.slice(0, 30);
        const enriched = await Promise.all(
          top.map(async (r) => {
            try {
              const t = await tmdbGetTitle(r.tmdbId, r.mediaType);
              const titleGenres = (t.genres ?? []).map((g) => g.id);
              if (
                genreIds.length > 0 &&
                !genreIds.some((g) => titleGenres.includes(g))
              ) {
                return null;
              }
              return r;
            } catch {
              return null;
            }
          })
        );
        results = enriched.filter((r): r is DiscoverResultDto => r !== null);
        if (providerKey && watchProviderIds.length > 0) {
          warnings.push(
            "Provider filter is approximate when combined with an actor filter."
          );
        }
      }

      if (providerKey && watchProviderIds.length === 0) {
        warnings.push(
          `No TMDb provider id is mapped for "${providerKey}"; provider filter ignored.`
        );
      }

      results.sort((a, b) => compareForSort(a, b, sortBy));

      const PAGE_SIZE = 20;
      const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
      const safePage = Math.min(Math.max(1, page), totalPages);
      const start = (safePage - 1) * PAGE_SIZE;
      const pageSlice = results.slice(start, start + PAGE_SIZE);

      return NextResponse.json({
        results: pageSlice,
        page: safePage,
        totalPages,
        totalResults: results.length,
        appliedFilters: {
          year,
          genreIds,
          providerKey: providerKey || null,
          voteAverageGte,
          personId,
          mediaType,
          country,
          page,
          sortBy
        },
        warnings
      });
    }

    // Path B2: no actor → standard /discover.
    // When sorting by rating, require a minimum vote count or TMDb returns
    // obscure titles with a single 10/10 vote at the top.
    const voteCountGte =
      sortBy === "rating.desc" || sortBy === "rating.asc" ? 200 : null;
    const responses = await Promise.all(
      types.map((mt) =>
        tmdbDiscover({
          mediaType: mt,
          genreIds,
          year,
          voteAverageGte:
            typeof voteAverageGte === "number" && !Number.isNaN(voteAverageGte)
              ? voteAverageGte
              : null,
          voteCountGte,
          watchProviderIds,
          watchRegion: country,
          page,
          sortBy: tmdbSortFor(sortBy, mt)
        })
      )
    );

    if (providerKey && watchProviderIds.length === 0) {
      warnings.push(
        `No TMDb provider id is mapped for "${providerKey}"; provider filter ignored.`
      );
    }

    const merged = responses.flatMap((r) => r.results);
    merged.sort((a, b) => compareForSort(a, b, sortBy));

    return NextResponse.json({
      results: merged,
      page,
      totalPages: Math.max(...responses.map((r) => r.totalPages), 1),
      totalResults: responses.reduce((s, r) => s + r.totalResults, 0),
      appliedFilters: {
        year,
        genreIds,
        providerKey: providerKey || null,
        voteAverageGte,
        personId,
        mediaType,
        country,
        page,
        sortBy
      },
      warnings
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json(
      { error: "discover_failed", details: msg },
      { status: 502 }
    );
  }
}
