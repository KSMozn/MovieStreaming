import type { MetadataRoute } from "next";
import { absoluteUrl, isIndexingEnabled } from "@/lib/site";

// Crawler policy. See docs/AI_CRAWLER_POLICY.md for the reasoning behind the
// AI-crawler entries. Notes:
// - /search is NOT disallowed here: it carries a noindex meta directive, and
//   crawlers must be able to fetch the page to see it.
// - Internal JSON APIs are disallowed; public rendering assets are not.
// - AI crawlers (search + model-development) are deliberately allowed on
//   public content per the business decision documented in the policy doc.
// - User-initiated agents (ChatGPT-User, Claude-User) do not reliably obey
//   robots.txt; nothing private is exposed on public routes regardless.

// Internal JSON APIs are off-limits; the documented public facts endpoint
// stays crawlable.
const PUBLIC_DISALLOW = ["/api/"];
const PUBLIC_ALLOW = ["/", "/api/public/"];

export default function robots(): MetadataRoute.Robots {
  if (!isIndexingEnabled()) {
    // Preview/staging: block everything and expose no sitemap.
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  const rule = { allow: PUBLIC_ALLOW, disallow: PUBLIC_DISALLOW };
  return {
    rules: [
      { userAgent: "*", ...rule },
      { userAgent: "Googlebot", ...rule },
      { userAgent: "Bingbot", ...rule },
      // ChatGPT Search crawler
      { userAgent: "OAI-SearchBot", ...rule },
      // OpenAI model-development crawler (deliberately allowed)
      { userAgent: "GPTBot", ...rule },
      // Claude search crawler
      { userAgent: "Claude-SearchBot", ...rule },
      // Anthropic model-development crawler (deliberately allowed)
      { userAgent: "ClaudeBot", ...rule }
    ],
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
