import Link from "next/link";
import { FaqList, PageHero, Prose, Section } from "@/components/marketing/Page";
import { pageMetadata } from "@/lib/seo/metadata";
import { FAQ_ITEMS } from "@/content/faq";

export const metadata = pageMetadata({
  title: "Support",
  description:
    "Get help with ReelSeek: common questions, how to report incorrect streaming availability, and how to reach the team.",
  path: "/support"
});

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <PageHero
        title="Support"
        lead="Most questions are answered below; anything else can be reported directly."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Support", path: "/support" }
        ]}
      />

      <Section title="Quick answers">
        <FaqList items={FAQ_ITEMS.slice(0, 6)} />
        <p className="text-xs text-white/50 mt-2">
          <Link href="/faq" className="underline hover:text-accent">
            Full FAQ →
          </Link>
        </p>
      </Section>

      <Section title="Report incorrect availability">
        <Prose>
          <p>
            If a title shows the wrong availability, include three things in
            your report: the title (with year), the country selected, and the
            service that’s wrong. Availability data comes from upstream
            catalogues and can lag license changes — details on the{" "}
            <Link href="/data-sources" className="text-accent underline">
              data sources page
            </Link>
            .
          </p>
        </Prose>
      </Section>

      <Section title="Contact">
        <Prose>
          <p>
            The quickest way to reach us is the{" "}
            <Link href="/feedback" className="text-accent underline">
              feedback form
            </Link>{" "}
            — use it to report a bug, request a feature, or flag incorrect
            availability. You can also open an issue on the{" "}
            <a
              href="https://github.com/KSMozn/MovieStreaming/issues"
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent underline"
            >
              repository issue tracker
            </a>
            .
          </p>
        </Prose>
      </Section>
    </div>
  );
}
