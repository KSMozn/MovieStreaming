"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/Skeletons";
import type { PersonDto } from "@/types";

export default function PersonPage() {
  const { personId } = useParams<{ personId: string }>();
  const [person, setPerson] = useState<PersonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetch(`/api/people/${personId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed to load person (${r.status})`);
        return (await r.json()) as PersonDto;
      })
      .then((p) => alive && setPerson(p))
      .catch((e) => alive && setError((e as Error).message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [personId]);

  if (error) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6">
        <h1 className="font-semibold mb-2">Something went wrong</h1>
        <p className="text-sm text-white/60">{error}</p>
      </div>
    );
  }

  if (loading || !person) {
    return (
      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        <Skeleton className="w-full aspect-[2/3]" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  const ageOrLifespan = (() => {
    if (!person.birthday) return null;
    const birth = new Date(person.birthday);
    const end = person.deathday ? new Date(person.deathday) : new Date();
    const years = Math.floor(
      (end.getTime() - birth.getTime()) / (365.2425 * 24 * 3600 * 1000)
    );
    return person.deathday
      ? `${person.birthday} – ${person.deathday} (aged ${years})`
      : `${person.birthday} (age ${years})`;
  })();

  return (
    <div className="space-y-10">
      <section className="grid md:grid-cols-[220px_1fr] gap-6">
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="aspect-[2/3] bg-surface2">
            {person.profileUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.profileUrl}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold">{person.name}</h1>
          <div className="text-sm text-white/60 space-y-1">
            {person.knownForDepartment && (
              <div>
                <span className="text-white/40">Known for: </span>
                {person.knownForDepartment}
              </div>
            )}
            {ageOrLifespan && (
              <div>
                <span className="text-white/40">Born: </span>
                {ageOrLifespan}
              </div>
            )}
            {person.placeOfBirth && (
              <div>
                <span className="text-white/40">From: </span>
                {person.placeOfBirth}
              </div>
            )}
            {person.imdbId && (
              <div>
                <a
                  href={`https://www.imdb.com/name/${person.imdbId}/`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 mt-1 px-2.5 py-1 rounded-md bg-accent text-bg text-xs font-semibold"
                >
                  <span className="text-[10px] font-extrabold tracking-wider">
                    IMDb
                  </span>
                  View on IMDb ↗
                </a>
              </div>
            )}
          </div>
          {person.biography && (
            <p className="text-sm leading-relaxed text-white/80 whitespace-pre-line">
              {person.biography}
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Filmography{" "}
          <span className="text-white/40 text-sm font-normal">
            ({person.credits.length})
          </span>
        </h2>
        {person.credits.length === 0 ? (
          <p className="text-sm text-white/60">No credits found.</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {person.credits.map((c) => {
              const path = c.mediaType === "tv" ? "tv" : "movie";
              return (
                <li key={`${c.mediaType}-${c.tmdbId}`}>
                  <Link
                    href={`/${path}/${c.tmdbId}`}
                    className="block bg-surface border border-border rounded-lg overflow-hidden hover:border-accent transition"
                  >
                    <div className="aspect-[2/3] bg-surface2 relative">
                      {c.posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.posterUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                      <span
                        className={`absolute top-1 left-1 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded ${
                          c.mediaType === "tv"
                            ? "bg-emerald-500/90 text-bg"
                            : "bg-sky-500/90 text-bg"
                        }`}
                      >
                        {c.mediaType === "tv" ? "TV" : "MOVIE"}
                      </span>
                      {c.voteAverage != null && (
                        <span className="absolute bottom-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-bg/80 border border-border">
                          ★ {c.voteAverage.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-medium line-clamp-2">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-white/50">
                        {c.releaseYear ?? "—"}
                      </div>
                      {c.character && (
                        <div className="text-[11px] text-white/40 line-clamp-1 italic">
                          as {c.character}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
