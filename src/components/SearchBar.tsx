"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounced } from "@/lib/useDebounced";
import type { SearchResultDto } from "@/types";

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const debounced = useDebounced(q, 300);
  const [results, setResults] = useState<SearchResultDto[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    async function run() {
      if (!debounced.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/movies/search?q=${encodeURIComponent(debounced)}`,
          { signal: ctrl.signal }
        );
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const data = (await res.json()) as SearchResultDto[];
        setResults(data);
        setActive(0);
        setOpen(true);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    run();
    return () => ctrl.abort();
  }, [debounced]);

  // close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function go(r: SearchResultDto) {
    const path = r.mediaType === "tv" ? "tv" : "movie";
    router.push(`/${path}/${r.tmdbId}`);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (r) go(r);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        autoFocus
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        placeholder="Search a movie… e.g. Inception"
        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-base outline-none focus:border-accent transition"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && (loading || results.length > 0 || error) && (
        <div className="absolute z-30 mt-2 w-full bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
          {loading && (
            <div className="px-4 py-3 text-sm text-white/60">Searching…</div>
          )}
          {!loading && error && (
            <div className="px-4 py-3 text-sm text-red-400">{error}</div>
          )}
          {!loading && !error && results.length === 0 && q.trim() && (
            <div className="px-4 py-3 text-sm text-white/60">
              No results for “{q}”.
            </div>
          )}
          {!loading &&
            results.map((r, i) => (
              <button
                key={r.tmdbId}
                onClick={() => go(r)}
                onMouseEnter={() => setActive(i)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left ${
                  i === active ? "bg-surface2" : ""
                }`}
              >
                {r.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.posterUrl}
                    alt=""
                    className="w-9 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-9 h-12 rounded bg-surface2 border border-border" />
                )}
                <div className="flex-1">
                  <div className="text-sm flex items-center gap-2">
                    <span>{r.title}</span>
                    <span
                      className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded ${
                        r.mediaType === "tv"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-sky-500/20 text-sky-300"
                      }`}
                    >
                      {r.mediaType === "tv" ? "TV" : "MOVIE"}
                    </span>
                  </div>
                  <div className="text-xs text-white/50">
                    {r.releaseYear ?? "—"}
                  </div>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
