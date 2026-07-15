import {
  countryIntro,
  titleMetaDescription,
  titleMetaTitle,
  titlePath
} from "@/lib/title-i18n";
import { countryBySlug } from "@/lib/site";

const sa = countryBySlug("saudi-arabia")!;
const us = countryBySlug("united-states")!;

describe("titlePath", () => {
  test("base paths", () => {
    expect(titlePath("movie", 27205)).toBe("/movie/27205");
    expect(titlePath("tv", 1399)).toBe("/tv/1399");
  });
  test("per-country paths use the slug", () => {
    expect(titlePath("movie", 27205, { country: sa })).toBe(
      "/movie/27205/saudi-arabia"
    );
  });
  test("arabic paths are /ar prefixed", () => {
    expect(titlePath("movie", 27205, { locale: "ar" })).toBe("/ar/movie/27205");
    expect(titlePath("tv", 1399, { country: us, locale: "ar" })).toBe(
      "/ar/tv/1399/united-states"
    );
  });
});

describe("titleMetaTitle", () => {
  test("english base and per-country", () => {
    expect(
      titleMetaTitle({ title: "Inception", year: "2010", locale: "en" })
    ).toBe("Where to Watch Inception (2010)");
    expect(
      titleMetaTitle({
        title: "Inception",
        year: "2010",
        country: sa,
        locale: "en"
      })
    ).toBe("Where to Watch Inception in Saudi Arabia (2010)");
    // "the" article for prefixed markets
    expect(
      titleMetaTitle({ title: "Dune", year: null, country: us, locale: "en" })
    ).toBe("Where to Watch Dune in the United States");
  });
  test("arabic per-country uses the Arabic country name", () => {
    expect(
      titleMetaTitle({
        title: "Inception",
        year: "2010",
        country: sa,
        locale: "ar"
      })
    ).toBe("أين تشاهد Inception في السعودية (2010)");
  });
});

describe("titleMetaDescription", () => {
  test("base description is streaming-framed, never a bare plot", () => {
    const d = titleMetaDescription({
      title: "Inception",
      mediaType: "movie",
      locale: "en"
    });
    expect(d).toMatch(/where to stream the movie Inception/i);
    expect(d).toContain("Egypt");
  });
  test("per-country description names the single market", () => {
    const d = titleMetaDescription({
      title: "Inception",
      mediaType: "movie",
      country: sa,
      locale: "en"
    });
    expect(d).toContain("Saudi Arabia");
    expect(d).toMatch(/streaming in Saudi Arabia/i);
  });
  test("arabic description is Arabic and names the market", () => {
    const d = titleMetaDescription({
      title: "Inception",
      mediaType: "tv",
      country: sa,
      locale: "ar"
    });
    expect(d).toContain("السعودية");
    expect(d).toContain("مسلسل");
  });
});

describe("countryIntro", () => {
  test("english intro mentions title and market", () => {
    const i = countryIntro({
      title: "Inception",
      country: us,
      mediaType: "movie",
      locale: "en"
    });
    expect(i).toContain("Inception");
    expect(i).toContain("the United States");
  });
  test("arabic intro is Arabic", () => {
    const i = countryIntro({
      title: "Inception",
      country: sa,
      mediaType: "movie",
      locale: "ar"
    });
    expect(i).toContain("السعودية");
  });
});
