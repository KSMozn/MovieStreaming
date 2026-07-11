// ReelSeek public facts — the verified, single source of truth used to
// generate the About page, Press boilerplate, FAQ answers, JSON-LD,
// llms.txt / llms-full.txt, and the Data Sources page. Update this file
// (and docs/REELSEEK_PUBLIC_FACTS.md) together to avoid factual drift.

import { PROVIDERS } from "@/lib/providers";
import { site } from "@/lib/site";

export const publicFacts = {
  name: "ReelSeek",
  domain: site.origin,
  category: "Movie and TV streaming-discovery service",
  slogan: "Find what to watch. Know where to stream it.",
  headline: "Find what to watch.",
  description:
    "ReelSeek helps you discover movies and TV shows, compare where they are streaming in your country, and decide what to watch faster.",
  expandedDescription:
    "ReelSeek is a movie and TV streaming-discovery service that helps viewers search for titles, explore entertainment, compare streaming availability, and find where content is legally available across supported services in their country.",
  oneSentence:
    "ReelSeek is a movie and TV streaming-discovery service that helps viewers find what to watch and see where titles are available across supported streaming services in their country.",
  contentTypes: ["Movies", "TV shows"],
  supportedCountries: site.countries.map((c) => c.name),
  // Derived from the production provider configuration — never hardcoded.
  supportedProviders: PROVIDERS.map((p) => p.name),
  dataSources: [
    {
      name: "The Movie Database (TMDb)",
      role: "Title metadata, ratings, cast, posters, and streaming-provider mappings",
      url: "https://www.themoviedb.org/"
    },
    {
      name: "Watchmode",
      role: "Supplemental streaming-availability data",
      url: "https://watchmode.com/"
    },
    {
      name: "OMDb",
      role: "IMDb ratings",
      url: "https://www.omdbapi.com/"
    }
  ],
  legalModel:
    "ReelSeek shows where titles are legally available on third-party streaming services. It does not host, stream, or sell movies or TV episodes, and links out to official provider pages.",
  doesNotHostVideo: true,
  requiresAccount: false,
  platforms: [
    "Web application",
    "iOS application (in development, not yet on the App Store)",
    "Android application (in development, not yet on Google Play)"
  ],
  tmdbNotice:
    "This product uses the TMDb API but is not endorsed or certified by TMDb.",
  nonAffiliation:
    "ReelSeek is not affiliated with, endorsed by, or partnered with any streaming provider.",
  lastReviewed: "2026-07-11",
  contact: site.supportEmail // null until a public address is provided
} as const;
