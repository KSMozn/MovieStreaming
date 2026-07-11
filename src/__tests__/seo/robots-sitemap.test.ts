import robots from "@/app/robots";
import { PROVIDER_CONTENT } from "@/content/providers";
import { GUIDES } from "@/content/guides";
import { site } from "@/lib/site";

jest.mock("@/lib/popularIndex", () => ({
  getPopularIndex: jest.fn().mockResolvedValue([
    { tmdbId: 27205, mediaType: "movie", title: "Inception", releaseYear: "2010", posterUrl: null },
    { tmdbId: 1399, mediaType: "tv", title: "Game of Thrones", releaseYear: "2011", posterUrl: null }
  ])
}));

// Imported after the mock so the sitemap uses the fixture catalogue.
import sitemap from "@/app/sitemap";

afterEach(() => {
  delete process.env.SEO_INDEXING_ENABLED;
});

describe("robots.txt", () => {
  test("references the absolute sitemap and disallows internal APIs", () => {
    const out = robots();
    expect(out.sitemap).toBe("https://reelseek.co/sitemap.xml");
    const rules = Array.isArray(out.rules) ? out.rules : [out.rules];
    for (const rule of rules) {
      expect(rule?.disallow).toContain("/api/");
      // /search must stay fetchable so its noindex directive is visible.
      expect(JSON.stringify(rule?.disallow)).not.toContain("/search");
      // public facts endpoint stays crawlable
      expect(rule?.allow).toContain("/api/public/");
    }
  });

  test("explicitly configures the documented AI crawlers", () => {
    const out = robots();
    const agents = (Array.isArray(out.rules) ? out.rules : [out.rules]).map(
      (r) => r?.userAgent
    );
    for (const ua of [
      "Googlebot",
      "Bingbot",
      "OAI-SearchBot",
      "GPTBot",
      "Claude-SearchBot",
      "ClaudeBot"
    ]) {
      expect(agents).toContain(ua);
    }
  });

  test("preview mode blocks everything and drops the sitemap", () => {
    process.env.SEO_INDEXING_ENABLED = "false";
    const out = robots();
    const rules = Array.isArray(out.rules) ? out.rules : [out.rules];
    expect(rules).toHaveLength(1);
    expect(rules[0]?.disallow).toBe("/");
    expect(out.sitemap).toBeUndefined();
  });
});

describe("sitemap.xml", () => {
  test("includes static, country, provider, guide, Arabic and catalogue URLs", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain("https://reelseek.co");
    expect(urls).toContain("https://reelseek.co/faq");
    for (const c of site.countries) {
      expect(urls).toContain(`https://reelseek.co/countries/${c.slug}`);
    }
    for (const p of PROVIDER_CONTENT) {
      expect(urls).toContain(`https://reelseek.co/providers/${p.slug}`);
    }
    for (const g of GUIDES) {
      expect(urls).toContain(`https://reelseek.co/guides/${g.slug}`);
    }
    expect(urls).toContain("https://reelseek.co/ar");
    expect(urls).toContain("https://reelseek.co/ar/faq");
    expect(urls).toContain("https://reelseek.co/movie/27205");
    expect(urls).toContain("https://reelseek.co/tv/1399");
  });

  test("never includes search, API, or off-origin URLs, and has no duplicates", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    for (const url of urls) {
      expect(url.startsWith("https://reelseek.co")).toBe(true);
      expect(url).not.toMatch(/\/search/);
      expect(url).not.toMatch(/\/api\//);
      expect(url).not.toContain("?");
      expect(url).not.toContain("run.app");
    }
    expect(new Set(urls).size).toBe(urls.length);
  });

  test("preview mode returns an empty sitemap", async () => {
    process.env.SEO_INDEXING_ENABLED = "false";
    expect(await sitemap()).toEqual([]);
  });
});
