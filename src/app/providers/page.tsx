import Link from "next/link";
import { CtaSection, PageHero, Prose, Section } from "@/components/marketing/Page";
import { pageMetadata } from "@/lib/seo/metadata";
import { PROVIDER_CONTENT, providerConfigFor } from "@/content/providers";
import { publicFacts } from "@/content/publicFacts";

export const metadata = pageMetadata({
  title: "Streaming Providers ReelSeek Checks",
  description:
    "The streaming services ReelSeek checks for availability in Egypt, Saudi Arabia and the UAE — Netflix, Shahid, OSN+, TOD, Watch It, Prime Video, Disney+ and Apple TV+.",
  path: "/providers"
});

export default function ProvidersPage() {
  return (
    <div className="space-y-10">
      <PageHero
        title="Streaming providers"
        lead={`ReelSeek checks ${PROVIDER_CONTENT.length} services on every title, for every supported country.`}
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Providers", path: "/providers" }
        ]}
      />

      <Section>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PROVIDER_CONTENT.map((p) => {
            const config = providerConfigFor(p);
            return (
              <li key={p.key}>
                <Link
                  href={`/providers/${p.slug}`}
                  className="flex gap-3 bg-surface border border-border rounded-xl p-4 hover:border-accent transition h-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={config.logoUrl} alt="" className="w-10 h-10 rounded shrink-0" />
                  <span>
                    <span className="block text-sm font-semibold">{config.name}</span>
                    <span className="block text-xs text-white/55 mt-1 line-clamp-2">
                      {p.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section>
        <Prose>
          <p>{publicFacts.nonAffiliation}</p>
        </Prose>
      </Section>

      <CtaSection
        title="Check them all at once"
        body="One search covers every service above — per country, with subscription/rent/buy labels."
        ctaLabel="Search a title →"
        ctaHref="/"
      />
    </div>
  );
}
