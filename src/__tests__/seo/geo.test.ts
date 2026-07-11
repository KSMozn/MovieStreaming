import { resolveCountry } from "@/lib/geo";
import { isSupportedCountry, site, formatCountryList } from "@/lib/site";

describe("resolveCountry (geo default + explicit choice)", () => {
  test("explicit supported choice always wins", () => {
    expect(resolveCountry("US", "EG")).toBe("US");
    expect(resolveCountry("gb", null)).toBe("GB"); // case-insensitive
  });

  test("falls back to detected country when no explicit choice", () => {
    expect(resolveCountry(null, "CA")).toBe("CA");
    expect(resolveCountry(undefined, "AE")).toBe("AE");
  });

  test("unsupported values fall through to default EG", () => {
    expect(resolveCountry("FR", "DE")).toBe("EG"); // neither supported
    expect(resolveCountry(null, null)).toBe("EG"); // geo header absent (proxy off)
    expect(resolveCountry("XX", "US")).toBe("US"); // bad explicit, good geo
  });

  test("detected but unsupported country does not leak", () => {
    // A visitor in France sees the default market, never French data.
    expect(resolveCountry(null, "FR")).toBe("EG");
  });
});

describe("supported countries", () => {
  test("includes the three MENA plus the three international markets", () => {
    const codes = site.countries.map((c) => c.code);
    expect(codes).toEqual(["EG", "SA", "AE", "US", "GB", "CA"]);
  });

  test("isSupportedCountry is case-insensitive and rejects others", () => {
    expect(isSupportedCountry("us")).toBe(true);
    expect(isSupportedCountry("EG")).toBe(true);
    expect(isSupportedCountry("FR")).toBe(false);
    expect(isSupportedCountry(null)).toBe(false);
  });

  test("formatCountryList reads naturally with articles", () => {
    const all = formatCountryList();
    expect(all).toContain("Egypt");
    expect(all).toContain("the United States");
    expect(all).toContain("the United Kingdom");
    expect(all).toContain("and Canada");
    expect(formatCountryList("mena")).toBe(
      "Egypt, Saudi Arabia, and the United Arab Emirates"
    );
  });
});
