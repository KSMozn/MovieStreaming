import { PageHero, Prose, Section } from "@/components/marketing/Page";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Terms of Use",
  description:
    "Terms of use for ReelSeek, the streaming-discovery service: what the service provides, accuracy limits, third-party links, and acceptable use.",
  path: "/terms"
});

export default function TermsPage() {
  return (
    <div className="space-y-8">
      <PageHero
        title="Terms of Use"
        lead="Last updated: 11 July 2026"
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Terms", path: "/terms" }
        ]}
      />

      <Section title="1. The service">
        <Prose>
          <p>
            ReelSeek is a streaming-discovery service operated by Khaled
            Samir. It provides information about movies and TV shows and
            about their availability on third-party streaming services in
            supported countries. ReelSeek does not host, stream, transmit,
            or sell audiovisual content of any kind and grants no rights to
            watch anything.
          </p>
        </Prose>
      </Section>

      <Section title="2. Accuracy and availability of information">
        <Prose>
          <p>
            Availability data is compiled from third-party sources and can be
            delayed, incomplete, or incorrect, and can change at any time as
            streaming licenses rotate. The service is provided &ldquo;as
            is&rdquo; without warranties of any kind. Always verify
            availability, pricing, and regional access on the provider’s own
            platform before subscribing, renting, or purchasing.
          </p>
        </Prose>
      </Section>

      <Section title="3. Third-party services and links">
        <Prose>
          <p>
            Links from ReelSeek lead to independent third-party services
            (streaming providers, IMDb, data sources). Your use of those
            services is governed solely by their own terms and policies.
            ReelSeek is not affiliated with, endorsed by, or responsible for
            any third-party service. Provider names and marks belong to their
            owners and are used only to identify the services being checked.
          </p>
        </Prose>
      </Section>

      <Section title="4. Acceptable use">
        <Prose>
          <p>
            You agree not to disrupt or overload the service, scrape it in a
            manner that degrades it for others, misrepresent its data as your
            own commercial offering, or use it in violation of applicable
            law. Public informational files (such as the sitemap, feed, and
            llms.txt) are provided for legitimate indexing and retrieval.
          </p>
        </Prose>
      </Section>

      <Section title="5. Liability">
        <Prose>
          <p>
            To the maximum extent permitted by law, the Operator is not
            liable for any indirect or consequential loss arising from use of
            the service or from decisions made based on the information it
            displays — including subscriptions or purchases made with third
            parties.
          </p>
        </Prose>
      </Section>

      <Section title="6. Changes and contact">
        <Prose>
          <p>
            These terms may be updated; the date above changes accordingly.
            Questions can be raised via the support page. This product uses
            the TMDb API but is not endorsed or certified by TMDb.
          </p>
        </Prose>
      </Section>
    </div>
  );
}
