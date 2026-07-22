// Theatrical-release logic. Derived entirely from TMDb per-country release
// dates (type 2 = limited theatrical, 3 = wide theatrical, 4 = digital,
// 5 = physical) — no cinema-level/showtimes vendor. We only ever claim "in
// theaters" for a market when TMDb has a theatrical date for THAT country
// within the typical theatrical window and the title hasn't already hit
// digital; otherwise we say nothing rather than overclaim.

import type { CountryInfo } from "@/lib/site";
import type { Locale } from "@/lib/title-i18n";
import type { TheatricalDto } from "@/types";

// Shape of one country's block in TMDb's /movie/{id}/release_dates response.
export interface CountryReleaseDates {
  iso_3166_1: string;
  release_dates: {
    release_date: string;
    type: number;
    certification?: string;
  }[];
}

export type TheatricalStatus =
  | { state: "now"; date: string; certification: string | null }
  | { state: "upcoming"; date: string; certification: string | null }
  | { state: "none" };

// A theatrical run typically lasts a few weeks; 70 days is a generous ceiling
// before we stop calling a title "now in theaters".
export const THEATRICAL_WINDOW_DAYS = 70;

const THEATRICAL_TYPES = new Set([2, 3]);
const DIGITAL_OR_PHYSICAL_TYPES = new Set([4, 5]);

function earliest(
  dates: { release_date: string; certification?: string }[]
): { date: Date; raw: string; cert: string | null } | null {
  const parsed = dates
    .map((d) => ({
      date: new Date(d.release_date),
      raw: d.release_date,
      cert: d.certification && d.certification.trim() ? d.certification : null
    }))
    .filter((d) => !Number.isNaN(d.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  return parsed[0] ?? null;
}

export function computeTheatricalStatus(
  results: CountryReleaseDates[],
  country: string,
  now: Date
): TheatricalStatus {
  const entry = results.find(
    (r) => r.iso_3166_1.toUpperCase() === country.toUpperCase()
  );
  if (!entry) return { state: "none" };

  const theatrical = earliest(
    entry.release_dates.filter((d) => THEATRICAL_TYPES.has(d.type))
  );
  if (!theatrical) return { state: "none" };

  // Upcoming: theatrical date is in the future for this market.
  if (theatrical.date.getTime() > now.getTime()) {
    return {
      state: "upcoming",
      date: theatrical.raw,
      certification: theatrical.cert
    };
  }

  // Already released — only "now" if inside the window and not yet on digital
  // (a passed digital date signals the theatrical run is effectively over).
  const digital = earliest(
    entry.release_dates.filter((d) => DIGITAL_OR_PHYSICAL_TYPES.has(d.type))
  );
  const releasedDigitally =
    digital != null && digital.date.getTime() <= now.getTime();
  const daysSince =
    (now.getTime() - theatrical.date.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSince <= THEATRICAL_WINDOW_DAYS && !releasedDigitally) {
    return { state: "now", date: theatrical.raw, certification: theatrical.cert };
  }
  return { state: "none" };
}

// Flatten the internal discriminated union into the public API shape (easier
// for the mobile clients to decode than a tagged union).
export function toTheatricalDto(status: TheatricalStatus): TheatricalDto {
  if (status.state === "none") {
    return {
      status: "none",
      inTheaters: false,
      releaseDate: null,
      certification: null
    };
  }
  return {
    status: status.state,
    inTheaters: status.state === "now",
    releaseDate: status.date,
    certification: status.certification
  };
}

// Honest outbound link: a country-scoped showtimes search rather than a claim
// that a specific cinema is showing the title (which we can't verify without a
// paid showtimes feed). Opens the visitor's local results for real bookings.
export function showtimesUrl(title: string, country: CountryInfo): string {
  const q = `${title} showtimes ${country.name}`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

// Machine-formatted release date for display, localized.
export function formatReleaseDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
