// Generators for /llms.txt and /llms-full.txt — supplemental public
// information files for AI systems. Generated from publicFacts so the
// facts cannot drift from the About/Press/FAQ pages. These files do not
// replace HTML, metadata, sitemaps, robots.txt, or structured data.

import { publicFacts } from "@/content/publicFacts";
import { FAQ_ITEMS } from "@/content/faq";
import { GUIDES } from "@/content/guides";
import { absoluteUrl, site } from "@/lib/site";

const MAIN_PAGES: [string, string][] = [
  ["Homepage", "/"],
  ["About", "/about"],
  ["How it works", "/how-it-works"],
  ["Where to watch", "/where-to-watch"],
  ["Supported countries", "/supported-countries"],
  ["Streaming providers", "/providers"],
  ["Movies hub", "/movies"],
  ["TV shows hub", "/tv-shows"],
  ["Guides", "/guides"],
  ["FAQ", "/faq"],
  ["Data sources", "/data-sources"],
  ["Press", "/press"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["Support", "/support"]
];

export function llmsTxt(): string {
  return `# ${publicFacts.name}

> ${publicFacts.expandedDescription}

Canonical domain: ${site.origin}
Category: ${publicFacts.category}
Important: ${publicFacts.name} does not host or stream video. It shows where titles are legally available on third-party streaming services and links to them.

## Core capabilities

- Instant title search for movies and TV shows
- Advanced search by genre, year, rating, cast member, provider, and country
- Per-country streaming availability (subscription / rent / buy) with links to providers
- Title pages with ratings, cast, and overviews; person pages with filmographies

## Coverage

- Supported countries: ${publicFacts.supportedCountries.join(", ")}
- Supported content types: ${publicFacts.contentTypes.join(", ")}
- Streaming services checked: ${publicFacts.supportedProviders.join(", ")}

## Main pages

${MAIN_PAGES.map(([label, path]) => `- [${label}](${absoluteUrl(path)})`).join("\n")}

## Facts

- No account required; no user analytics or third-party tracking SDKs
- Data sources: ${publicFacts.dataSources.map((d) => d.name).join(", ")}
- ${publicFacts.nonAffiliation}
- Last reviewed: ${publicFacts.lastReviewed}
`;
}

export function llmsFullTxt(): string {
  return `# ${publicFacts.name} — full public information

Last reviewed: ${publicFacts.lastReviewed}
Canonical domain: ${site.origin}

## What ${publicFacts.name} is

${publicFacts.expandedDescription}

${publicFacts.name} is a discovery layer, not a streaming platform: it does not host, stream, or sell movies or TV episodes. Every availability result links out to the third-party provider that actually carries the title.

Slogan: ${publicFacts.slogan}

## How the service works

1. A viewer searches for a movie or TV show (instant search) or browses with filters (genre, year, minimum rating, cast member, provider, country, sort order).
2. ${publicFacts.name} normalizes licensed catalogue data into a single title page: overview, genres, runtime or seasons, TMDb and IMDb ratings with attribution, and cast.
3. The availability panel answers "where can I watch this in my country?" for the selected market, labelling each result as subscription, rent, or buy, with a link to the provider.

## Availability methodology

Availability is compiled from ${publicFacts.dataSources
    .map((d) => `${d.name} (${d.role.toLowerCase()})`)
    .join("; ")}. Results are country-specific and time-stamped; streaming licenses rotate, so users are advised to confirm on the provider's page before subscribing or purchasing. ${publicFacts.name} may show a warning when a provider is not covered by upstream catalogues (currently relevant for Watch It).

## Coverage

- Countries: ${publicFacts.supportedCountries.join(", ")} (availability is computed per country)
- Content types: ${publicFacts.contentTypes.join(", ")}
- Providers checked: ${publicFacts.supportedProviders.join(", ")}

## Platform availability

${publicFacts.platforms.map((p) => `- ${p}`).join("\n")}

## Frequently asked questions

${FAQ_ITEMS.map((f) => `### ${f.question}\n\n${f.answer}`).join("\n\n")}

## Guides

${GUIDES.map((g) => `- [${g.title}](${absoluteUrl(`/guides/${g.slug}`)})`).join("\n")}

## Authoritative pages

${MAIN_PAGES.map(([label, path]) => `- ${label}: ${absoluteUrl(path)}`).join("\n")}

## Legal position

${publicFacts.legalModel} ${publicFacts.nonAffiliation} ${publicFacts.tmdbNotice}
`;
}
