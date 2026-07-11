import Link from "next/link";
import type { DiscoverResultDto } from "@/lib/tmdbClient";

// Server-rendered, crawlable rail of title links for the /movies and
// /tv-shows hubs. Plain anchors, lazy images, stable URLs.
export function TitleRail({
  heading,
  titles
}: {
  heading: string;
  titles: DiscoverResultDto[];
}) {
  if (titles.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{heading}</h2>
      <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {titles.map((t) => {
          const path = t.mediaType === "tv" ? "tv" : "movie";
          return (
            <li key={`${t.mediaType}-${t.tmdbId}`}>
              <Link
                href={`/${path}/${t.tmdbId}`}
                className="block bg-surface border border-border rounded-lg overflow-hidden hover:border-accent transition"
              >
                <div className="aspect-[2/3] bg-surface2 relative">
                  {t.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.posterUrl}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  {t.voteAverage != null && (
                    <span className="absolute bottom-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-bg/80 border border-border">
                      ★ {t.voteAverage.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <div className="text-xs font-medium line-clamp-2">{t.title}</div>
                  <div className="text-[11px] text-white/50">
                    {t.releaseYear ?? "—"}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
