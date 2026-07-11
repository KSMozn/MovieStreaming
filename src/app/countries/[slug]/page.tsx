import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaSection, LinkGrid, PageHero, Prose, Section } from "@/components/marketing/Page";
import { pageMetadata } from "@/lib/seo/metadata";
import { COUNTRY_CONTENT, countryContentBySlug } from "@/content/countries";
import { providerConfigFor, providerContentBySlug } from "@/content/providers";
import { guideBySlug } from "@/content/guides";
import { publicFacts } from "@/content/publicFacts";

export function generateStaticParams() {
  return COUNTRY_CONTENT.map((c) => ({ slug: c.slug }));
}

interface Props {
  params: { slug: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const country = countryContentBySlug(params.slug);
  if (!country) return { robots: { index: false, follow: false } };
  return pageMetadata({
    title: `Streaming Availability in ${country.info.name}`,
    description: `Find what to watch in ${country.info.name}: which streaming services ReelSeek checks there, how availability differs locally, and how to search the ${country.info.code} catalogue.`,
    path: `/countries/${country.slug}`
  });
}

export default function CountryPage({ params }: Props) {
  const country = countryContentBySlug(params.slug);
  if (!country) notFound();

  const providers = country.relatedProviderSlugs
    .map((slug) => providerContentBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => !!p);
  const guides = country.relatedGuideSlugs
    .map((slug) => guideBySlug(slug))
    .filter((g): g is NonNullable<typeof g> => !!g);

  return (
    <div className="space-y-10">
      <PageHero
        title={`Streaming in ${country.info.name}`}
        lead={country.intro}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Supported countries", path: "/supported-countries" },
          { name: country.info.name, path: `/countries/${country.slug}` }
        ]}
      />

      <Section title={`The ${country.info.name} streaming landscape`}>
        <Prose>
          {country.landscape.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </Prose>
      </Section>

      <Section title={`Using ReelSeek in ${country.info.name}`}>
        <ul className="space-y-2 text-sm text-white/75">
          {country.tips.map((tip) => (
            <li key={tip.slice(0, 40)} className="flex gap-2">
              <span aria-hidden className="text-accent">→</span>
              {tip}
            </li>
          ))}
        </ul>
        <p className="text-xs text-white/45 mt-3">
          ReelSeek checks {publicFacts.supportedProviders.join(", ")} in{" "}
          {country.info.name}. Coverage of purely local services beyond these
          is not claimed; availability can lag as licenses change — confirm
          with the provider before subscribing.
        </p>
      </Section>

      <Section title="Providers to know here">
        <LinkGrid
          links={providers.map((p) => ({
            label: providerConfigFor(p).name,
            href: `/providers/${p.slug}`
          }))}
        />
      </Section>

      <Section title="Related guides">
        <LinkGrid
          links={guides.map((g) => ({
            label: g.title,
            href: `/guides/${g.slug}`
          }))}
        />
      </Section>

      <CtaSection
        title={`Search the ${country.info.code} catalogue`}
        body={`Pick ${country.info.name} in any search or title page and every availability answer applies to your market.`}
        ctaLabel="Start searching →"
        ctaHref="/search"
      />
    </div>
  );
}
