import { fetchJson } from "./http";

const OMDB_BASE = "https://www.omdbapi.com";

interface OmdbResponse {
  Response: "True" | "False";
  imdbRating?: string;
  Error?: string;
}

/**
 * Fetch the IMDb rating via OMDb (legal API). Returns null if not available
 * or if the OMDb key is not configured (graceful fallback).
 */
export async function getImdbRating(imdbId: string | null): Promise<number | null> {
  if (!imdbId) return null;
  const k = process.env.OMDB_API_KEY;
  if (!k) return null;
  try {
    const url = `${OMDB_BASE}/?i=${encodeURIComponent(imdbId)}&apikey=${encodeURIComponent(k)}`;
    const data = await fetchJson<OmdbResponse>(url, { revalidate: 60 * 60 });
    if (data.Response !== "True" || !data.imdbRating || data.imdbRating === "N/A") {
      return null;
    }
    const v = Number.parseFloat(data.imdbRating);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}
