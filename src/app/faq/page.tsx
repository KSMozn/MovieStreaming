import { FaqList, PageHero } from "@/components/marketing/Page";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { FAQ_ITEMS } from "@/content/faq";

export const metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers about ReelSeek: what it is, whether it streams video (it doesn’t), which countries and streaming services it covers, and how accurate the data is.",
  path: "/faq"
});

export default function FaqPage() {
  return (
    <div className="space-y-8">
      {/* FAQPage JSON-LD is generated from the exact items rendered below. */}
      <JsonLd data={faqSchema([...FAQ_ITEMS])} />
      <PageHero
        title="Frequently asked questions"
        lead="Everything people ask about ReelSeek, answered plainly."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" }
        ]}
      />
      <FaqList items={[...FAQ_ITEMS]} />
    </div>
  );
}
