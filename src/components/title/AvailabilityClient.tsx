"use client";

// Availability island. The server renders the correct market's data; the
// country <select> now navigates to the indexable per-country URL
// (/movie/[id]/[country]) instead of refetching under a ?country= param, so
// every market a visitor can pick is a real, crawlable page.

import { useRouter } from "next/navigation";
import { ProviderCard } from "@/components/ProviderCard";
import { countryByCode, site } from "@/lib/site";
import { titlePath, titleStrings, type Locale } from "@/lib/title-i18n";
import type { AvailabilityDto, MediaType } from "@/types";

export function AvailabilityClient({
  tmdbId,
  mediaType,
  country,
  availability,
  locale = "en",
  heading
}: {
  tmdbId: number;
  mediaType: MediaType;
  /** Current market (ISO code, e.g. "EG"). */
  country: string;
  availability: AvailabilityDto | null;
  locale?: Locale;
  heading: string;
}) {
  const router = useRouter();
  const t = titleStrings(locale);
  const currentName =
    countryByCode(availability?.country ?? country)?.[
      locale === "ar" ? "nameAr" : "name"
    ] ?? (availability?.country ?? country);

  function onChange(code: string) {
    const c = countryByCode(code);
    if (!c) return;
    router.push(titlePath(mediaType, tmdbId, { country: c, locale }));
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-lg font-semibold">{heading}</h2>
        <label className="text-xs flex items-center gap-2">
          <span className="text-white/50">{t.country}</span>
          <select
            value={countryByCode(country)?.code ?? country}
            onChange={(e) => onChange(e.target.value)}
            className="bg-surface border border-border rounded-lg px-2 py-1.5"
          >
            {site.countries.map((c) => (
              <option key={c.code} value={c.code}>
                {locale === "ar" ? c.nameAr : c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!availability ? (
        <div className="bg-surface border border-border rounded-xl p-6 text-sm text-white/60">
          {t.loadError}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availability.providers.map((p) => (
              <ProviderCard key={p.providerKey} p={p} />
            ))}
          </div>
          {availability.providers.every((p) => !p.available) && (
            <p className="text-sm text-white/50 mt-4">
              {t.notAvailableIn(currentName)}
            </p>
          )}
          <p className="text-xs text-white/40 mt-4">
            {t.availabilityNote}{" "}
            {new Date(availability.lastCheckedAt).toLocaleDateString(
              t.dateLocale,
              { year: "numeric", month: "short", day: "numeric" }
            )}
            .
          </p>
        </>
      )}
    </section>
  );
}
