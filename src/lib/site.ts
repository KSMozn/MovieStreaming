// Canonical site configuration — the single source of truth for public URLs,
// locales, and countries. Everything SEO-related derives from this module.

import { brand } from "@/lib/brand";

const FALLBACK_ORIGIN = "https://reelseek.co";

function normalizeOrigin(raw: string | undefined): string {
  if (!raw) return FALLBACK_ORIGIN;
  let candidate = raw.trim();
  if (!candidate) return FALLBACK_ORIGIN;
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return FALLBACK_ORIGIN;
  }
  // HTTPS-only in production; never derive canonicals from request headers.
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    return FALLBACK_ORIGIN;
  }
  return url.origin; // origin never carries a trailing slash or path
}

export const site = {
  name: brand.name,
  origin: normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL),
  defaultLocale: "en" as const,
  locales: ["en", "ar"] as const,
  defaultCountry: "EG" as const,
  // `region: "mena"` marks ReelSeek's home markets (where the regional
  // providers operate); "intl" markets are also supported but only the
  // global providers carry titles there. Order is the display order.
  countries: [
    { code: "EG", slug: "egypt", name: "Egypt", nameAr: "مصر", region: "mena" },
    { code: "SA", slug: "saudi-arabia", name: "Saudi Arabia", nameAr: "السعودية", region: "mena" },
    {
      code: "AE",
      slug: "united-arab-emirates",
      name: "United Arab Emirates",
      nameAr: "الإمارات العربية المتحدة",
      region: "mena"
    },
    { code: "US", slug: "united-states", name: "United States", nameAr: "الولايات المتحدة", region: "intl" },
    { code: "GB", slug: "united-kingdom", name: "United Kingdom", nameAr: "المملكة المتحدة", region: "intl" },
    { code: "CA", slug: "canada", name: "Canada", nameAr: "كندا", region: "intl" }
  ],
  logo: {
    mark: "/brand/logo/reelseek-mark.svg",
    markDark: "/brand/logo/reelseek-mark-dark.svg",
    icon512: "/brand/icons/icon-512.png"
  },
  // Store URLs stay null until real listings exist — never fabricate them.
  appStoreUrl: null as string | null,
  googlePlayUrl: null as string | null,
  socialProfiles: [] as string[], // only verified profiles belong here
  supportEmail: null as string | null // set when a public address is provided
} as const;

export type CountryInfo = (typeof site.countries)[number];

export function absoluteUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  // One trailing-slash policy: none (except the root itself).
  return clean === "/" ? site.origin : `${site.origin}${clean.replace(/\/+$/, "")}`;
}

export function countryBySlug(slug: string): CountryInfo | undefined {
  return site.countries.find((c) => c.slug === slug);
}

export function countryByCode(code: string): CountryInfo | undefined {
  return site.countries.find((c) => c.code === code.toUpperCase());
}

export function isSupportedCountry(code: string | null | undefined): boolean {
  return !!code && site.countries.some((c) => c.code === code.toUpperCase());
}

export const menaCountries = site.countries.filter((c) => c.region === "mena");

// "Egypt, Saudi Arabia, the United Arab Emirates, the United States, the
// United Kingdom, and Canada" — keeps prose accurate as the list grows.
// Codes with a definite article read naturally ("the UK").
const THE_PREFIXED = new Set(["AE", "US", "GB"]);

// "the United States" / "the UAE" / "Egypt" — natural article for prose.
export function withArticle(country: CountryInfo): string {
  return THE_PREFIXED.has(country.code) ? `the ${country.name}` : country.name;
}

export function formatCountryList(
  which: "all" | "mena" = "all",
  useAr = false
): string {
  const list = which === "mena" ? menaCountries : site.countries;
  const names = list.map((c) => {
    const name = useAr ? c.nameAr : c.name;
    return !useAr && THE_PREFIXED.has(c.code) ? `the ${name}` : name;
  });
  if (names.length <= 1) return names.join("");
  const sep = useAr ? "، " : ", ";
  const and = useAr ? " و" : ", and ";
  return names.slice(0, -1).join(sep) + and + names[names.length - 1];
}

// Indexing is ON unless explicitly disabled (preview/staging deployments set
// SEO_INDEXING_ENABLED=false). Defaulting to enabled prevents accidentally
// shipping production with indexing off.
export function isIndexingEnabled(): boolean {
  return process.env.SEO_INDEXING_ENABLED !== "false";
}
