import { PageHero, Prose, Section } from "@/components/marketing/Page";
import { FeedbackForm } from "@/components/FeedbackForm";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Send Feedback",
  description:
    "Share feedback about ReelSeek — report a bug, request a feature, flag incorrect streaming availability, or just tell us what you think.",
  path: "/feedback"
});

export default function FeedbackPage() {
  return (
    <div className="space-y-8">
      <PageHero
        title="Send feedback"
        lead="Every message helps make ReelSeek more accurate and more useful. Tell us what you think."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Feedback", path: "/feedback" }
        ]}
      />

      <Section>
        <Prose>
          <p>
            Found a title with the wrong streaming availability? Want a country
            or provider added? Hit a bug? Send it over — include the title,
            year, and your country for availability issues so we can check it
            against the source data.
          </p>
        </Prose>
      </Section>

      <FeedbackForm />
    </div>
  );
}
