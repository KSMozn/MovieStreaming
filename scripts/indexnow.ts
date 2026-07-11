/**
 * Manual IndexNow submission.
 *
 * Usage:
 *   INDEXNOW_KEY=... npm run indexnow -- https://reelseek.co/ https://reelseek.co/faq
 *   INDEXNOW_KEY=... npm run indexnow -- --sitemap   # submit every sitemap URL
 *
 * Only URLs on the canonical origin are accepted. Do not run this
 * continuously for unchanged URLs — submit when content actually changes.
 */
import { submitToIndexNow, validateIndexNowUrls } from "@/server/indexnow";
import { absoluteUrl } from "@/lib/site";

async function main() {
  const args = process.argv.slice(2);
  let urls: string[];

  if (args.includes("--sitemap")) {
    const sitemap = (await import("@/app/sitemap")).default;
    urls = (await sitemap()).map((e) => e.url);
  } else if (args.length > 0) {
    urls = args;
  } else {
    console.error("Pass URLs or --sitemap. See file header for usage.");
    process.exit(1);
  }

  const { invalid } = validateIndexNowUrls(urls);
  if (invalid.length > 0) {
    console.warn(`Skipping ${invalid.length} URL(s) not on ${absoluteUrl("/")}:`);
    for (const u of invalid) console.warn(`  - ${u}`);
  }

  const result = await submitToIndexNow(urls);
  console.log(
    result.ok
      ? `Submitted ${result.submitted} URL(s) (status ${result.status}). Receipt does not guarantee crawling or ranking.`
      : `Submission failed (status ${result.status ?? "network error / missing INDEXNOW_KEY"}).`
  );
  process.exit(result.ok ? 0 : 1);
}

main();
