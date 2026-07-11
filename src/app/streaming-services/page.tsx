import Link from "next/link";
import { CtaSection, PageHero, Prose, Section } from "@/components/marketing/Page";
import { pageMetadata } from "@/lib/seo/metadata";
import { PROVIDER_CONTENT, providerConfigFor } from "@/content/providers";

export const metadata = pageMetadata({
  title: "Compare Streaming Services in the Middle East",
  description:
    "An honest overview of the streaming services available in Egypt, Saudi Arabia and the UAE — what each is strongest at, and how to check their catalogues title by title.",
  path: "/streaming-services"
});

export default function StreamingServicesPage() {
  return (
    <div className="space-y-10">
      <PageHero
        title="Streaming services in the Middle East"
        lead="Global platforms, regional powerhouses, and local specialists — what each service is for, in one page."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Streaming services", path: "/streaming-services" }
        ]}
      />

      <Section>
        <Prose>
          <p>
            The MENA streaming market splits into three tiers. Global
            platforms (Netflix, Prime Video, Disney+, Apple TV+) bring scale
            and originals, with catalogues tailored — and trimmed — per
            country. Regional services (Shahid, OSN+, TOD) hold much of the
            content that matters most locally: Arabic originals, HBO’s
            regional rights, and beIN’s entertainment slate. And local
            specialists like Egypt’s Watch It own deep national archives no
            global platform carries.
          </p>
          <p>
            The practical consequence: no single subscription covers a
            region-savvy watchlist, and the “best” service depends entirely on
            what you watch. The honest way to compare them is title by title,
            in your country — which is what ReelSeek is for.
          </p>
        </Prose>
      </Section>

      <Section title="The services">
        <ul className="space-y-3">
          {PROVIDER_CONTENT.map((p) => {
            const config = providerConfigFor(p);
            return (
              <li
                key={p.key}
                className="bg-surface border border-border rounded-xl p-4 flex gap-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.logoUrl} alt="" className="w-10 h-10 rounded shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold">
                    <Link href={`/providers/${p.slug}`} className="hover:text-accent">
                      {config.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-white/60 mt-1">{p.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-white/40 mt-2">
          Descriptions are ReelSeek’s neutral summaries, not provider
          marketing. ReelSeek is not affiliated with any provider.
        </p>
      </Section>

      <CtaSection
        title="Compare them against your watchlist"
        body="Search the five titles you most want to see and note which services keep appearing — that’s your answer."
        ctaLabel="Try it →"
        ctaHref="/"
      />
    </div>
  );
}
