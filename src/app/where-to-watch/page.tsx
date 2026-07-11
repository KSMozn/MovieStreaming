import Link from "next/link";
import { CtaSection, LinkGrid, PageHero, Prose, Section } from "@/components/marketing/Page";
import { pageMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";
import { PROVIDER_CONTENT, providerConfigFor } from "@/content/providers";

export const metadata = pageMetadata({
  title: "Where to Watch Movies and TV Shows",
  description:
    "How to answer “where can I watch this?” for Egypt, Saudi Arabia and the UAE — check every major streaming service for any title in one search.",
  path: "/where-to-watch"
});

export default function WhereToWatchPage() {
  return (
    <div className="space-y-10">
      <PageHero
        title="Where to watch — answered per country"
        lead="“Is it on Netflix?” is the wrong question. The right one is: which service has it in your country, today?"
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Where to watch", path: "/where-to-watch" }
        ]}
      />

      <Section>
        <Prose>
          <p>
            Every movie and TV show on ReelSeek has a “Where to watch” panel
            that checks all supported streaming services at once for the
            country you choose. Instead of opening eight apps to search the
            same title, you search once and see the whole market: which
            services carry it, whether it’s part of a subscription or a
            rental/purchase, and a direct link to the title on that service.
          </p>
          <p>
            When a title isn’t available anywhere in your country, ReelSeek
            says so plainly — and switching country shows you whether the gap
            is local licensing or region-wide.
          </p>
        </Prose>
      </Section>

      <Section title="Checked services">
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PROVIDER_CONTENT.map((p) => {
            const config = providerConfigFor(p);
            return (
              <li key={p.key}>
                <Link
                  href={`/providers/${p.slug}`}
                  className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm hover:border-accent transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={config.logoUrl} alt="" className="w-6 h-6 rounded" />
                  {config.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Supported countries">
        <LinkGrid
          links={site.countries.map((c) => ({
            label: c.name,
            href: `/countries/${c.slug}`
          }))}
        />
      </Section>

      <CtaSection
        title="Find where to watch any title"
        body="Search a movie or show and get its availability across every checked service in your country."
        ctaLabel="Start a search →"
        ctaHref="/"
      />
    </div>
  );
}
