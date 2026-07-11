import { countryByCode, isSupportedCountry, site } from "@/lib/site";

// Resolves which country's availability to show, in priority order:
//   1. An explicit ?country= choice the visitor made (if supported)
//   2. Their detected country (Cloudflare's CF-IPCountry header, if supported)
//   3. The default market (Egypt)
// Unsupported values at any step fall through — we never show data for a
// country ReelSeek doesn't cover. Geo is dormant until Cloudflare proxying
// is enabled (the header is simply absent otherwise), so this degrades to
// "default EG for everyone" with no code change.
export function resolveCountry(
  explicit: string | null | undefined,
  geoHeader: string | null | undefined
): string {
  if (explicit && isSupportedCountry(explicit)) {
    return countryByCode(explicit)!.code;
  }
  if (geoHeader && isSupportedCountry(geoHeader)) {
    return countryByCode(geoHeader)!.code;
  }
  return site.defaultCountry;
}

export const GEO_HEADER = "cf-ipcountry";
