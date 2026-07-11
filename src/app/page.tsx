import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { PrimaryButton, SecondaryButton } from "@/components/brand/Button";
import { RecentTitlesClient } from "@/components/RecentTitlesClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqList, LinkGrid, Section } from "@/components/marketing/Page";
import {
  organizationSchema,
  softwareApplicationSchema,
  webSiteSchema
} from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { publicFacts } from "@/content/publicFacts";
import { FAQ_ITEMS } from "@/content/faq";
import { PROVIDER_CONTENT, providerConfigFor } from "@/content/providers";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "ReelSeek — Find What to Watch and Where to Stream It",
  description:
    "Search movies and TV shows, compare streaming availability in your country, and find what to watch across supported services with ReelSeek.",
  path: "/"
});

const HOW_IT_WORKS = [
  {
    title: "Search any title",
    body: "Instant search finds movies and TV shows as you type — or use advanced filters for genre, year, rating, cast, and provider."
  },
  {
    title: "Pick your country",
    body: `Availability is licensed per country. Choose ${publicFacts.supportedCountries.join(", ")} and every answer applies to your market.`
  },
  {
    title: "See where it streams",
    body: "Each title shows which supported services carry it — as a subscription, rental, or purchase — with a direct link to the provider."
  }
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <JsonLd data={organizationSchema()} />
      <JsonLd data={webSiteSchema()} />
      <JsonLd data={softwareApplicationSchema()} />

      {/* 1. Hero */}
      <section className="text-center pt-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Find what <span className="text-accent">to watch.</span>
        </h1>
        <p className="text-white/60 mt-3 max-w-xl mx-auto">
          Discover movies and TV shows and see where they are streaming in
          your country.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <PrimaryButton href="/search">Explore ReelSeek →</PrimaryButton>
          <SecondaryButton href="#get-the-app">Get the App</SecondaryButton>
        </div>
      </section>

      {/* 2. Genuine product search */}
      <section aria-label="Search">
        <SearchBar />
      </section>

      <RecentTitlesClient />

      {/* 3. What is ReelSeek? */}
      <Section title="What is ReelSeek?">
        <p className="text-sm leading-relaxed text-white/75 max-w-3xl">
          {publicFacts.expandedDescription} ReelSeek does not host or stream
          video: it is the answer to “which service actually has it?” — with
          ratings, cast, and one-tap links to the provider that does.
        </p>
      </Section>

      {/* 4. How it works */}
      <Section title="How it works">
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {HOW_IT_WORKS.map((step, i) => (
            <li key={step.title} className="bg-surface border border-border rounded-xl p-4">
              <div className="text-accent text-xs font-bold mb-1">Step {i + 1}</div>
              <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
              <p className="text-xs text-white/60 leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="text-xs text-white/50">
          <Link href="/how-it-works" className="underline hover:text-accent">
            Read more about how ReelSeek works →
          </Link>
        </p>
      </Section>

      {/* 5. Supported countries */}
      <Section title="Supported countries">
        <p className="text-sm text-white/65 max-w-2xl">
          Streaming rights are sold country by country, so ReelSeek computes
          availability separately for each supported market:
        </p>
        <LinkGrid
          links={site.countries.map((c) => ({
            label: c.name,
            href: `/countries/${c.slug}`
          }))}
        />
      </Section>

      {/* 6. Supported providers */}
      <Section title="Streaming services ReelSeek checks">
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

      {/* 7 + 8. Discovery capabilities & regional availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Search the way you remember">
          <p className="text-sm leading-relaxed text-white/70">
            Half a title, an actor’s name, “a thriller from 2019 rated over
            7” — ReelSeek’s{" "}
            <Link href="/search" className="text-accent underline">
              advanced search
            </Link>{" "}
            combines genre, year, rating, cast, provider, and country filters,
            so vague memories still land on the right title page.
          </p>
        </Section>
        <Section title="Why country matters">
          <p className="text-sm leading-relaxed text-white/70">
            The same movie can stream on Netflix in one country and OSN+ in
            another — or nowhere at all. Availability answers are only honest
            when they’re local.{" "}
            <Link href="/where-to-watch" className="text-accent underline">
              How ReelSeek answers “where can I watch this?” →
            </Link>
          </p>
        </Section>
      </div>

      {/* 9. Mobile apps */}
      <section
        id="get-the-app"
        className="bg-surface border border-border rounded-xl p-6 text-center space-y-2"
      >
        <h2 className="text-lg font-semibold">Get the App</h2>
        <p className="text-sm text-white/60 max-w-md mx-auto">
          The ReelSeek app for iPhone and Android brings search, ratings, cast,
          and country-by-country streaming availability to your pocket — with an
          on-device watchlist. Coming soon to the App Store and Google Play.
        </p>
      </section>

      {/* 10. Data accuracy */}
      <Section title="About the data">
        <p className="text-sm leading-relaxed text-white/60 max-w-3xl">
          Availability comes from licensed catalogue sources (TMDb, Watchmode,
          and OMDb for ratings), is computed per country, and carries a
          last-checked timestamp. Licenses rotate, so data can occasionally
          lag — confirm on the provider’s page before subscribing. Details on
          the{" "}
          <Link href="/data-sources" className="text-accent underline">
            data sources page
          </Link>
          .
        </p>
      </Section>

      {/* 11. FAQ preview */}
      <Section title="Frequently asked questions">
        <FaqList items={FAQ_ITEMS.slice(0, 4)} />
        <p className="text-xs text-white/50">
          <Link href="/faq" className="underline hover:text-accent">
            All questions →
          </Link>
        </p>
      </Section>

      {/* 12. Final CTA */}
      <section className="text-center py-4">
        <PrimaryButton href="/search">Start exploring ReelSeek →</PrimaryButton>
      </section>
    </div>
  );
}
