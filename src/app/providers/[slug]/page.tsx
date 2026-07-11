import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaSection, LinkGrid, PageHero, Prose, Section } from "@/components/marketing/Page";
import { pageMetadata } from "@/lib/seo/metadata";
import {
  PROVIDER_CONTENT,
  providerConfigFor,
  providerContentBySlug
} from "@/content/providers";
import { publicFacts } from "@/content/publicFacts";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return PROVIDER_CONTENT.map((p) => ({ slug: p.slug }));
}

interface Props {
  params: { slug: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const content = providerContentBySlug(params.slug);
  if (!content) return { robots: { index: false, follow: false } };
  const name = providerConfigFor(content).name;
  return pageMetadata({
    title: `${name} — Streaming Availability in Egypt, Saudi Arabia and the UAE`,
    description: `How ReelSeek checks ${name} in Egypt, Saudi Arabia and the UAE: what availability it shows, its limitations, and how to search ${name}'s catalogue.`,
    path: `/providers/${content.slug}`
  });
}

export default function ProviderPage({ params }: Props) {
  const content = providerContentBySlug(params.slug);
  if (!content) notFound();
  const config = providerConfigFor(content);
  const others = PROVIDER_CONTENT.filter((p) => p.slug !== content.slug).slice(0, 4);

  return (
    <div className="space-y-10">
      <PageHero
        title={`${config.name} on ReelSeek`}
        lead={content.description}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Providers", path: "/providers" },
          { name: config.name, path: `/providers/${content.slug}` }
        ]}
      />

      <Section title={`How ReelSeek checks ${config.name}`}>
        <Prose>
          <p>
            ReelSeek checks {config.name} for every title, in every supported
            country ({publicFacts.supportedCountries.join(", ")}). When a
            title is carried, the availability panel shows it with a type
            label and, when known, a direct link to the title on {config.name}.
          </p>
          <p>
            <strong className="text-white/85">What you may see:</strong>{" "}
            {content.availabilityTypes} “Subscription” means the title is
            included with the service’s plan; “rent” and “buy” are one-off
            transactions handled entirely on the provider’s platform.
          </p>
          {content.notes && (
            <p>
              <strong className="text-white/85">Coverage note:</strong>{" "}
              {content.notes}
            </p>
          )}
          <p>
            Catalogues change as licenses rotate; every availability answer
            carries a last-checked timestamp, and final confirmation always
            belongs to the provider’s own page.
          </p>
        </Prose>
      </Section>

      <Section title={`Browse ${config.name}'s catalogue`}>
        <Prose>
          <p>
            Use{" "}
            <Link href="/search" className="text-accent underline">
              advanced search
            </Link>{" "}
            with the provider filter set to {config.name} and your country
            selected to browse what the service carries — by genre, year,
            rating, or cast.
          </p>
        </Prose>
      </Section>

      <Section title="Countries">
        <LinkGrid
          links={site.countries.map((c) => ({
            label: `${config.name} in ${c.name}`,
            href: `/countries/${c.slug}`
          }))}
        />
      </Section>

      <Section title="Related providers">
        <LinkGrid
          links={others.map((p) => ({
            label: providerConfigFor(p).name,
            href: `/providers/${p.slug}`
          }))}
        />
      </Section>

      <p className="text-xs text-white/40">
        {publicFacts.nonAffiliation} Provider names are used to identify the
        services being checked.
      </p>

      <CtaSection
        title={`Find a title on ${config.name}`}
        body="Search any movie or show and see instantly whether this service carries it in your country."
        ctaLabel="Search now →"
        ctaHref="/"
      />
    </div>
  );
}
