import { arMetadata, ArPageView } from "@/components/marketing/ArPage";
import { arPageByPath } from "@/content/ar";

const page = arPageByPath("/ar/how-it-works")!;

export const metadata = arMetadata(page);

export default function Page() {
  return <ArPageView page={page} />;
}
