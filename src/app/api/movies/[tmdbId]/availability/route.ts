import { NextRequest, NextResponse } from "next/server";
import { tmdbGetTitle } from "@/lib/tmdbClient";
import { getAvailability } from "@/lib/watchmodeClient";
import type { ApiError, AvailabilityDto, MediaType } from "@/types";

export const runtime = "nodejs";

function parseType(s: string | null): MediaType {
  return s === "tv" ? "tv" : "movie";
}

export async function GET(
  req: NextRequest,
  { params }: { params: { tmdbId: string } }
): Promise<NextResponse<AvailabilityDto | ApiError>> {
  const id = Number.parseInt(params.tmdbId, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  const mediaType = parseType(req.nextUrl.searchParams.get("type"));
  const country =
    req.nextUrl.searchParams.get("country")?.toUpperCase() ||
    process.env.DEFAULT_COUNTRY ||
    "EG";
  try {
    const t = await tmdbGetTitle(id, mediaType).catch(() => null);
    const imdbId =
      mediaType === "tv"
        ? t?.external_ids?.imdb_id ?? null
        : t?.imdb_id ?? null;
    const availability = await getAvailability({
      tmdbId: id,
      mediaType,
      imdbId,
      country
    });
    return NextResponse.json(availability);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json(
      { error: "availability_failed", details: msg },
      { status: 502 }
    );
  }
}
