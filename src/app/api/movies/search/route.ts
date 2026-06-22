import { NextRequest, NextResponse } from "next/server";
import { IMDB_ID_RE, tmdbFindByImdb, tmdbSearch } from "@/lib/tmdbClient";
import { getPopularIndex, substringMatch } from "@/lib/popularIndex";
import type { ApiError, MediaType, SearchResultDto } from "@/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse<SearchResultDto[] | ApiError>> {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const typeFilter = req.nextUrl.searchParams.get("type"); // "movie" | "tv" | null
  if (!q) return NextResponse.json([]);
  try {
    if (IMDB_ID_RE.test(q)) {
      return NextResponse.json(await tmdbFindByImdb(q));
    }

    // Two-source merge:
    //  1) Substring matches against the cached top-popular + top-rated index
    //     (~800 widely-known titles) — these handle mid-word fragments like
    //     "venger" → Avengers, "ception" → Inception that TMDb's word-prefix
    //     search misses entirely.
    //  2) TMDb /search/multi — broad catalog coverage, but word-prefix only.
    //
    // Popular-index hits rank first because they're substring matches against
    // titles the user is most likely actually looking for. TMDb's results
    // fill in long-tail catalog matches behind them.
    const needleLower = q.toLowerCase();
    const [tmdbResults, popularHits] = await Promise.all([
      tmdbSearch(q),
      q.length >= 2
        ? getPopularIndex()
            .then((idx) => substringMatch(idx, q, 12))
            .catch(() => [])
        : Promise.resolve([])
    ]);

    const seen = new Set<string>();
    const merged: SearchResultDto[] = [];

    // Within the popular hits, prefer titles where the match starts at a word
    // boundary (so "venger" → "Avengers" is high but a title with " revenge "
    // mid-sentence is lower).
    const ranked = [...popularHits].sort((a, b) => {
      const aStartsToken = startsAtToken(a.titleLower, needleLower);
      const bStartsToken = startsAtToken(b.titleLower, needleLower);
      if (aStartsToken !== bStartsToken) return aStartsToken ? -1 : 1;
      return b.popularity - a.popularity;
    });

    for (const p of ranked) {
      const k = `${p.mediaType}-${p.tmdbId}`;
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push({
        tmdbId: p.tmdbId,
        mediaType: p.mediaType,
        title: p.title,
        releaseYear: p.releaseYear,
        posterUrl: p.posterUrl
      });
    }

    for (const r of tmdbResults) {
      const k = `${r.mediaType}-${r.tmdbId}`;
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push(r);
    }

    let results = merged;
    if (typeFilter === "movie" || typeFilter === "tv") {
      const filter = typeFilter as MediaType;
      results = results.filter((r) => r.mediaType === filter);
    }
    return NextResponse.json(results.slice(0, 20));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json(
      { error: "search_failed", details: msg },
      { status: 502 }
    );
  }
}

function startsAtToken(title: string, needle: string): boolean {
  if (title.startsWith(needle)) return true;
  const idx = title.indexOf(needle);
  if (idx <= 0) return false;
  const prev = title.charCodeAt(idx - 1);
  // Word boundary = space, dash, colon, dot, etc.
  return prev === 32 /* space */ || prev === 45 /* - */ || prev === 58 /* : */ || prev === 46 /* . */;
}
