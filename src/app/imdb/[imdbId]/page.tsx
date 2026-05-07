import { redirect } from "next/navigation";
import { IMDB_ID_RE, tmdbFindByImdb } from "@/lib/tmdbClient";

/**
 * Catch-all so that pasting `/movie/tt0405159` (an IMDb id) redirects to the
 * canonical `/movie/{tmdbId}` URL. Numeric TMDb ids are still served by
 * `/movie/[tmdbId]/page.tsx` and never reach this route.
 *
 * Note: Next.js routes a request to the more specific `[tmdbId]` segment
 * before this catch-all, so this only fires for non-matching paths in dev
 * builds. In practice we mount it under a distinct segment to avoid a
 * conflict — see the redirect helper page below.
 */
export default async function ImdbRedirect({
  params
}: {
  params: { imdbId: string };
}) {
  const id = params.imdbId.toLowerCase();
  if (!IMDB_ID_RE.test(id)) redirect("/");
  const results = await tmdbFindByImdb(id).catch(() => []);
  const first = results[0];
  if (!first) redirect("/");
  const path = first.mediaType === "tv" ? "tv" : "movie";
  redirect(`/${path}/${first.tmdbId}`);
}
