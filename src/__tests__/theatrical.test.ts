import {
  computeTheatricalStatus,
  showtimesUrl,
  type CountryReleaseDates
} from "@/lib/theatrical";
import { countryBySlug } from "@/lib/site";

const NOW = new Date("2026-07-18T00:00:00.000Z");

function results(
  country: string,
  dates: { release_date: string; type: number; certification?: string }[]
): CountryReleaseDates[] {
  return [{ iso_3166_1: country, release_dates: dates }];
}

describe("computeTheatricalStatus", () => {
  test("wide theatrical release 3 weeks ago → now", () => {
    const s = computeTheatricalStatus(
      results("SA", [{ release_date: "2026-06-27T00:00:00Z", type: 3 }]),
      "SA",
      NOW
    );
    expect(s.state).toBe("now");
  });

  test("future theatrical date → upcoming", () => {
    const s = computeTheatricalStatus(
      results("AE", [{ release_date: "2026-08-15T00:00:00Z", type: 3 }]),
      "AE",
      NOW
    );
    expect(s).toMatchObject({ state: "upcoming", date: "2026-08-15T00:00:00Z" });
  });

  test("released beyond the window → none", () => {
    const s = computeTheatricalStatus(
      results("EG", [{ release_date: "2026-01-01T00:00:00Z", type: 3 }]),
      "EG",
      NOW
    );
    expect(s.state).toBe("none");
  });

  test("in-window but already on digital → none (left theaters)", () => {
    const s = computeTheatricalStatus(
      results("US", [
        { release_date: "2026-06-20T00:00:00Z", type: 3 },
        { release_date: "2026-07-10T00:00:00Z", type: 4 }
      ]),
      "US",
      NOW
    );
    expect(s.state).toBe("none");
  });

  test("only a digital release, no theatrical → none", () => {
    const s = computeTheatricalStatus(
      results("US", [{ release_date: "2026-07-01T00:00:00Z", type: 4 }]),
      "US",
      NOW
    );
    expect(s.state).toBe("none");
  });

  test("country not present in results → none", () => {
    const s = computeTheatricalStatus(
      results("US", [{ release_date: "2026-07-01T00:00:00Z", type: 3 }]),
      "SA",
      NOW
    );
    expect(s.state).toBe("none");
  });

  test("carries the certification when present", () => {
    const s = computeTheatricalStatus(
      results("US", [
        { release_date: "2026-07-01T00:00:00Z", type: 3, certification: "PG-13" }
      ]),
      "US",
      NOW
    );
    expect(s).toMatchObject({ state: "now", certification: "PG-13" });
  });
});

describe("showtimesUrl", () => {
  test("builds a country-scoped Google showtimes search", () => {
    const url = showtimesUrl("Inception", countryBySlug("saudi-arabia")!);
    expect(url).toContain("google.com/search");
    expect(decodeURIComponent(url)).toContain("Inception showtimes Saudi Arabia");
  });
});
