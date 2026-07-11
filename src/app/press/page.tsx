import { PageHero, Prose, Section } from "@/components/marketing/Page";
import { LogoMark } from "@/components/brand/Logo";
import { pageMetadata } from "@/lib/seo/metadata";
import { publicFacts } from "@/content/publicFacts";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Press Kit",
  description:
    "Official ReelSeek descriptions, boilerplate, logo assets and facts for publications and directories covering the streaming-discovery service.",
  path: "/press"
});

const SHORT_DESCRIPTION =
  "ReelSeek is a streaming-discovery service with a Middle-East focus, also available in the US, UK and Canada. Viewers search any movie or TV show and instantly see which streaming services carry it in their country — with ratings, cast, and subscription, rental, or purchase labels. ReelSeek does not stream content itself; it links to the providers that do.";

const BOILERPLATE =
  "ReelSeek is a movie and TV streaming-discovery service built for the Middle East and available across additional markets, where viewing choices are split between global platforms like Netflix, Prime Video, Disney+ and Apple TV+ and regional services like Shahid, OSN+, TOD and Watch It. Because streaming rights are licensed per country, the same title can live on different services — or none — from one market to the next; ReelSeek supports Egypt, Saudi Arabia and the UAE, along with the United States, United Kingdom and Canada, computing availability separately for each and labelling every result as subscription, rental or purchase with a direct link to the provider. The service combines licensed catalogue data from TMDb and Watchmode with IMDb ratings via OMDb, requires no account, carries no ads or analytics SDKs, and is available on the web with native iOS and Android apps in pre-release. ReelSeek hosts no video content and is not affiliated with any streaming provider.";

export default function PressPage() {
  return (
    <div className="space-y-8">
      <PageHero
        title="Press kit"
        lead="Everything a publication or directory needs to describe ReelSeek accurately."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Press", path: "/press" }
        ]}
      />

      <Section title="One sentence">
        <Prose>
          <p>{publicFacts.oneSentence}</p>
        </Prose>
      </Section>

      <Section title="Short description">
        <Prose>
          <p>{SHORT_DESCRIPTION}</p>
        </Prose>
      </Section>

      <Section title="Boilerplate">
        <Prose>
          <p>{BOILERPLATE}</p>
        </Prose>
      </Section>

      <Section title="Fact sheet">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            ["Official name", publicFacts.name],
            ["Domain", site.origin],
            ["Slogan", publicFacts.slogan],
            ["Category", publicFacts.category],
            ["Markets", publicFacts.supportedCountries.join(", ")],
            [
              "Platforms",
              "Web; iOS and Android apps in pre-release (store links to follow)"
            ],
            ["Last updated", publicFacts.lastReviewed]
          ].map(([term, definition]) => (
            <div key={term} className="bg-surface border border-border rounded-lg px-4 py-3">
              <dt className="text-white/45 text-xs">{term}</dt>
              <dd className="mt-0.5">{definition}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Logo assets">
        <div className="flex items-center gap-6 bg-surface border border-border rounded-xl p-6">
          <LogoMark size={64} variant="dark-bg" />
          <div className="bg-brand-neutral rounded-lg p-3">
            <LogoMark size={48} variant="light-bg" />
          </div>
        </div>
        <ul className="text-xs text-white/55 space-y-1 mt-3">
          <li>
            Dark backgrounds:{" "}
            <a href="/brand/logo/reelseek-mark-dark.svg" className="text-accent underline">
              reelseek-mark-dark.svg
            </a>
          </li>
          <li>
            Light backgrounds:{" "}
            <a href="/brand/logo/reelseek-mark.svg" className="text-accent underline">
              reelseek-mark.svg
            </a>
          </li>
          <li>
            App icon (512px):{" "}
            <a href="/brand/icons/icon-512.png" className="text-accent underline">
              icon-512.png
            </a>
          </li>
        </ul>
        <p className="text-xs text-white/45 mt-2">
          Please keep the mark’s proportions and colors; genuine product
          screenshots are available on request via the support page.
        </p>
      </Section>

      <Section title="Contact">
        <Prose>
          <p>
            Media enquiries: via the{" "}
            <a href="/support" className="text-accent underline">
              support page
            </a>
            . A machine-readable fact sheet is published at{" "}
            <a href="/api/public/reelseek.json" className="text-accent underline">
              /api/public/reelseek.json
            </a>
            .
          </p>
        </Prose>
      </Section>
    </div>
  );
}
