"use client";

// Browser-only "recently viewed" strip (localStorage). Isolated here so the
// homepage itself stays a server component.

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MediaType } from "@/types";

interface Recent {
  tmdbId: number;
  mediaType?: MediaType;
  title: string;
  posterUrl: string | null;
}

export function RecentTitlesClient() {
  const [recents, setRecents] = useState<Recent[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("recent_movies");
      if (raw) setRecents(JSON.parse(raw) as Recent[]);
    } catch {
      // ignore
    }
  }, []);

  if (recents.length === 0) return null;

  return (
    <section aria-label="Recently viewed">
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
                      loading="lazy"
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
  );
}
