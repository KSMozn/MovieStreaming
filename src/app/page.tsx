"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { PrimaryButton, SecondaryButton } from "@/components/brand/Button";
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
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Find what <span className="text-accent">to watch.</span>
        </h1>
        <p className="text-white/60 mt-3 max-w-xl mx-auto">
          Discover movies and TV shows and see where they are streaming in
          your country.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <PrimaryButton href="/search">Explore ReelSeek →</PrimaryButton>
          <SecondaryButton href="#get-the-app">Get the App</SecondaryButton>
        </div>
      </section>

      <section>
        <SearchBar />
      </section>

      <section
        id="get-the-app"
        className="bg-surface border border-border rounded-xl p-6 text-center space-y-2"
      >
        <h2 className="text-lg font-semibold">Get the App</h2>
        <p className="text-sm text-white/60 max-w-md mx-auto">
          The ReelSeek app for iPhone and Android brings search, ratings, cast,
          and country-by-country streaming availability to your pocket — with an
          on-device watchlist. Coming soon to the App Store and Google Play.
        </p>
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
