import { NextRequest, NextResponse } from "next/server";
import { IMDB_ID_RE, tmdbFindByImdb, tmdbSearch } from "@/lib/tmdbClient";
import type { ApiError, MediaType, SearchResultDto } from "@/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse<SearchResultDto[] | ApiError>> {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const typeFilter = req.nextUrl.searchParams.get("type"); // "movie" | "tv" | null
  if (!q) return NextResponse.json([]);
  try {
    let results = IMDB_ID_RE.test(q)
      ? await tmdbFindByImdb(q)
      : await tmdbSearch(q);
    if (typeFilter === "movie" || typeFilter === "tv") {
      const filter = typeFilter as MediaType;
      results = results.filter((r) => r.mediaType === filter);
    }
    return NextResponse.json(results);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json(
      { error: "search_failed", details: msg },
      { status: 502 }
    );
  }
}
