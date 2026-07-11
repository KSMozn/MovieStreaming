import type { Metadata } from "next";
import { buildTitleMetadata, TitlePageBody } from "@/components/title/TitlePage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Props {
  params: { tmdbId: string };
  searchParams: { country?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildTitleMetadata(params.tmdbId, "movie");
}

export default function MoviePage({ params, searchParams }: Props) {
  return (
    <TitlePageBody
      rawId={params.tmdbId}
      mediaType="movie"
      searchParams={searchParams}
    />
  );
}
