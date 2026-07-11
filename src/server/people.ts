import "server-only";
import { cache } from "react";
import { tmdbGetPerson } from "@/lib/tmdbClient";
import type { PersonDto } from "@/types";

// Server-side person lookup mirroring /api/people/[personId].
export const getPerson = cache(async (personId: number): Promise<PersonDto | null> => {
  if (!Number.isFinite(personId) || personId <= 0) return null;
  try {
    return await tmdbGetPerson(personId);
  } catch {
    return null;
  }
});
