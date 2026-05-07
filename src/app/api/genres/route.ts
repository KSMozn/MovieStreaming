import { NextResponse } from "next/server";
import { tmdbGetGenres } from "@/lib/tmdbClient";
import type { ApiError } from "@/types";

export const runtime = "nodejs";

export interface CombinedGenreDto {
  id: number;
  name: string;
  appliesTo: Array<"movie" | "tv">;
}

export async function GET(): Promise<NextResponse<CombinedGenreDto[] | ApiError>> {
  try {
    const [movie, tv] = await Promise.all([
      tmdbGetGenres("movie"),
      tmdbGetGenres("tv")
    ]);
    const map = new Map<number, CombinedGenreDto>();
    for (const g of movie) {
      map.set(g.id, { id: g.id, name: g.name, appliesTo: ["movie"] });
    }
    for (const g of tv) {
      const existing = map.get(g.id);
      if (existing) existing.appliesTo.push("tv");
      else map.set(g.id, { id: g.id, name: g.name, appliesTo: ["tv"] });
    }
    const out = Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    return NextResponse.json(out, {
      headers: { "Cache-Control": "public, max-age=86400" }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json(
      { error: "genres_failed", details: msg },
      { status: 502 }
    );
  }
}
