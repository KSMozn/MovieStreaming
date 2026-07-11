import { ogImageResponse, ogSize } from "@/lib/seo/ogImage";
import { getPerson } from "@/server/people";

export const runtime = "nodejs";
export const size = ogSize;
export const contentType = "image/png";
export const alt = "Filmography and where to stream it | ReelSeek";

export default async function OgImage({ params }: { params: { personId: string } }) {
  const id = /^\d{1,10}$/.test(params.personId)
    ? Number.parseInt(params.personId, 10)
    : null;
  const person = id ? await getPerson(id) : null;
  return ogImageResponse(
    person?.name ?? "Person",
    "Filmography · Find where each title streams"
  );
}
