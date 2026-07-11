// Server-rendered title page shared by /movie/[tmdbId] and /tv/[tmdbId]:
// metadata, JSON-LD, breadcrumbs, and the full textual content are in the
// initial HTML; only the availability switcher and recents recording hydrate.

import type { Metadata } from "next";
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
import { RecentsRecorder } from "@/components/title/RecentsRecorder";
import { getTitleDetails } from "@/server/titles";
import { getTitleAvailability } from "@/server/availability";
import { movieSchema, tvSeriesSchema } from "@/lib/seo/schema";
import { pageMetadata, truncateDescription } from "@/lib/seo/metadata";
import { countryByCode, site } from "@/lib/site";
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
  mediaType: MediaType
): Promise<Metadata> {
  const id = parseTmdbId(rawId);
  const details = id ? await getTitleDetails(id, mediaType) : null;
  if (!details) {
    // Invalid or unknown IDs must not produce an indexable generic shell.
    return { robots: { index: false, follow: false } };
  }
  const year = releaseYear(details);
  const defaultCountry = countryByCode(site.defaultCountry)!;
  const path = `/${mediaType === "tv" ? "tv" : "movie"}/${details.tmdbId}`;
  return pageMetadata({
    title: `Where to Watch ${details.title}${year ? ` (${year})` : ""} in ${defaultCountry.name}`,
    description: truncateDescription(
      details.overview ||
        `See which streaming services carry ${details.title} in ${site.countries
          .map((c) => c.name)
          .join(", ")} — with ratings, cast, and links to the provider.`
    ),
    path,
    ogType: mediaType === "tv" ? "video.tv_show" : "video.movie",
    images: details.posterUrl
      ? [{ url: details.posterUrl, alt: `${details.title} poster` }]
      : undefined
  });
}

export async function TitlePageBody({
  rawId,
  mediaType,
  searchParams
}: {
  rawId: string;
  mediaType: MediaType;
  searchParams: { country?: string };
}) {
  const id = parseTmdbId(rawId);
  if (!id) notFound();
  const details = await getTitleDetails(id, mediaType);
  if (!details) notFound();

  const requested = (searchParams.country ?? site.defaultCountry).toUpperCase();
  const country = countryByCode(requested)?.code ?? site.defaultCountry;
  const availability = await getTitleAvailability(id, mediaType, country);

  const hub = mediaType === "tv" ? "/tv-shows" : "/movies";
  const hubName = mediaType === "tv" ? "TV shows" : "Movies";
  const path = `/${mediaType === "tv" ? "tv" : "movie"}/${details.tmdbId}`;

  return (
    <div className="space-y-10">
      <JsonLd data={mediaType === "tv" ? tvSeriesSchema(details) : movieSchema(details)} />
      <RecentsRecorder
        entry={{
          tmdbId: details.tmdbId,
          mediaType: details.mediaType,
          title: details.title,
          posterUrl: details.posterUrl
        }}
      />

      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: hubName, path: hub },
          { name: details.title, path }
        ]}
      />

      <section className="grid md:grid-cols-[260px_1fr] gap-6">
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="aspect-[2/3] bg-surface2">
            {details.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={details.posterUrl}
                alt={`${details.title} poster`}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded ${
                details.mediaType === "tv"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-sky-500/20 text-sky-300"
              }`}
            >
              {details.mediaType === "tv" ? "TV SERIES" : "MOVIE"}
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
              {details.releaseDate ?? "Release date unknown"}
            </span>
            {details.runtime != null && (
              <span className="text-sm text-white/70">
                · {details.runtime} min{details.mediaType === "tv" ? " / ep" : ""}
              </span>
            )}
            {details.mediaType === "tv" && details.numberOfSeasons != null && (
              <span className="text-sm text-white/70">
                · {details.numberOfSeasons} season
                {details.numberOfSeasons === 1 ? "" : "s"}
                {details.numberOfEpisodes != null
                  ? ` · ${details.numberOfEpisodes} episodes`
                  : ""}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {details.genres.length === 0 ? (
              <span className="text-sm text-white/50">No genres</span>
            ) : (
              details.genres.map((g) => <GenreChip key={g}>{g}</GenreChip>)
            )}
          </div>
          <p className="text-sm leading-relaxed text-white/80">
            {details.overview || "No description available."}
          </p>
          <div>
            <h2 className="text-sm uppercase tracking-wider text-white/50 mb-2">
              Top cast
            </h2>
            <CastList cast={details.cast} />
          </div>
        </div>
      </section>

      <AvailabilityClient
        tmdbId={details.tmdbId}
        mediaType={details.mediaType}
        initialCountry={country}
        initialAvailability={availability}
      />
    </div>
  );
}
