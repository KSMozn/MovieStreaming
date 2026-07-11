import { ogImageResponse, ogSize } from "@/lib/seo/ogImage";
import { guideBySlug } from "@/content/guides";

export const runtime = "nodejs";
export const size = ogSize;
export const contentType = "image/png";
export const alt = "ReelSeek guide";

export default async function OgImage({ params }: { params: { slug: string } }) {
  const guide = guideBySlug(params.slug);
  return ogImageResponse(guide?.title ?? "Guide", "ReelSeek Guides");
}
