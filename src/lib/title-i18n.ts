// Localized copy + URL construction for the title pages (movie/tv), shared by
// metadata generation, the page body, the availability island, and the sitemap.
// One source of truth so English/Arabic and base/per-country variants never
// drift. Plot overviews come from TMDb (English); everything else here is
// authored per-locale so Arabic pages carry genuine Arabic content, not a
// name-substituted English shell.

import { formatCountryList, withArticle, type CountryInfo } from "@/lib/site";
import type { MediaType } from "@/types";

export type Locale = "en" | "ar";

// Canonical path for a title page. Centralised so every caller builds the exact
// same URL: `/movie/27205`, `/movie/27205/egypt`, `/ar/tv/1399`, etc.
export function titlePath(
  mediaType: MediaType,
  tmdbId: number | string,
  opts: { country?: CountryInfo; locale?: Locale } = {}
): string {
  const kind = mediaType === "tv" ? "tv" : "movie";
  const prefix = opts.locale === "ar" ? "/ar" : "";
  const suffix = opts.country ? `/${opts.country.slug}` : "";
  return `${prefix}/${kind}/${tmdbId}${suffix}`;
}

// The <title> text (before the "| ReelSeek" template is appended).
export function titleMetaTitle(opts: {
  title: string;
  year: string | null;
  country?: CountryInfo;
  locale: Locale;
}): string {
  const { title, year, country, locale } = opts;
  const yr = year ? ` (${year})` : "";
  if (locale === "ar") {
    return country
      ? `أين تشاهد ${title} في ${country.nameAr}${yr}`
      : `أين تشاهد ${title}${yr}`;
  }
  return country
    ? `Where to Watch ${title} in ${withArticle(country)}${yr}`
    : `Where to Watch ${title}${yr}`;
}

// Meta description — always streaming-framed (never the bare plot synopsis) so
// the page reads as relevant to "where to watch …" queries. Country variants
// name the single market; base variants name the full country list.
export function titleMetaDescription(opts: {
  title: string;
  mediaType: MediaType;
  country?: CountryInfo;
  locale: Locale;
}): string {
  const { title, mediaType, country, locale } = opts;
  if (locale === "ar") {
    const kindAr = mediaType === "tv" ? "مسلسل" : "فيلم";
    if (country) {
      return `هل ${title} متاح للبث في ${country.nameAr}؟ اكتشف أين تشاهد ${kindAr} ${title} في ${country.nameAr} عبر نتفليكس وشاهد وOSN+ وأمازون برايم وغيرها — مع التقييمات وطاقم العمل وروابط المنصّات.`;
    }
    return `اكتشف أين تشاهد ${kindAr} ${title} عبر منصّات البث في ${formatCountryList(
      "all",
      true
    )} — مع التقييمات وطاقم العمل وروابط المنصّات المباشرة.`;
  }
  const kindEn = mediaType === "tv" ? "TV show" : "movie";
  if (country) {
    return `Is ${title} streaming in ${withArticle(
      country
    )}? See where to watch the ${kindEn} ${title} in ${withArticle(
      country
    )} — across Netflix, Shahid, OSN+, Prime Video and more, with ratings, cast, and provider links.`;
  }
  return `Find where to stream the ${kindEn} ${title} — live availability across ${formatCountryList()}, with ratings, cast, and direct links to each provider.`;
}

// A short, genuinely localized intro paragraph rendered at the top of a
// per-country page's availability section. Gives each {title}×{country} page
// unique body text so it isn't a thin duplicate of the base page.
export function countryIntro(opts: {
  title: string;
  country: CountryInfo;
  mediaType: MediaType;
  locale: Locale;
}): string {
  const { title, country, mediaType, locale } = opts;
  if (locale === "ar") {
    const kindAr = mediaType === "tv" ? "المسلسل" : "الفيلم";
    return `فيما يلي منصّات البث التي تعرض ${kindAr} «${title}» في ${country.nameAr} حاليًا، بالإضافة إلى نوع التوفّر (اشتراك أو شراء أو إيجار) ورابط مباشر لكل منصّة. تتغيّر التراخيص من دولة لأخرى، لذا قد يختلف التوفّر في ${country.nameAr} عن الأسواق الأخرى.`;
  }
  const kindEn = mediaType === "tv" ? "TV show" : "movie";
  return `Below are the streaming services currently carrying the ${kindEn} “${title}” in ${withArticle(
    country
  )}, along with how each offers it (subscription, buy, or rent) and a direct link. Licensing differs by market, so availability in ${withArticle(
    country
  )} can differ from other countries.`;
}

// UI chrome strings for the page body and availability island.
export function titleStrings(locale: Locale) {
  if (locale === "ar") {
    return {
      movie: "فيلم",
      tvSeries: "مسلسل",
      topCast: "أبرز طاقم العمل",
      whereToWatch: "أين تشاهد",
      country: "الدولة",
      home: "الرئيسية",
      movies: "الأفلام",
      tvShows: "المسلسلات",
      noGenres: "لا تصنيفات",
      noDescription: "لا يوجد وصف متاح.",
      releaseUnknown: "تاريخ الإصدار غير معروف",
      loadError: "تعذّر تحميل بيانات التوفّر.",
      notAvailableIn: (c: string) =>
        `غير متاح حاليًا على المنصّات المدعومة في ${c}.`,
      availabilityNote:
        "قد تتغيّر مواعيد التوفّر مع تبدّل التراخيص — تأكّد من صفحة المنصّة قبل الاشتراك. آخر تحقق:",
      byCountryHeading: (title: string) => `أين تشاهد ${title} حسب الدولة`,
      minPerEp: "دقيقة / حلقة",
      min: "دقيقة",
      seasonWord: (n: number) => `${n} موسم`,
      episodesWord: "حلقة",
      dateLocale: "ar-EG",
      theaters: {
        now: (c: string) => `في دور العرض الآن في ${c}`,
        upcoming: (c: string) => `قريبًا في دور العرض في ${c}`,
        released: "تاريخ العرض",
        opens: "يبدأ العرض",
        rated: "التصنيف",
        findShowtimes: "ابحث عن مواعيد العروض والتذاكر"
      }
    } as const;
  }
  return {
    movie: "MOVIE",
    tvSeries: "TV SERIES",
    topCast: "Top cast",
    whereToWatch: "Where to watch",
    country: "Country",
    home: "Home",
    movies: "Movies",
    tvShows: "TV shows",
    noGenres: "No genres",
    noDescription: "No description available.",
    releaseUnknown: "Release date unknown",
    loadError: "Streaming availability could not be loaded.",
    notAvailableIn: (c: string) =>
      `Not currently available on the supported providers in ${c}.`,
    availabilityNote:
      "Availability can change as licenses rotate — confirm on the provider’s page before subscribing. Last checked:",
    byCountryHeading: (title: string) => `Where to watch ${title} by country`,
    minPerEp: "min / ep",
    min: "min",
    seasonWord: (n: number) => `${n} season${n === 1 ? "" : "s"}`,
    episodesWord: "episodes",
    dateLocale: "en-GB",
    theaters: {
      now: (c: string) => `In theaters now in ${c}`,
      upcoming: (c: string) => `Coming to cinemas in ${c}`,
      released: "Released",
      opens: "Opens",
      rated: "Rated",
      findShowtimes: "Find showtimes & tickets"
    }
  } as const;
}
