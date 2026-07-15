// Typed JSON-LD builders. Structured data must mirror visible page content —
// never invent ratings, reviews, counts, prices, awards, or partnerships.

import { absoluteUrl, site, type CountryInfo } from "@/lib/site";
import { publicFacts } from "@/content/publicFacts";
import type { AvailabilityDto, MovieDetailsDto, PersonDto } from "@/types";

type JsonLdObject = Record<string, unknown>;

// Escape sequences that could break out of a <script> element or confuse
// HTML parsing. JSON stays valid because these are string-level escapes.
export function serializeJsonLd(data: JsonLdObject): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function organizationSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.origin}/#organization`,
    name: publicFacts.name,
    url: site.origin,
    logo: absoluteUrl(site.logo.icon512),
    description: publicFacts.oneSentence,
    ...(site.socialProfiles.length > 0 ? { sameAs: site.socialProfiles } : {})
  };
}

export function webSiteSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.origin}/#website`,
    name: publicFacts.name,
    url: site.origin,
    description: publicFacts.description,
    publisher: { "@id": `${site.origin}/#organization` }
  };
}

export function softwareApplicationSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: publicFacts.name,
    url: site.origin,
    description: publicFacts.expandedDescription,
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Web"
    // App Store / Google Play URLs are added only once real listings exist.
  };
}

export function breadcrumbSchema(
  items: { name: string; path: string }[]
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

function actorList(details: MovieDetailsDto) {
  return details.cast.slice(0, 10).map((c) => ({
    "@type": "Person",
    name: c.name,
    url: absoluteUrl(`/person/${c.personId}`)
  }));
}

// Options for scoping a title's schema to a specific market (per-country
// pages). When availability is passed, each currently-streamable provider
// becomes a WatchAction whose Offer is limited to that country via
// eligibleRegion — mirroring the provider cards shown on the page.
export interface TitleSchemaOpts {
  canonicalPath?: string;
  availability?: AvailabilityDto | null;
  country?: CountryInfo;
}

function watchActions(
  availability: AvailabilityDto,
  country: CountryInfo
): JsonLdObject[] {
  return availability.providers
    .filter((p) => p.available && p.streamingUrl)
    .map((p) => ({
      "@type": "WatchAction",
      name: p.providerName,
      target: p.streamingUrl,
      expectsAcceptanceOf: {
        "@type": "Offer",
        ...(p.availabilityType ? { category: p.availabilityType } : {}),
        ...(isValidIsoDate(p.startsAt)
          ? { availabilityStarts: p.startsAt }
          : {}),
        eligibleRegion: { "@type": "Country", name: country.name }
      }
    }));
}

export function movieSchema(
  details: MovieDetailsDto,
  opts: TitleSchemaOpts = {}
): JsonLdObject {
  const url = absoluteUrl(opts.canonicalPath ?? `/movie/${details.tmdbId}`);
  const actions =
    opts.availability && opts.country
      ? watchActions(opts.availability, opts.country)
      : [];
  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    "@id": url,
    name: details.title,
    url,
    ...(details.posterUrl ? { image: details.posterUrl } : {}),
    ...(details.overview ? { description: details.overview } : {}),
    ...(details.releaseDate ? { dateCreated: details.releaseDate } : {}),
    ...(details.runtime && details.runtime > 0
      ? { duration: `PT${details.runtime}M` }
      : {}),
    ...(details.genres.length > 0 ? { genre: details.genres } : {}),
    ...(details.cast.length > 0 ? { actor: actorList(details) } : {}),
    ...(actions.length > 0 ? { potentialAction: actions } : {})
    // Aggregate ratings are only emitted when displayed with clear source
    // attribution on the page; TMDb/IMDb scores render as attributed text,
    // so we deliberately omit aggregateRating here.
  };
}

export function tvSeriesSchema(
  details: MovieDetailsDto,
  opts: TitleSchemaOpts = {}
): JsonLdObject {
  const url = absoluteUrl(opts.canonicalPath ?? `/tv/${details.tmdbId}`);
  const actions =
    opts.availability && opts.country
      ? watchActions(opts.availability, opts.country)
      : [];
  return {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "@id": url,
    name: details.title,
    url,
    ...(details.posterUrl ? { image: details.posterUrl } : {}),
    ...(details.overview ? { description: details.overview } : {}),
    ...(details.releaseDate ? { startDate: details.releaseDate } : {}),
    ...(details.numberOfSeasons
      ? { numberOfSeasons: details.numberOfSeasons }
      : {}),
    ...(details.numberOfEpisodes
      ? { numberOfEpisodes: details.numberOfEpisodes }
      : {}),
    ...(details.genres.length > 0 ? { genre: details.genres } : {}),
    ...(details.cast.length > 0 ? { actor: actorList(details) } : {}),
    ...(actions.length > 0 ? { potentialAction: actions } : {})
  };
}

function isValidIsoDate(d: string | null): d is string {
  return !!d && /^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(Date.parse(d));
}

export function personSchema(person: PersonDto): JsonLdObject {
  const url = absoluteUrl(`/person/${person.personId}`);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": url,
    name: person.name,
    url,
    ...(person.profileUrl ? { image: person.profileUrl } : {}),
    ...(person.biography
      ? { description: person.biography.slice(0, 500) }
      : {}),
    ...(isValidIsoDate(person.birthday) ? { birthDate: person.birthday } : {}),
    ...(person.placeOfBirth
      ? { birthPlace: { "@type": "Place", name: person.placeOfBirth } }
      : {}),
    ...(person.imdbId
      ? { sameAs: [`https://www.imdb.com/name/${person.imdbId}/`] }
      : {})
  };
}

export function faqSchema(
  items: { question: string; answer: string }[]
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
}): JsonLdObject {
  const url = absoluteUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url,
    headline: input.title,
    description: input.description,
    url,
    mainEntityOfPage: url,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: { "@type": "Organization", name: publicFacts.name, url: site.origin },
    publisher: { "@id": `${site.origin}/#organization` }
  };
}
