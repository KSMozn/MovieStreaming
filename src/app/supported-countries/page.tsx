import Link from "next/link";
import { CtaSection, PageHero, Prose, Section } from "@/components/marketing/Page";
import { pageMetadata } from "@/lib/seo/metadata";
import { COUNTRY_CONTENT, countryContentBySlug } from "@/content/countries";

export const metadata = pageMetadata({
  title: "Supported Countries",
  description:
    "ReelSeek computes streaming availability separately for Egypt, Saudi Arabia and the United Arab Emirates. See how each market differs and how to switch.",
  path: "/supported-countries"
});

export default function SupportedCountriesPage() {
  return (
    <div className="space-y-10">
      <PageHero
        title="Supported countries"
        lead="Streaming rights are licensed per territory, so ReelSeek treats each market as its own catalogue."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Supported countries", path: "/supported-countries" }
        ]}
      />

      <Section>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {COUNTRY_CONTENT.map((c) => {
            const country = countryContentBySlug(c.slug)!;
            return (
              <li key={c.slug}>
                <Link
                  href={`/countries/${c.slug}`}
                  className="block bg-surface border border-border rounded-xl p-4 hover:border-accent transition h-full"
                >
                  <span className="block text-sm font-semibold mb-1">
                    {country.info.name}{" "}
                    <span className="text-white/40 font-normal">
                      ({country.info.code})
                    </span>
                  </span>
                  <span className="block text-xs text-white/55 line-clamp-3">
                    {c.intro}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Switching country">
        <Prose>
          <p>
            Every title page has a country selector next to its “Where to
            watch” panel, and advanced search carries the same choice. Egypt
            is the default; your selection re-computes availability instantly
            without leaving the page. More markets may be added over time —
            availability outside the supported list is not shown rather than
            guessed.
          </p>
        </Prose>
      </Section>

      <CtaSection
        title="See your market"
        body="Open any title and flip between EG, SA and AE to watch the availability change."
        ctaLabel="Search a title →"
        ctaHref="/"
      />
    </div>
  );
}
