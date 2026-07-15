import type { Metadata } from "next";
import { buildTitleMetadata, TitlePageBody } from "@/components/title/TitlePage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Props {
  params: { tmdbId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildTitleMetadata(params.tmdbId, "tv", { locale: "ar" });
}

export default function ArTvPage({ params }: Props) {
  return <TitlePageBody rawId={params.tmdbId} mediaType="tv" locale="ar" />;
}
