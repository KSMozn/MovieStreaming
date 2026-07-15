import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildTitleMetadata, TitlePageBody } from "@/components/title/TitlePage";
import { countryBySlug } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Props {
  params: { tmdbId: string; country: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const country = countryBySlug(params.country);
  if (!country) return { robots: { index: false, follow: false } };
  return buildTitleMetadata(params.tmdbId, "movie", { country, locale: "ar" });
}

export default function ArMovieCountryPage({ params }: Props) {
  const country = countryBySlug(params.country);
  if (!country) notFound();
  return (
    <TitlePageBody
      rawId={params.tmdbId}
      mediaType="movie"
      country={country}
      locale="ar"
    />
  );
}
