// Server-rendered title page shared by /movie/[tmdbId] and /tv/[tmdbId]:
// metadata, JSON-LD, breadcrumbs, and the full textual content are in the
// initial HTML; only the availability switcher and recents recording hydrate.

import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  GenreChip,
  ImdbLinkButton,
  RatingBadge,
  TmdbRatingBadge
} from "@/components/Badges";
import { CastList } from "@/components/CastList";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/marketing/Page";
import { AvailabilityClient } from "@/components/title/AvailabilityClient";
import { TheatricalNotice } from "@/components/title/TheatricalNotice";
import { PosterGallery } from "@/components/title/PosterGallery";
import { RecentsRecorder } from "@/components/title/RecentsRecorder";
import { getTitleDetails } from "@/server/titles";
import { getTitleAvailability } from "@/server/availability";
import { getTheatricalStatus } from "@/server/theatrical";
import { getTitleTrailer } from "@/server/trailer";
import { movieSchema, tvSeriesSchema } from "@/lib/seo/schema";
import { pageMetadata, truncateDescription } from "@/lib/seo/metadata";
import { absoluteUrl, countryByCode, site, type CountryInfo } from "@/lib/site";
import Link from "next/link";
import { GEO_HEADER, resolveCountry } from "@/lib/geo";
import {
  countryIntro,
  titleMetaDescription,
  titleMetaTitle,
  titlePath,
  titleStrings,
  type Locale
} from "@/lib/title-i18n";
import type { MediaType, MovieDetailsDto } from "@/types";

export function parseTmdbId(raw: string): number | null {
  if (!/^\d{1,10}$/.test(raw)) return null;
  const id = Number.parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function releaseYear(details: MovieDetailsDto): string | null {
  return details.releaseDate?.slice(0, 4) ?? null;
}

export async function buildTitleMetadata(
  rawId: string,
  mediaType: MediaType,
  opts: { country?: CountryInfo; locale?: Locale } = {}
): Promise<Metadata> {
  const id = parseTmdbId(rawId);
  const details = id ? await getTitleDetails(id, mediaType) : null;
  if (!details) {
    // Invalid or unknown IDs must not produce an indexable generic shell.
    return { robots: { index: false, follow: false } };
  }
  const { country } = opts;
  const locale: Locale = opts.locale ?? "en";
  const year = releaseYear(details);
  const path = titlePath(mediaType, details.tmdbId, { country, locale });

  // hreflang: this exact page (base or a specific country) has an English and
  // an Arabic equivalent; x-default points at the English one.
  const languages = {
    en: absoluteUrl(titlePath(mediaType, details.tmdbId, { country })),
    ar: absoluteUrl(
      titlePath(mediaType, details.tmdbId, { country, locale: "ar" })
    ),
    "x-default": absoluteUrl(titlePath(mediaType, details.tmdbId, { country }))
  };

  return pageMetadata({
    title: titleMetaTitle({ title: details.title, year, country, locale }),
    description: truncateDescription(
      titleMetaDescription({ title: details.title, mediaType, country, locale })
    ),
    path,
    locale,
    languages,
    ogType: mediaType === "tv" ? "video.tv_show" : "video.movie",
    images: details.posterUrl
      ? [{ url: details.posterUrl, alt: `${details.title} poster` }]
      : undefined
  });
}

export async function TitlePageBody({
  rawId,
  mediaType,
  searchParams,
  country: forcedCountry,
  locale = "en"
}: {
  rawId: string;
  mediaType: MediaType;
  searchParams?: { country?: string };
  /** Forced market for a per-country route (/movie/[id]/[country]). */
  country?: CountryInfo;
  locale?: Locale;
}) {
  const id = parseTmdbId(rawId);
  if (!id) notFound();
  const details = await getTitleDetails(id, mediaType);
  if (!details) notFound();

  const t = titleStrings(locale);

  // On a per-country route the market is fixed; otherwise resolve it from an
  // explicit ?country= → detected country → default EG.
  const countryCode = forcedCountry
    ? forcedCountry.code
    : resolveCountry(searchParams?.country, headers().get(GEO_HEADER));
  const activeCountry = forcedCountry ?? countryByCode(countryCode)!;
  const [availability, theatrical, trailer] = await Promise.all([
    getTitleAvailability(id, mediaType, countryCode),
    getTheatricalStatus(id, mediaType, countryCode),
    getTitleTrailer(id, mediaType, locale)
  ]);

  // JSON-LD: attach the official trailer as a VideoObject on every variant,
  // and on per-country routes scope it to that market (WatchActions +
  // eligibleRegion) with the country-specific canonical URL.
  const schemaOpts = {
    trailer,
    ...(forcedCountry
      ? {
          canonicalPath: titlePath(mediaType, details.tmdbId, {
            country: forcedCountry,
            locale
          }),
          availability,
          country: forcedCountry
        }
      : {})
  };

  const hub = mediaType === "tv" ? "/tv-shows" : "/movies";
  const hubName = mediaType === "tv" ? t.tvShows : t.movies;

  const crumbs: { name: string; path: string }[] = [
    { name: t.home, path: locale === "ar" ? "/ar" : "/" }
  ];
  // Hub landing pages only exist in English; skip the hub crumb in Arabic
  // rather than link to a non-existent /ar/movies.
  if (locale === "en") crumbs.push({ name: hubName, path: hub });
  crumbs.push({
    name: details.title,
    path: titlePath(mediaType, details.tmdbId, { locale })
  });
  if (forcedCountry) {
    crumbs.push({
      name: locale === "ar" ? forcedCountry.nameAr : forcedCountry.name,
      path: titlePath(mediaType, details.tmdbId, {
        country: forcedCountry,
        locale
      })
    });
  }

  const availabilityHeading = forcedCountry
    ? `${t.whereToWatch} ${details.title} ${locale === "ar" ? "في" : "in"} ${
        locale === "ar" ? forcedCountry.nameAr : forcedCountry.name
      }`
    : t.whereToWatch;

  return (
    <div className="space-y-10">
      <JsonLd
        data={
          mediaType === "tv"
            ? tvSeriesSchema(details, schemaOpts)
            : movieSchema(details, schemaOpts)
        }
      />
      <RecentsRecorder
        entry={{
          tmdbId: details.tmdbId,
          mediaType: details.mediaType,
          title: details.title,
          posterUrl: details.posterUrl
        }}
      />

      <Breadcrumbs items={crumbs} />

      <section className="grid md:grid-cols-[260px_1fr] gap-6">
        {/* Poster + official trailer, swipeable. Capped width when the grid
            collapses to one column on mobile so it never renders
            full-viewport-tall. */}
        <PosterGallery
          posterUrl={details.posterUrl}
          title={details.title}
          trailer={trailer}
          locale={locale}
        />
        {/* min-w-0 lets the 1fr column shrink; without it the horizontal cast
            scroller's content forces the grid wider than the page container. */}
        <div className="space-y-4 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded ${
                details.mediaType === "tv"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-sky-500/20 text-sky-300"
              }`}
            >
              {details.mediaType === "tv" ? t.tvSeries : t.movie}
            </span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{details.title}</h1>
            {details.originalTitle && details.originalTitle !== details.title && (
              <div className="text-sm text-white/50 italic">{details.originalTitle}</div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RatingBadge rating={details.imdbRating} imdbId={details.imdbId} />
            <TmdbRatingBadge rating={details.tmdbRating} votes={details.tmdbVotes} />
            <ImdbLinkButton imdbId={details.imdbId} />
            <span className="text-sm text-white/70">
              {details.releaseDate ?? t.releaseUnknown}
            </span>
            {details.runtime != null && (
              <span className="text-sm text-white/70">
                · {details.runtime}{" "}
                {details.mediaType === "tv" ? t.minPerEp : t.min}
              </span>
            )}
            {details.mediaType === "tv" && details.numberOfSeasons != null && (
              <span className="text-sm text-white/70">
                · {t.seasonWord(details.numberOfSeasons)}
                {details.numberOfEpisodes != null
                  ? ` · ${details.numberOfEpisodes} ${t.episodesWord}`
                  : ""}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {details.genres.length === 0 ? (
              <span className="text-sm text-white/50">{t.noGenres}</span>
            ) : (
              details.genres.map((g) => <GenreChip key={g}>{g}</GenreChip>)
            )}
          </div>
          <p className="text-sm leading-relaxed text-white/80">
            {details.overview || t.noDescription}
          </p>
          <div>
            <h2 className="text-sm uppercase tracking-wider text-white/50 mb-2">
              {t.topCast}
            </h2>
            <CastList cast={details.cast} />
          </div>
        </div>
      </section>

      {forcedCountry && (
        <p className="text-sm leading-relaxed text-white/70 -mt-4">
          {countryIntro({
            title: details.title,
            country: forcedCountry,
            mediaType,
            locale
          })}
        </p>
      )}

      <TheatricalNotice
        status={theatrical}
        country={activeCountry}
        title={details.title}
        locale={locale}
      />

      <AvailabilityClient
        tmdbId={details.tmdbId}
        mediaType={details.mediaType}
        country={countryCode}
        availability={availability}
        locale={locale}
        heading={availabilityHeading}
      />

      <CountryLinks
        mediaType={mediaType}
        tmdbId={details.tmdbId}
        title={details.title}
        currentCode={forcedCountry ? forcedCountry.code : null}
        locale={locale}
      />
    </div>
  );
}

// Internal-linking block: crawlable links to every {title}×{country} page.
// Gives search engines a discovery path to the per-country variants and lets
// visitors jump straight to their market.
function CountryLinks({
  mediaType,
  tmdbId,
  title,
  currentCode,
  locale
}: {
  mediaType: MediaType;
  tmdbId: number;
  title: string;
  currentCode: string | null;
  locale: Locale;
}) {
  const t = titleStrings(locale);
  return (
    <section aria-labelledby="by-country-heading" className="border-t border-border pt-6">
      <h2
        id="by-country-heading"
        className="text-sm uppercase tracking-wider text-white/50 mb-3"
      >
        {t.byCountryHeading(title)}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {site.countries.map((c) => {
          const active = c.code === currentCode;
          return (
            <li key={c.code}>
              <Link
                href={titlePath(mediaType, tmdbId, { country: c, locale })}
                aria-current={active ? "page" : undefined}
                className={`inline-block text-sm rounded-lg border px-3 py-1.5 transition ${
                  active
                    ? "border-accent text-accent bg-accent/10"
                    : "border-border text-white/80 hover:border-white/40"
                }`}
              >
                {locale === "ar" ? c.nameAr : c.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
