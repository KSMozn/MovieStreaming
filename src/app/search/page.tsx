import Link from "next/link";
import { headers } from "next/headers";
import {
  AdvancedSearchForm,
  type SearchFormValues
} from "@/components/AdvancedSearchForm";
import type { DiscoverResponse } from "@/app/api/discover/route";
import type { ProviderKey } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function getStr(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

function buildBaseUrl(): string {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function runSearch(
  searchParams: PageProps["searchParams"]
): Promise<DiscoverResponse | null> {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    const s = getStr(v);
    if (s) sp.set(k, s);
  }
  // Don't fire a request if no filters at all
  if (sp.toString() === "") return null;
  const url = `${buildBaseUrl()}/api/discover?${sp.toString()}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as DiscoverResponse;
  } catch {
    return null;
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const initial: SearchFormValues = {
    q: getStr(searchParams.q),
    year: getStr(searchParams.year),
    genres: getStr(searchParams.genres)
      .split(",")
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n) && n > 0),
    provider: (getStr(searchParams.provider) as ProviderKey | "") || "",
    voteGte: getStr(searchParams.voteGte),
    personId: getStr(searchParams.personId)
      ? Number(getStr(searchParams.personId))
      : null,
    personName: getStr(searchParams.personName),
    mediaType:
      (getStr(searchParams.mediaType) as "movie" | "tv" | "both") || "both",
    country: getStr(searchParams.country) || "EG"
  };

  const data = await runSearch(searchParams);

  // Build base query string (without `page`) for pagination links.
  const baseParams = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (k === "page") continue;
    const s = getStr(v);
    if (s) baseParams.set(k, s);
  }
  const baseQs = baseParams.toString();
  const currentPage = data?.page ?? 1;
  const totalPages = Math.min(data?.totalPages ?? 1, 500); // TMDb caps at 500
  const hrefForPage = (p: number) => {
    const sp = new URLSearchParams(baseQs);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/search?${qs}` : "/search";
  };

  // Compact page list: first, last, current ±2, with ellipses.
  function pageList(): Array<number | "…"> {
    const out: Array<number | "…"> = [];
    if (totalPages <= 1) return [];
    const around = new Set<number>([
      1,
      totalPages,
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2
    ]);
    const pages = Array.from(around)
      .filter((n) => n >= 1 && n <= totalPages)
      .sort((a, b) => a - b);
    let prev = 0;
    for (const p of pages) {
      if (p - prev > 1) out.push("…");
      out.push(p);
      prev = p;
    }
    return out;
  }
  const pages = pageList();

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold">Advanced search</h1>
        <Link
          href="/"
          className="text-sm text-white/60 hover:text-white"
        >
          ← Home
        </Link>
      </div>

      <AdvancedSearchForm initial={initial} />

      {data && (
        <section className="space-y-3">
          {data.warnings.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm rounded-lg px-3 py-2">
              {data.warnings.map((w, i) => (
                <div key={i}>⚠ {w}</div>
              ))}
            </div>
          )}
          <div className="text-sm text-white/60">
            {data.totalResults > 0
              ? `Page ${currentPage} of ${totalPages} · ${data.totalResults.toLocaleString()} total matches`
              : "No matches for these filters."}
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {data.results.map((r) => {
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
                      <span
                        className={`absolute top-1 left-1 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded ${
                          r.mediaType === "tv"
                            ? "bg-emerald-500/80 text-bg"
                            : "bg-sky-500/80 text-bg"
                        }`}
                      >
                        {r.mediaType === "tv" ? "TV" : "MOVIE"}
                      </span>
                      {typeof r.voteAverage === "number" && (
                        <span className="absolute top-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-bg/80 border border-border text-accent">
                          ★ {r.voteAverage}
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="text-xs line-clamp-2">{r.title}</div>
                      <div className="text-[10px] text-white/50">
                        {r.releaseYear ?? "—"}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {pages.length > 1 && (
            <nav
              aria-label="Search results pages"
              className="flex flex-wrap items-center justify-center gap-1 pt-4"
            >
              <Link
                href={hrefForPage(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage <= 1}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  currentPage <= 1
                    ? "border-border text-white/30 pointer-events-none"
                    : "border-border hover:border-accent hover:text-accent"
                }`}
              >
                ← Prev
              </Link>
              {pages.map((p, i) =>
                p === "…" ? (
                  <span
                    key={`e-${i}`}
                    className="px-2 py-1.5 text-white/40 text-sm"
                  >
                    …
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={hrefForPage(p)}
                    aria-current={p === currentPage ? "page" : undefined}
                    className={`px-3 py-1.5 rounded-lg border text-sm min-w-[2.5rem] text-center ${
                      p === currentPage
                        ? "bg-accent text-bg border-accent font-semibold"
                        : "border-border hover:border-accent hover:text-accent"
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}
              <Link
                href={hrefForPage(Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage >= totalPages}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  currentPage >= totalPages
                    ? "border-border text-white/30 pointer-events-none"
                    : "border-border hover:border-accent hover:text-accent"
                }`}
              >
                Next →
              </Link>
            </nav>
          )}
        </section>
      )}
    </div>
  );
}
