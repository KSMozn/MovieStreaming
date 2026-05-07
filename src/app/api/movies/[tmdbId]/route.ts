import { NextRequest, NextResponse } from "next/server";
import { normalizeTmdbTitle, tmdbGetTitle } from "@/lib/tmdbClient";
import { getImdbRating } from "@/lib/omdbClient";
import type { ApiError, MediaType, MovieDetailsDto } from "@/types";

export const runtime = "nodejs";

function parseType(s: string | null): MediaType {
  return s === "tv" ? "tv" : "movie";
}

export async function GET(
  req: NextRequest,
  { params }: { params: { tmdbId: string } }
): Promise<NextResponse<MovieDetailsDto | ApiError>> {
  const id = Number.parseInt(params.tmdbId, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  const mediaType = parseType(req.nextUrl.searchParams.get("type"));
  try {
    const title = await tmdbGetTitle(id, mediaType);
    const imdbId =
      mediaType === "tv" ? title.external_ids?.imdb_id ?? null : title.imdb_id ?? null;
    const rating = await getImdbRating(imdbId);
    return NextResponse.json(normalizeTmdbTitle(title, mediaType, rating));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json(
      { error: "details_failed", details: msg },
      { status: 502 }
    );
  }
}
