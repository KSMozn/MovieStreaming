import { NextRequest, NextResponse } from "next/server";
import { tmdbGetPerson } from "@/lib/tmdbClient";
import type { ApiError, PersonDto } from "@/types";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { personId: string } }
): Promise<NextResponse<PersonDto | ApiError>> {
  const id = Number.parseInt(params.personId, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  try {
    const person = await tmdbGetPerson(id);
    return NextResponse.json(person);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json(
      { error: "person_failed", details: msg },
      { status: 502 }
    );
  }
}
