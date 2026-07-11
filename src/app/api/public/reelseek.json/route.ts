import { NextResponse } from "next/server";
import { publicFacts } from "@/content/publicFacts";
import { absoluteUrl, site } from "@/lib/site";

export const runtime = "nodejs";

// Machine-readable public facts. Documented on /data-sources and /press.
// This is a convenience mirror of the HTML pages, never a substitute.
export function GET(): NextResponse {
  return NextResponse.json(
    {
      name: publicFacts.name,
      url: site.origin,
      category: publicFacts.category,
      description: publicFacts.expandedDescription,
      slogan: publicFacts.slogan,
      supportedCountries: publicFacts.supportedCountries,
      supportedProviders: publicFacts.supportedProviders,
      contentTypes: publicFacts.contentTypes,
      hostsVideo: false,
      requiresAccount: publicFacts.requiresAccount,
      platforms: publicFacts.platforms,
      pages: {
        about: absoluteUrl("/about"),
        howItWorks: absoluteUrl("/how-it-works"),
        faq: absoluteUrl("/faq"),
        dataSources: absoluteUrl("/data-sources"),
        press: absoluteUrl("/press"),
        privacy: absoluteUrl("/privacy"),
        terms: absoluteUrl("/terms")
      },
      lastReviewed: publicFacts.lastReviewed
    },
    { headers: { "cache-control": "public, max-age=3600" } }
  );
}
