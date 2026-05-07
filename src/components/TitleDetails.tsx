"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProviderCard } from "@/components/ProviderCard";
import {
  GenreChip,
  ImdbLinkButton,
  RatingBadge,
  TmdbRatingBadge
} from "@/components/Badges";
import { CastList } from "@/components/CastList";
import {
  MovieDetailsSkeleton,
  ProviderGridSkeleton
} from "@/components/Skeletons";
import type {
  AvailabilityDto,
  MediaType,
  MovieDetailsDto
} from "@/types";

const COUNTRIES: { code: string; label: string }[] = [
  { code: "EG", label: "Egypt" },
  { code: "SA", label: "Saudi Arabia" },
  { code: "AE", label: "United Arab Emirates" }
];

interface RecentEntry {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterUrl: string | null;
}

export function TitleDetails({
  tmdbId,
  mediaType
}: {
  tmdbId: string;
  mediaType: MediaType;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const country = (sp.get("country") || "EG").toUpperCase();

  const [title, setTitle] = useState<MovieDetailsDto | null>(null);
  const [availability, setAvailability] = useState<AvailabilityDto | null>(null);
  const [loadingTitle, setLoadingTitle] = useState(true);
  const [loadingAvail, setLoadingAvail] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoadingTitle(true);
    setError(null);
    fetch(`/api/movies/${tmdbId}?type=${mediaType}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed to load (${r.status})`);
        return (await r.json()) as MovieDetailsDto;
      })
      .then((m) => {
        if (!alive) return;
        setTitle(m);
        try {
          const raw = localStorage.getItem("recent_movies");
          const arr = raw ? (JSON.parse(raw) as RecentEntry[]) : [];
          const entry: RecentEntry = {
            tmdbId: m.tmdbId,
            mediaType: m.mediaType,
            title: m.title,
            posterUrl: m.posterUrl
          };
          const next: RecentEntry[] = [
            entry,
            ...arr.filter(
              (x) => !(x.tmdbId === m.tmdbId && x.mediaType === m.mediaType)
            )
          ].slice(0, 10);
          localStorage.setItem("recent_movies", JSON.stringify(next));
        } catch {
          // ignore
        }
      })
      .catch((e) => alive && setError((e as Error).message))
      .finally(() => alive && setLoadingTitle(false));
    return () => {
      alive = false;
    };
  }, [tmdbId, mediaType]);

  useEffect(() => {
    let alive = true;
    setLoadingAvail(true);
    fetch(
      `/api/movies/${tmdbId}/availability?country=${country}&type=${mediaType}`
    )
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed availability (${r.status})`);
        return (await r.json()) as AvailabilityDto;
      })
      .then((a) => alive && setAvailability(a))
      .catch(() => alive && setAvailability(null))
      .finally(() => alive && setLoadingAvail(false));
    return () => {
      alive = false;
    };
  }, [tmdbId, country, mediaType]);

  function changeCountry(c: string) {
    const params = new URLSearchParams(sp.toString());
    params.set("country", c);
    const path = mediaType === "tv" ? "tv" : "movie";
    router.replace(`/${path}/${tmdbId}?${params.toString()}`);
  }

  if (error) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6">
        <h1 className="font-semibold mb-2">Something went wrong</h1>
        <p className="text-sm text-white/60">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {loadingTitle || !title ? (
        <MovieDetailsSkeleton />
      ) : (
        <section className="grid md:grid-cols-[260px_1fr] gap-6">
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="aspect-[2/3] bg-surface2">
              {title.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={title.posterUrl}
                  alt={title.title}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded ${
                  title.mediaType === "tv"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-sky-500/20 text-sky-300"
                }`}
              >
                {title.mediaType === "tv" ? "TV SERIES" : "MOVIE"}
              </span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{title.title}</h1>
              {title.originalTitle && title.originalTitle !== title.title && (
                <div className="text-sm text-white/50 italic">
                  {title.originalTitle}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <RatingBadge rating={title.imdbRating} imdbId={title.imdbId} />
              <TmdbRatingBadge
                rating={title.tmdbRating}
                votes={title.tmdbVotes}
              />
              <ImdbLinkButton imdbId={title.imdbId} />
              <span className="text-sm text-white/70">
                {title.releaseDate ?? "Release date unknown"}
              </span>
              {title.runtime != null && (
                <span className="text-sm text-white/70">
                  · {title.runtime} min
                  {title.mediaType === "tv" ? " / ep" : ""}
                </span>
              )}
              {title.mediaType === "tv" && title.numberOfSeasons != null && (
                <span className="text-sm text-white/70">
                  · {title.numberOfSeasons} season
                  {title.numberOfSeasons === 1 ? "" : "s"}
                  {title.numberOfEpisodes != null
                    ? ` · ${title.numberOfEpisodes} episodes`
                    : ""}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {title.genres.length === 0 ? (
                <span className="text-sm text-white/50">No genres</span>
              ) : (
                title.genres.map((g) => <GenreChip key={g}>{g}</GenreChip>)
              )}
            </div>
            <p className="text-sm leading-relaxed text-white/80">
              {title.overview || "No description available."}
            </p>
            <div>
              <h2 className="text-sm uppercase tracking-wider text-white/50 mb-2">
                Top cast
              </h2>
              <CastList cast={title.cast} />
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-lg font-semibold">Where to watch</h2>
          <label className="text-xs flex items-center gap-2">
            <span className="text-white/50">Country</span>
            <select
              value={country}
              onChange={(e) => changeCountry(e.target.value)}
              className="bg-surface border border-border rounded-lg px-2 py-1.5"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loadingAvail ? (
          <ProviderGridSkeleton />
        ) : !availability ? (
          <div className="bg-surface border border-border rounded-xl p-6 text-sm text-white/60">
            Streaming availability could not be loaded.
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availability.providers.map((p) => (
                <ProviderCard key={p.providerKey} p={p} />
              ))}
            </div>
            {availability.providers.every((p) => !p.available) && (
              <p className="text-sm text-white/50 mt-4">
                Not currently available on the supported providers in{" "}
                {availability.country}.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
