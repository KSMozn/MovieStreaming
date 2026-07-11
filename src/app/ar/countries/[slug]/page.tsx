import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { arMetadata, ArPageView } from "@/components/marketing/ArPage";
import { arPageByPath } from "@/content/ar";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return site.countries.map((c) => ({ slug: c.slug }));
}

interface Props {
  params: { slug: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const page = arPageByPath(`/ar/countries/${params.slug}`);
  if (!page) return { robots: { index: false, follow: false } };
  return arMetadata(page);
}

export default function ArCountryPage({ params }: Props) {
  const page = arPageByPath(`/ar/countries/${params.slug}`);
  if (!page) notFound();
  return <ArPageView page={page} />;
}
