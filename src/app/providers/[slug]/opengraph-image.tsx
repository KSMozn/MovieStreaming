import { ogImageResponse, ogSize } from "@/lib/seo/ogImage";
import { providerConfigFor, providerContentBySlug } from "@/content/providers";

export const runtime = "nodejs";
export const size = ogSize;
export const contentType = "image/png";
export const alt = "Streaming provider availability | ReelSeek";

export default async function OgImage({ params }: { params: { slug: string } }) {
  const content = providerContentBySlug(params.slug);
  const name = content ? providerConfigFor(content).name : "Streaming provider";
  return ogImageResponse(name, "Availability checked in EG · SA · AE");
}
