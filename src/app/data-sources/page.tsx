import Link from "next/link";
import { PageHero, Prose, Section } from "@/components/marketing/Page";
import { pageMetadata } from "@/lib/seo/metadata";
import { publicFacts } from "@/content/publicFacts";

export const metadata = pageMetadata({
  title: "Data Sources and Accuracy",
  description:
    "Where ReelSeek’s data comes from — TMDb, Watchmode, and OMDb — how availability is normalized per country, and why results can occasionally lag.",
  path: "/data-sources"
});

export default function DataSourcesPage() {
  return (
    <div className="space-y-8">
      <PageHero
        title="Data sources and accuracy"
        lead="Every availability answer is only as good as its sources — here is exactly where ours come from."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Data sources", path: "/data-sources" }
        ]}
      />

      <Section title="Sources">
        <ul className="space-y-3">
          {publicFacts.dataSources.map((source) => (
            <li key={source.name} className="bg-surface border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-accent"
                >
                  {source.name} ↗
                </a>
              </h3>
              <p className="text-xs text-white/60 mt-1">{source.role}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-white/50 mt-2">{publicFacts.tmdbNotice}</p>
      </Section>

      <Section title="How availability is computed">
        <Prose>
          <p>
            ReelSeek merges provider signals from TMDb’s watch-provider data
            and Watchmode into one normalized answer per title, per country.
            Sources are matched to the tracked services by identity and
            alias, deduplicated, and labelled by availability type
            (subscription, rent, buy, free, or ads). Results are cached
            briefly for speed and carry a last-checked timestamp so you can
            judge freshness.
          </p>
          <p>
            Country-specific answers use each source’s regional data for the
            selected market. Where a provider is absent from an upstream
            catalogue (currently Watch It in TMDb’s provider data), search
            filtering for that provider is limited and ReelSeek shows a
            warning rather than pretending the gap doesn’t exist. Regional
            Middle-East services (OSN+, Shahid, Watch It, TOD) do not operate
            in the US, UK or Canada and correctly show as unavailable there.
          </p>
        </Prose>
      </Section>

      <Section title="Why data can lag">
        <Prose>
          <p>
            Streaming licenses change on the providers’ schedules; catalogue
            databases observe those changes with a delay. That means a title
            can occasionally show as available shortly after leaving a
            service, or take a short while to appear after arriving. Treat
            ReelSeek as the fastest way to a very reliable shortlist — and
            confirm on the provider’s page (one tap away) before paying for
            anything.
          </p>
        </Prose>
      </Section>

      <Section title="Reporting incorrect availability">
        <Prose>
          <p>
            Spotted a wrong result? Report it via the{" "}
            <Link href="/support" className="text-accent underline">
              support page
            </Link>{" "}
            with the title, country, and service — reports are checked
            against the upstream sources and help improve provider matching.
          </p>
          <p className="text-white/50">
            {publicFacts.nonAffiliation} A machine-readable summary of these
            facts is available at{" "}
            <Link href="/api/public/reelseek.json" className="underline">
              /api/public/reelseek.json
            </Link>
            .
          </p>
        </Prose>
      </Section>
    </div>
  );
}
