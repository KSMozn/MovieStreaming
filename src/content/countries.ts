// Country-page content. Each market gets genuinely localized copy — not a
// name substitution — plus the providers ReelSeek actually tracks there.
// All configured providers are checked in all three markets; per-country
// emphasis below reflects each market's streaming landscape honestly.

import { site, type CountryInfo } from "@/lib/site";

export interface CountryContent {
  slug: string;
  intro: string;
  landscape: string[];
  tips: string[];
  relatedProviderSlugs: string[];
  relatedGuideSlugs: string[];
}

export const COUNTRY_CONTENT: CountryContent[] = [
  {
    slug: "egypt",
    intro:
      "Egypt is ReelSeek's default market and one of the region's most fragmented streaming landscapes: global platforms compete with strong regional and purely Egyptian services, and the same film is rarely on more than one of them.",
    landscape: [
      "Global platforms — Netflix, Prime Video, Disney+, and Apple TV+ — operate full Egyptian storefronts, but their catalogues differ noticeably from their US or European ones.",
      "Regional services carry much of the most-watched content: Shahid for MBC series and Arabic originals, OSN+ for HBO and premium Western titles, and TOD for beIN entertainment and sport.",
      "Watch It is the distinctly Egyptian service, home to a deep library of Egyptian cinema classics and exclusive local productions. Note that Watch It is missing from some international catalogue databases, so provider-filtered searches can under-report it; ReelSeek shows a warning when that affects results."
    ],
    tips: [
      "Keep the country selector on EG — availability computed for other countries will not match what Egyptian storefronts offer.",
      "For Egyptian classics, check Watch It and Shahid first; for HBO series, OSN+ is usually the answer.",
      "If a title shows as unavailable in Egypt, flip to SA or AE to see whether it is a licensing gap specific to Egypt."
    ],
    relatedProviderSlugs: ["watch-it", "shahid", "osn-plus", "netflix"],
    relatedGuideSlugs: [
      "find-where-a-movie-is-streaming-in-egypt",
      "why-streaming-availability-changes-by-country"
    ]
  },
  {
    slug: "saudi-arabia",
    intro:
      "Saudi Arabia is the region's largest streaming market by audience, with aggressive regional licensing: Shahid, OSN+, and TOD frequently hold Saudi rights to titles that stream elsewhere on global platforms.",
    landscape: [
      "Shahid — operated by MBC, headquartered in the region — is especially strong in Saudi Arabia, with originals, Khaleeji productions, and live channels alongside films and series.",
      "Netflix, Prime Video, Disney+, and Apple TV+ all serve Saudi storefronts; recent international releases often land on one of these first, then migrate to regional services as windows change.",
      "TOD combines entertainment with beIN's sport coverage, which makes it a common household subscription whose film catalogue is easy to overlook — ReelSeek checks it on every title."
    ],
    tips: [
      "Set the country selector to SA — Saudi catalogues differ from both Egyptian and Emirati ones despite the shared region.",
      "For Arabic originals, compare Shahid first; for prestige Western series, OSN+ carries the HBO catalogue in the Kingdom.",
      "Use advanced search with provider + SA to browse what a specific service actually offers before subscribing."
    ],
    relatedProviderSlugs: ["shahid", "osn-plus", "tod", "prime-video"],
    relatedGuideSlugs: [
      "compare-netflix-shahid-osn-tod-prime-video",
      "why-streaming-availability-changes-by-country"
    ]
  },
  {
    slug: "united-arab-emirates",
    intro:
      "The UAE has the region's most international streaming mix: a large expatriate audience means global platforms are prominent, while regional services still hold exclusive MENA rights to much of the Arabic and premium Western catalogue.",
    landscape: [
      "All four global platforms — Netflix, Prime Video, Disney+, and Apple TV+ — run full Emirati storefronts, and their UAE catalogues are among the region's broadest.",
      "OSN+, with roots in the Gulf's premium TV market, remains the home of HBO content in the Emirates; Shahid and TOD cover Arabic series and beIN entertainment respectively.",
      "Rental and purchase options (Prime Video store, Apple TV store) are widely used in the UAE for new releases that no subscription carries yet — ReelSeek labels these separately from subscriptions."
    ],
    tips: [
      "Set the country selector to AE; the UAE frequently gets titles earlier — or on different services — than Egypt or Saudi Arabia.",
      "Check the rent/buy labels: in the UAE a recent release is often available to rent before any subscription carries it.",
      "Cross-check OSN+ for HBO series before assuming a title is unavailable."
    ],
    relatedProviderSlugs: ["osn-plus", "netflix", "apple-tv", "prime-video"],
    relatedGuideSlugs: [
      "compare-netflix-shahid-osn-tod-prime-video",
      "why-streaming-availability-changes-by-country"
    ]
  }
];

export function countryContentBySlug(
  slug: string
): (CountryContent & { info: CountryInfo }) | undefined {
  const content = COUNTRY_CONTENT.find((c) => c.slug === slug);
  const info = site.countries.find((c) => c.slug === slug);
  if (!content || !info) return undefined;
  return { ...content, info };
}
