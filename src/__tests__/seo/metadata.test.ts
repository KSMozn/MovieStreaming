import { absoluteUrl, isIndexingEnabled, site } from "@/lib/site";
import {
  LOCALIZED_PATHS,
  languageAlternates,
  pageMetadata,
  truncateDescription
} from "@/lib/seo/metadata";

describe("site configuration", () => {
  test("origin is the canonical production domain (fallback)", () => {
    expect(site.origin).toBe("https://reelseek.co");
  });

  test("absoluteUrl applies one origin and no trailing slash", () => {
    expect(absoluteUrl("/")).toBe("https://reelseek.co");
    expect(absoluteUrl("/faq")).toBe("https://reelseek.co/faq");
    expect(absoluteUrl("faq")).toBe("https://reelseek.co/faq");
    expect(absoluteUrl("/faq/")).toBe("https://reelseek.co/faq");
  });

  test("indexing defaults to enabled and disables only on explicit false", () => {
    delete process.env.SEO_INDEXING_ENABLED;
    expect(isIndexingEnabled()).toBe(true);
    process.env.SEO_INDEXING_ENABLED = "true";
    expect(isIndexingEnabled()).toBe(true);
    process.env.SEO_INDEXING_ENABLED = "false";
    expect(isIndexingEnabled()).toBe(false);
    delete process.env.SEO_INDEXING_ENABLED;
  });
});

describe("pageMetadata", () => {
  test("sets self-referencing canonical and index,follow", () => {
    const md = pageMetadata({
      title: "T",
      description: "D",
      path: "/about"
    });
    expect(md.alternates?.canonical).toBe("https://reelseek.co/about");
    expect(md.robots).toEqual({ index: true, follow: true });
    expect((md.openGraph as { url?: string }).url).toBe(
      "https://reelseek.co/about"
    );
  });

  test("noindex pages keep follow", () => {
    const md = pageMetadata({
      title: "T",
      description: "D",
      path: "/search",
      noindex: true
    });
    expect(md.robots).toEqual({ index: false, follow: true });
  });

  test("preview mode (SEO_INDEXING_ENABLED=false) forces noindex", () => {
    process.env.SEO_INDEXING_ENABLED = "false";
    const md = pageMetadata({ title: "T", description: "D", path: "/about" });
    expect(md.robots).toEqual({ index: false, follow: true });
    delete process.env.SEO_INDEXING_ENABLED;
  });

  test("hreflang pairs exist for localized paths, in both directions", () => {
    for (const [en, ar] of Object.entries(LOCALIZED_PATHS)) {
      const fromEn = languageAlternates(en);
      const fromAr = languageAlternates(ar);
      expect(fromEn).toEqual({
        en: absoluteUrl(en),
        ar: absoluteUrl(ar),
        "x-default": absoluteUrl(en)
      });
      expect(fromAr).toEqual(fromEn);
    }
  });

  test("no hreflang for pages without an Arabic equivalent", () => {
    expect(languageAlternates("/press")).toBeUndefined();
    expect(languageAlternates("/movie/27205")).toBeUndefined();
  });
});

describe("truncateDescription", () => {
  test("passes short text through and truncates long text on a word", () => {
    expect(truncateDescription("short")).toBe("short");
    const long = "word ".repeat(80);
    const out = truncateDescription(long);
    expect(out.length).toBeLessThanOrEqual(158);
    expect(out.endsWith("…")).toBe(true);
  });
});
