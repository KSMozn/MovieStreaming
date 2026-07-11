import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaSection, LinkGrid, PageHero, Prose, Section } from "@/components/marketing/Page";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleSchema } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { GUIDES, guideBySlug } from "@/content/guides";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

interface Props {
  params: { slug: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const guide = guideBySlug(params.slug);
  if (!guide) return { robots: { index: false, follow: false } };
  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    ogType: "article"
  });
}

export default function GuidePage({ params }: Props) {
  const guide = guideBySlug(params.slug);
  if (!guide) notFound();
  const otherGuides = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);
  const path = `/guides/${guide.slug}`;

  return (
    <article className="space-y-10">
      <JsonLd
        data={articleSchema({
          title: guide.title,
          description: guide.description,
          path,
          datePublished: guide.datePublished,
          dateModified: guide.dateModified
        })}
      />

      <PageHero
        title={guide.title}
        lead={guide.description}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: guide.title, path }
        ]}
      />
      <p className="text-xs text-white/40 -mt-6">
        By {guide.author} · Published{" "}
        <time dateTime={guide.datePublished}>{guide.datePublished}</time> ·
        Updated <time dateTime={guide.dateModified}>{guide.dateModified}</time>
      </p>

      {guide.sections.map((section) => (
        <Section key={section.heading} title={section.heading}>
          <Prose>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </Prose>
        </Section>
      ))}

      <Section title="Related">
        <LinkGrid links={guide.related} />
      </Section>

      <Section title="More guides">
        <LinkGrid
          links={otherGuides.map((g) => ({
            label: g.title,
            href: `/guides/${g.slug}`
          }))}
        />
      </Section>

      <p className="text-xs text-white/40">
        Availability facts in this guide reflect the market at the updated
        date above and can change as licenses rotate — check live results on{" "}
        <Link href="/" className="underline hover:text-accent">
          ReelSeek
        </Link>{" "}
        for the current answer.
      </p>

      <CtaSection
        title="Put it into practice"
        body="Search a title now and see its live availability in your country."
        ctaLabel="Open ReelSeek search →"
        ctaHref="/search"
      />
    </article>
  );
}
