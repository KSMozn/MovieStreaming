"use client";

import { useParams } from "next/navigation";
import { TitleDetails } from "@/components/TitleDetails";

export default function TvPage() {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  return <TitleDetails tmdbId={tmdbId} mediaType="tv" />;
}
