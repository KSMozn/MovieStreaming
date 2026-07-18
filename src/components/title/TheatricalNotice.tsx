// "In theaters" notice, rendered above the streaming availability on a title
// page when TMDb has a current/upcoming theatrical date for the active market.
// Server component (no interactivity) so it's in the initial HTML for crawlers.

import {
  formatReleaseDate,
  showtimesUrl,
  type TheatricalStatus
} from "@/lib/theatrical";
import { titleStrings, type Locale } from "@/lib/title-i18n";
import type { CountryInfo } from "@/lib/site";

export function TheatricalNotice({
  status,
  country,
  title,
  locale
}: {
  status: TheatricalStatus;
  country: CountryInfo;
  title: string;
  locale: Locale;
}) {
  if (status.state === "none") return null;
  const t = titleStrings(locale).theaters;
  const name = locale === "ar" ? country.nameAr : country.name;
  const heading = status.state === "now" ? t.now(name) : t.upcoming(name);
  const dateLabel = status.state === "now" ? t.released : t.opens;

  return (
    <section className="rounded-xl border border-accent/30 bg-accent/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span aria-hidden className="text-lg leading-none">
            🎬
          </span>
          <h2 className="text-base font-semibold">{heading}</h2>
        </div>
        <p className="text-sm text-white/70">
          {dateLabel}: {formatReleaseDate(status.date, locale)}
          {status.certification ? (
            <span className="text-white/50">
              {" · "}
              {t.rated} {status.certification}
            </span>
          ) : null}
        </p>
      </div>
      <a
        href={showtimesUrl(title, country)}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="shrink-0 inline-flex items-center justify-center rounded-lg bg-accent text-brand-primary text-sm font-semibold px-4 py-2 hover:brightness-110 transition"
      >
        {t.findShowtimes}
      </a>
    </section>
  );
}
