import { arMetadata, ArPageView } from "@/components/marketing/ArPage";
import { arPageByPath, AR_FAQ } from "@/content/ar";
import { FaqList } from "@/components/marketing/Page";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/seo/schema";

const page = arPageByPath("/ar/faq")!;

export const metadata = arMetadata(page);

export default function ArFaqPage() {
  return (
    <>
      {/* JSON-LD mirrors exactly the visible Arabic Q&A below. */}
      <JsonLd data={faqSchema(AR_FAQ)} />
      <ArPageView page={page}>
        <FaqList items={AR_FAQ} />
      </ArPageView>
    </>
  );
}
