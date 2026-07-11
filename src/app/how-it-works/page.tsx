import Link from "next/link";
import { CtaSection, PageHero, Prose, Section } from "@/components/marketing/Page";
import { pageMetadata } from "@/lib/seo/metadata";
import { publicFacts } from "@/content/publicFacts";

export const metadata = pageMetadata({
  title: "How ReelSeek Works",
  description:
    "How ReelSeek turns licensed catalogue data into per-country streaming availability: search, pick your country, and see which service carries a title.",
  path: "/how-it-works"
});

export default function HowItWorksPage() {
  return (
    <div className="space-y-10">
      <PageHero
        title="How ReelSeek works"
        lead="From a half-remembered title to the right streaming app in three steps."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "How it works", path: "/how-it-works" }
        ]}
      />

      <Section title="1 — Find the title">
        <Prose>
          <p>
            Instant search matches as you type, with posters and years so
            remakes and same-name films are easy to tell apart. If you don’t
            have a title —just a mood, an actor, or “something recent rated
            over 7” — the{" "}
            <Link href="/search" className="text-accent underline">
              advanced search
            </Link>{" "}
            combines genre, year, minimum rating, cast, provider, and country
            filters into one query.
          </p>
        </Prose>
      </Section>

      <Section title="2 — Pick your country">
        <Prose>
          <p>
            Streaming rights are sold per territory, so availability is only
            meaningful for a specific market. ReelSeek currently computes
            results for {publicFacts.supportedCountries.join(", ")} — switch
            country on any title page and the availability panel recalculates
            instantly.{" "}
            <Link href="/supported-countries" className="text-accent underline">
              More on supported countries →
            </Link>
          </p>
        </Prose>
      </Section>

      <Section title="3 — See where it streams">
        <Prose>
          <p>
            Each title page shows every service ReelSeek tracks —{" "}
            {publicFacts.supportedProviders.join(", ")} — and marks which ones
            carry the title in your country, whether that’s included in a
            subscription, a rental, or a purchase. One tap takes you to the
            title on the provider’s own platform.
          </p>
          <p>
            Under the hood, ReelSeek normalizes licensed data from TMDb,
            Watchmode, and OMDb into a single answer with a last-checked
            timestamp. Catalogues rotate constantly, so treat the timestamp as
            part of the answer and confirm with the provider before
            subscribing —{" "}
            <Link href="/data-sources" className="text-accent underline">
              how the data works →
            </Link>
          </p>
        </Prose>
      </Section>

      <CtaSection
        title="Try it now"
        body="Type any title and watch the three steps collapse into about ten seconds."
        ctaLabel="Search a title →"
        ctaHref="/"
      />
    </div>
  );
}
