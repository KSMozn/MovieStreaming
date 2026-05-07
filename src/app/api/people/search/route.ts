import { NextRequest, NextResponse } from "next/server";
import { tmdbSearchPerson, type PersonSearchResult } from "@/lib/tmdbClient";
import type { ApiError } from "@/types";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest
): Promise<NextResponse<PersonSearchResult[] | ApiError>> {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json([]);
  try {
    const data = await tmdbSearchPerson(q, 10);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json(
      { error: "person_search_failed", details: msg },
      { status: 502 }
    );
  }
}
