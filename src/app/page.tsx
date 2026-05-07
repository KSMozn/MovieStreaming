"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import type { MediaType } from "@/types";

interface Recent {
  tmdbId: number;
  mediaType?: MediaType;
  title: string;
  posterUrl: string | null;
}

export default function HomePage() {
  const [recents, setRecents] = useState<Recent[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("recent_movies");
      if (raw) setRecents(JSON.parse(raw) as Recent[]);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="space-y-10">
      <section className="text-center pt-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Find where to watch any movie or TV show
        </h1>
        <p className="text-white/60 mt-2 max-w-xl mx-auto">
          Search a title and we&apos;ll show ratings, cast, and which streaming
          service has it in your country.
        </p>
      </section>

      <section>
        <SearchBar />
      </section>

      {recents.length > 0 && (
        <section>
          <h2 className="text-sm uppercase tracking-wider text-white/50 mb-3">
            Recently viewed
          </h2>
          <ul className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {recents.map((r) => {
              const path = r.mediaType === "tv" ? "tv" : "movie";
              return (
                <li key={`${path}-${r.tmdbId}`}>
                  <Link
                    href={`/${path}/${r.tmdbId}`}
                    className="block bg-surface border border-border rounded-lg overflow-hidden hover:border-accent transition"
                  >
                    <div className="aspect-[2/3] bg-surface2 relative">
                      {r.posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.posterUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                      {r.mediaType === "tv" && (
                        <span className="absolute top-1 left-1 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/80 text-bg">
                          TV
                        </span>
                      )}
                    </div>
                    <div className="p-2 text-xs line-clamp-2">{r.title}</div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
