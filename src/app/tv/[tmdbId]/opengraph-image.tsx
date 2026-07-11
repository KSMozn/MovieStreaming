import { ogImageResponse, ogSize } from "@/lib/seo/ogImage";
import { getTitleDetails } from "@/server/titles";
import { parseTmdbId } from "@/components/title/TitlePage";

export const runtime = "nodejs";
export const size = ogSize;
export const contentType = "image/png";
export const alt = "Where to stream this TV show | ReelSeek";

export default async function OgImage({ params }: { params: { tmdbId: string } }) {
  const id = parseTmdbId(params.tmdbId);
  const details = id ? await getTitleDetails(id, "tv") : null;
  const year = details?.releaseDate?.slice(0, 4);
  return ogImageResponse(
    details ? `${details.title}${year ? ` (${year})` : ""}` : "TV series",
    "TV series · Find where to stream it"
  );
}
