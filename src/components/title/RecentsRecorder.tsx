"use client";

// Invisible client island that records a viewed title into localStorage for
// the homepage "recently viewed" strip. Same storage shape as before the
// server-rendering refactor (key: recent_movies, capped at 10).

import { useEffect } from "react";
import type { MediaType } from "@/types";

interface RecentEntry {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterUrl: string | null;
}

export function RecentsRecorder({ entry }: { entry: RecentEntry }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem("recent_movies");
      const arr = raw ? (JSON.parse(raw) as RecentEntry[]) : [];
      const next: RecentEntry[] = [
        entry,
        ...arr.filter(
          (x) => !(x.tmdbId === entry.tmdbId && x.mediaType === entry.mediaType)
        )
      ].slice(0, 10);
      localStorage.setItem("recent_movies", JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [entry]);
  return null;
}
