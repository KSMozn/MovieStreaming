"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounced } from "@/lib/useDebounced";
import { PROVIDERS } from "@/lib/providers";
import type { MediaType, ProviderKey } from "@/types";
import type { CombinedGenreDto } from "@/app/api/genres/route";
import type { PersonSearchResult } from "@/lib/tmdbClient";
import { SORT_OPTIONS, type SortKey } from "@/lib/sort";

export interface SearchFormValues {
  q: string;
  year: string;
  genres: number[];
  provider: ProviderKey | "";
  voteGte: string;
  personId: number | null;
  personName: string;
  mediaType: MediaType | "both";
  country: string;
  sortBy: SortKey;
}

const COUNTRIES = [
  { code: "EG", label: "Egypt" },
  { code: "SA", label: "Saudi Arabia" },
  { code: "AE", label: "UAE" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" }
];

interface Props {
  initial: SearchFormValues;
}

export function AdvancedSearchForm({ initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<SearchFormValues>(initial);
  const [genres, setGenres] = useState<CombinedGenreDto[]>([]);
  const [genreFilter, setGenreFilter] = useState("");
  const [genreOpen, setGenreOpen] = useState(false);
  const genreBoxRef = useRef<HTMLDivElement>(null);

  // Load genres list
  useEffect(() => {
    fetch("/api/genres")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setGenres(d as CombinedGenreDto[]);
      })
      .catch(() => {});
  }, []);

  // Close genre dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!genreBoxRef.current?.contains(e.target as Node)) setGenreOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // ---- Actor autocomplete ----
  const debouncedActor = useDebounced(values.personName, 300);
  const [people, setPeople] = useState<PersonSearchResult[]>([]);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const peopleBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!peopleBoxRef.current?.contains(e.target as Node))
        setPeopleOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    async function run() {
      const q = debouncedActor.trim();
      // If the chosen person's name is what we have, don't research
      if (!q || values.personId) {
        setPeople([]);
        return;
      }
      setPeopleLoading(true);
      try {
        const res = await fetch(
          `/api/people/search?q=${encodeURIComponent(q)}`,
          { signal: ctrl.signal }
        );
        if (!res.ok) return;
        const data = (await res.json()) as PersonSearchResult[];
        setPeople(data);
      } catch {
        // ignore
      } finally {
        setPeopleLoading(false);
      }
    }
    run();
    return () => ctrl.abort();
  }, [debouncedActor, values.personId]);

  function update<K extends keyof SearchFormValues>(
    k: K,
    v: SearchFormValues[K]
  ) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  function toggleGenre(id: number) {
    setValues((s) => ({
      ...s,
      genres: s.genres.includes(id)
        ? s.genres.filter((g) => g !== id)
        : [...s.genres, id]
    }));
  }

  function clearAll() {
    const empty: SearchFormValues = {
      q: "",
      year: "",
      genres: [],
      provider: "",
      voteGte: "",
      personId: null,
      personName: "",
      mediaType: "both",
      country: values.country,
      sortBy: "popularity.desc"
    };
    setValues(empty);
    router.push("/search");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (values.q.trim()) sp.set("q", values.q.trim());
    if (values.year.trim()) sp.set("year", values.year.trim());
    if (values.genres.length > 0) sp.set("genres", values.genres.join(","));
    if (values.provider) sp.set("provider", values.provider);
    if (values.voteGte.trim()) sp.set("voteGte", values.voteGte.trim());
    if (values.personId) {
      sp.set("personId", String(values.personId));
      if (values.personName) sp.set("personName", values.personName);
    }
    if (values.mediaType !== "both") sp.set("mediaType", values.mediaType);
    if (values.country) sp.set("country", values.country);
    if (values.sortBy && values.sortBy !== "popularity.desc")
      sp.set("sortBy", values.sortBy);
    const qs = sp.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  }

  const selectedGenreLabels = values.genres
    .map((id) => genres.find((g) => g.id === id)?.name)
    .filter(Boolean) as string[];

  const filteredGenres = genres.filter((g) =>
    g.name.toLowerCase().includes(genreFilter.trim().toLowerCase())
  );

  return (
    <form
      onSubmit={submit}
      className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Title */}
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-white/50">
            Title
          </span>
          <input
            type="text"
            value={values.q}
            onChange={(e) => update("q", e.target.value)}
            placeholder="e.g. Inception"
            className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 outline-none focus:border-accent"
          />
        </label>

        {/* Year */}
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-white/50">
            Year of production
          </span>
          <input
            type="number"
            min={1900}
            max={2100}
            value={values.year}
            onChange={(e) => update("year", e.target.value)}
            placeholder="e.g. 2010"
            className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 outline-none focus:border-accent"
          />
        </label>

        {/* Genres (multi) */}
        <div ref={genreBoxRef} className="relative sm:col-span-2">
          <span className="text-xs uppercase tracking-wider text-white/50">
            Genres (select one or more)
          </span>
          <button
            type="button"
            onClick={() => setGenreOpen((o) => !o)}
            className="mt-1 w-full text-left bg-bg border border-border rounded-lg px-3 py-2 focus:border-accent flex flex-wrap gap-1 min-h-[42px]"
          >
            {selectedGenreLabels.length === 0 ? (
              <span className="text-white/40">Click to choose…</span>
            ) : (
              selectedGenreLabels.map((n, i) => (
                <span
                  key={n}
                  className="text-xs bg-accent/20 text-accent border border-accent/40 px-2 py-0.5 rounded"
                >
                  {n}
                  {i < selectedGenreLabels.length - 1 ? "" : ""}
                </span>
              ))
            )}
          </button>
          {genreOpen && (
            <div className="absolute z-30 mt-1 w-full bg-surface border border-border rounded-lg shadow-2xl max-h-72 overflow-auto">
              <div className="p-2 sticky top-0 bg-surface border-b border-border">
                <input
                  autoFocus
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  placeholder="Filter genres…"
                  className="w-full bg-bg border border-border rounded px-2 py-1 text-sm outline-none focus:border-accent"
                />
              </div>
              {filteredGenres.length === 0 && (
                <div className="px-3 py-2 text-sm text-white/50">
                  No matches.
                </div>
              )}
              {filteredGenres.map((g) => {
                const checked = values.genres.includes(g.id);
                return (
                  <label
                    key={g.id}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-surface2"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleGenre(g.id)}
                      className="accent-accent"
                    />
                    <span>{g.name}</span>
                    <span className="text-[10px] text-white/40">
                      {g.appliesTo.join(" · ")}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Provider */}
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-white/50">
            Streaming provider
          </span>
          <select
            value={values.provider}
            onChange={(e) =>
              update("provider", e.target.value as ProviderKey | "")
            }
            className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 outline-none focus:border-accent"
          >
            <option value="">Any</option>
            {PROVIDERS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        {/* TMDb rating min */}
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-white/50">
            TMDb rating ≥
          </span>
          <input
            type="number"
            step="0.1"
            min={0}
            max={10}
            value={values.voteGte}
            onChange={(e) => update("voteGte", e.target.value)}
            placeholder="e.g. 7.5"
            className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 outline-none focus:border-accent"
          />
        </label>

        {/* Actor autocomplete */}
        <div ref={peopleBoxRef} className="relative sm:col-span-2">
          <span className="text-xs uppercase tracking-wider text-white/50">
            Actor
          </span>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="text"
              value={values.personName}
              onChange={(e) => {
                update("personName", e.target.value);
                if (values.personId) update("personId", null);
                setPeopleOpen(true);
              }}
              onFocus={() => setPeopleOpen(true)}
              placeholder="Start typing a name…"
              className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 outline-none focus:border-accent"
            />
            {values.personId && (
              <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✓ selected
              </span>
            )}
            {(values.personId || values.personName) && (
              <button
                type="button"
                onClick={() => {
                  update("personId", null);
                  update("personName", "");
                  setPeople([]);
                }}
                className="text-xs text-white/60 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
          {peopleOpen && !values.personId && values.personName && (
            <div className="absolute z-30 mt-1 w-full bg-surface border border-border rounded-lg shadow-2xl overflow-hidden">
              {peopleLoading && (
                <div className="px-3 py-2 text-sm text-white/60">
                  Searching…
                </div>
              )}
              {!peopleLoading && people.length === 0 && (
                <div className="px-3 py-2 text-sm text-white/60">
                  No matches.
                </div>
              )}
              {people.map((p) => (
                <button
                  type="button"
                  key={p.personId}
                  onClick={() => {
                    update("personId", p.personId);
                    update("personName", p.name);
                    setPeopleOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-surface2"
                >
                  {p.profileUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.profileUrl}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-surface2 border border-border" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm">{p.name}</div>
                    <div className="text-xs text-white/50 line-clamp-1">
                      {p.knownForDepartment ?? "—"}
                      {p.knownForTitles.length > 0
                        ? ` · ${p.knownForTitles.join(", ")}`
                        : ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Media type */}
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-white/50">
            Type
          </span>
          <select
            value={values.mediaType}
            onChange={(e) =>
              update("mediaType", e.target.value as MediaType | "both")
            }
            className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 outline-none focus:border-accent"
          >
            <option value="both">Movies & TV</option>
            <option value="movie">Movies only</option>
            <option value="tv">TV series only</option>
          </select>
        </label>

        {/* Sort by */}
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-white/50">
            Sort by
          </span>
          <select
            value={values.sortBy}
            onChange={(e) => update("sortBy", e.target.value as SortKey)}
            className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 outline-none focus:border-accent"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {/* Country */}
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-white/50">
            Country (for provider filter)
          </span>
          <select
            value={values.country}
            onChange={(e) => update("country", e.target.value)}
            className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 outline-none focus:border-accent"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label} ({c.code})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="bg-accent text-bg font-semibold px-5 py-2 rounded-lg hover:bg-accent/90"
        >
          Search
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="text-sm text-white/60 hover:text-white"
        >
          Reset filters
        </button>
      </div>
    </form>
  );
}
