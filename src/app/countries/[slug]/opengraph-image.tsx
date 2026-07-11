import { ogImageResponse, ogSize } from "@/lib/seo/ogImage";
import { countryContentBySlug } from "@/content/countries";
import { withArticle } from "@/lib/site";

export const runtime = "nodejs";
export const size = ogSize;
export const contentType = "image/png";
export const alt = "Country streaming availability | ReelSeek";

export default async function OgImage({ params }: { params: { slug: string } }) {
  const country = countryContentBySlug(params.slug);
  return ogImageResponse(
    country ? `Streaming in ${withArticle(country.info)}` : "Supported country",
    "Find what to watch. Know where to stream it."
  );
}
