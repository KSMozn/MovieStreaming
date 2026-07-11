import Link from "next/link";
import { CtaSection, PageHero, Prose, Section } from "@/components/marketing/Page";
import { pageMetadata } from "@/lib/seo/metadata";
import { publicFacts } from "@/content/publicFacts";

export const metadata = pageMetadata({
  title: "About ReelSeek",
  description:
    "ReelSeek is a movie and TV streaming-discovery service for Egypt, Saudi Arabia and the UAE. Learn what it does, what it doesn’t do, and how it works.",
  path: "/about"
});

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <PageHero
        title="About ReelSeek"
        lead={publicFacts.oneSentence}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" }
        ]}
      />

      <Section title="What ReelSeek does">
        <Prose>
          <p>{publicFacts.expandedDescription}</p>
          <p>
            The core question ReelSeek answers is deceptively simple: “which
            streaming service actually has this title, here, right now?”
            Because streaming rights are licensed per country, the answer in{" "}
            {publicFacts.supportedCountries.join(", ")} is different from the
            answer anywhere else — and different between those three markets
            too. ReelSeek computes it per country, labels each result as
            subscription, rent, or buy, and links straight to the provider.
          </p>
        </Prose>
      </Section>

      <Section title="What ReelSeek is not">
        <Prose>
          <p>
            ReelSeek is not a streaming service. It does not host, stream, or
            sell movies or TV episodes, and it carries no video content of any
            kind. {publicFacts.nonAffiliation} When you press play, you do it
            on the provider’s own app or website.
          </p>
        </Prose>
      </Section>

      <Section title="Facts at a glance">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/75">
          <li className="bg-surface border border-border rounded-lg px-4 py-3">
            <span className="text-white/45">Category:</span> {publicFacts.category}
          </li>
          <li className="bg-surface border border-border rounded-lg px-4 py-3">
            <span className="text-white/45">Countries:</span>{" "}
            {publicFacts.supportedCountries.join(", ")}
          </li>
          <li className="bg-surface border border-border rounded-lg px-4 py-3">
            <span className="text-white/45">Services checked:</span>{" "}
            {publicFacts.supportedProviders.join(", ")}
          </li>
          <li className="bg-surface border border-border rounded-lg px-4 py-3">
            <span className="text-white/45">Account required:</span> No
          </li>
          <li className="bg-surface border border-border rounded-lg px-4 py-3">
            <span className="text-white/45">Platforms:</span> Web; iOS and
            Android apps in pre-release
          </li>
          <li className="bg-surface border border-border rounded-lg px-4 py-3">
            <span className="text-white/45">Data:</span>{" "}
            {publicFacts.dataSources.map((d) => d.name).join(", ")} —{" "}
            <Link href="/data-sources" className="text-accent underline">
              details
            </Link>
          </li>
        </ul>
      </Section>

      <CtaSection
        title="See it in action"
        body="Search any movie or TV show and get its per-country availability in seconds."
        ctaLabel="Explore ReelSeek →"
        ctaHref="/search"
      />
    </div>
  );
}
