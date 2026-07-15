import type { Metadata } from "next";
import { buildTitleMetadata, TitlePageBody } from "@/components/title/TitlePage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Props {
  params: { tmdbId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildTitleMetadata(params.tmdbId, "movie", { locale: "ar" });
}

export default function ArMoviePage({ params }: Props) {
  return <TitlePageBody rawId={params.tmdbId} mediaType="movie" locale="ar" />;
}
