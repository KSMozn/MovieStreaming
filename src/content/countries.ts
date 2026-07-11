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
  },
  {
    slug: "united-states",
    intro:
      "ReelSeek supports the United States, where availability is dominated by the global platforms. The regional Middle-East services ReelSeek also tracks — OSN+, Shahid, Watch It, TOD — do not operate in the US, so they show as unavailable there by design.",
    landscape: [
      "In the US, the services that carry titles are the global platforms: Netflix, Amazon Prime Video, Disney+, and Apple TV+. Prime Video and Apple TV also run large rental/purchase stores for recent releases.",
      "ReelSeek's Middle-East providers (OSN+, Shahid, Watch It, TOD) are region-locked to MENA and are not available in the US; their cards will read \"not available\" on US titles. That's accurate, not a data gap.",
      "US streaming catalogues are among the world's largest, and licensing windows shift frequently as titles rotate between the major platforms."
    ],
    tips: [
      "Set the country selector to US to see American availability; if you're browsing from the US, ReelSeek can default to it automatically.",
      "Focus on the four global providers — the regional cards are expected to be empty in this market.",
      "For a recent release not on any subscription yet, check the rent/buy labels on Prime Video and Apple TV."
    ],
    relatedProviderSlugs: ["netflix", "prime-video", "disney-plus", "apple-tv"],
    relatedGuideSlugs: [
      "why-streaming-availability-changes-by-country",
      "find-a-movie-when-you-only-remember-part-of-the-title"
    ]
  },
  {
    slug: "united-kingdom",
    intro:
      "ReelSeek supports the United Kingdom, covering the global streaming platforms. The Middle-East regional services ReelSeek also checks do not operate in the UK, so they appear as unavailable there.",
    landscape: [
      "In the UK, Netflix, Amazon Prime Video, Disney+, and Apple TV+ are the services that carry titles, with Prime Video and Apple TV adding transactional rent/buy options.",
      "ReelSeek's regional providers (OSN+, Shahid, Watch It, TOD) are MENA-only and are not available in the UK; expect their cards to be empty on UK titles.",
      "UK licensing often differs from both the US and the Middle East — a title on one platform in the US can sit with a different one, or none, in Britain."
    ],
    tips: [
      "Set the country selector to UK for British availability; ReelSeek can default to it automatically when you browse from the UK.",
      "The four global platforms are the ones to watch in this market.",
      "Some UK-specific broadcaster services aren't tracked yet — ReelSeek doesn't claim complete coverage of every local UK service."
    ],
    relatedProviderSlugs: ["netflix", "prime-video", "disney-plus", "apple-tv"],
    relatedGuideSlugs: [
      "why-streaming-availability-changes-by-country",
      "find-movies-by-genre-actor-year-rating"
    ]
  },
  {
    slug: "canada",
    intro:
      "ReelSeek supports Canada, covering the global streaming platforms. The Middle-East regional services ReelSeek also tracks do not operate in Canada, so they show as unavailable there.",
    landscape: [
      "In Canada, Netflix, Amazon Prime Video, Disney+, and Apple TV+ are the services that carry titles, with rent/buy options on Prime Video and Apple TV.",
      "ReelSeek's regional providers (OSN+, Shahid, Watch It, TOD) are region-locked to MENA and are not available in Canada; their cards will read \"not available\" on Canadian titles.",
      "Canadian catalogues frequently differ from the neighbouring US ones despite the shared language and region, which is exactly why per-country checking matters."
    ],
    tips: [
      "Set the country selector to Canada for Canadian availability; ReelSeek can default to it automatically when you browse from Canada.",
      "Compare against the four global platforms — the regional cards are expected to be empty here.",
      "Don't assume US availability applies: Canadian licensing is negotiated separately."
    ],
    relatedProviderSlugs: ["netflix", "prime-video", "disney-plus", "apple-tv"],
    relatedGuideSlugs: [
      "why-streaming-availability-changes-by-country",
      "find-a-movie-when-you-only-remember-part-of-the-title"
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
