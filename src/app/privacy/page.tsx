import { PageHero, Prose, Section } from "@/components/marketing/Page";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "ReelSeek’s privacy policy: no accounts, no ads, no analytics SDKs. What is stored on your device, what reaches our server, and how long logs are kept.",
  path: "/privacy"
});

// Canonical production home of the policy previously hosted on GitHub Pages
// (content kept in sync with docs/privacy.md, which now defers here).
export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <PageHero
        title="Privacy Policy"
        lead="Last updated: 11 July 2026"
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy" }
        ]}
      />

      <Prose>
        <p>
          This is the privacy policy for the <strong>ReelSeek</strong> web
          application and mobile apps (the &ldquo;App&rdquo;), operated by
          Khaled Samir (the &ldquo;Operator&rdquo;). The App is designed to
          collect as little data as possible: no account is required, there
          are no ads, no third-party analytics or advertising SDKs, and no
          sale or sharing of personal data.
        </p>
      </Prose>

      <Section title="1. What the App stores on your device">
        <Prose>
          <p>
            <strong>Watchlist (mobile apps).</strong> Titles you bookmark are
            saved locally on your device. This data never leaves your device
            and is not synced to any server we operate; uninstalling the app
            deletes it.
          </p>
          <p>
            <strong>Preferences.</strong> Your country selection, recent
            titles (web), and last-used filters may be cached in local
            storage on your device. We have no access to anything stored on
            your device.
          </p>
        </Prose>
      </Section>

      <Section title="2. What the App sends to our server">
        <Prose>
          <p>
            When you search or open a title, the App requests data from our
            backend (hosted on Google Cloud Run in the EU). Each request may
            include your search query or filter parameters, the numeric ID of
            a title you opened, and a country code used to look up regional
            availability (defaults to EG).
          </p>
          <p>
            Requests also carry standard network metadata — IP address,
            user-agent, timestamp. We do not store these in a
            user-identifiable database. Access logs are retained for 30 days
            for operational and security purposes, then deleted.
          </p>
          <p>
            We do <strong>not</strong> receive or store your name, email,
            contacts, device identifiers, precise location, or payment
            information — the App never asks for them.
          </p>
        </Prose>
      </Section>

      <Section title="3. Third-party services">
        <Prose>
          <p>
            To answer queries, our server calls The Movie Database (TMDb) for
            title metadata, OMDb for IMDb ratings, and Watchmode for
            supplemental availability; hosting is provided by Google Cloud
            Run. You do not interact with these services directly, but they
            receive the request metadata our server forwards. Poster and
            profile images load directly from TMDb’s public image CDN, which
            therefore sees your IP address when images load.
          </p>
        </Prose>
      </Section>

      <Section title="4. Children’s privacy">
        <Prose>
          <p>
            The App is not directed at children under 13 and does not
            knowingly collect personal information from children. If you
            believe a child has provided personal information to us, contact
            us and we will delete it.
          </p>
        </Prose>
      </Section>

      <Section title="5. Your rights">
        <Prose>
          <p>
            Because we maintain no user accounts or user-identifiable records
            beyond short-lived operational logs, there is typically no
            personal record to access, correct, or delete. For questions
            about data tied to your IP address in access logs, contact us
            within the 30-day retention window via the support page and we
            will assist within applicable legal timeframes.
          </p>
        </Prose>
      </Section>

      <Section title="6. Changes">
        <Prose>
          <p>
            We may update this policy; the date above changes accordingly and
            material changes are highlighted in the apps’ About screens.
          </p>
          <p className="text-white/50">
            This product uses the TMDb API but is not endorsed or certified
            by TMDb.
          </p>
        </Prose>
      </Section>
    </div>
  );
}
