import { llmsFullTxt, llmsTxt } from "@/lib/seo/llms";
import { publicFacts } from "@/content/publicFacts";
import { PROVIDERS } from "@/lib/providers";
import { PROVIDER_CONTENT } from "@/content/providers";
import { COUNTRY_CONTENT } from "@/content/countries";
import { GUIDES, guideBySlug } from "@/content/guides";
import { AR_PAGES } from "@/content/ar";
import { LOCALIZED_PATHS } from "@/lib/seo/metadata";
import { validateIndexNowUrls } from "@/server/indexnow";
import { site } from "@/lib/site";

describe("llms.txt / llms-full.txt", () => {
  const txt = llmsTxt();
  const full = llmsFullTxt();

  test("contain only current branding", () => {
    for (const doc of [txt, full]) {
      expect(doc).toContain("ReelSeek");
      expect(doc).not.toMatch(/Streamly/);
      expect(doc).not.toMatch(/Movie ?Streaming/);
    }
  });

  test("state the non-hosting position and canonical domain", () => {
    expect(txt).toContain("does not host or stream video");
    expect(txt).toContain("https://reelseek.co");
    expect(full).toContain("does not host, stream, or sell");
  });

  test("list actual countries and providers from the facts source", () => {
    for (const country of publicFacts.supportedCountries) {
      expect(txt).toContain(country);
    }
    for (const provider of publicFacts.supportedProviders) {
      expect(txt).toContain(provider);
    }
    expect(full).toContain("Last reviewed: " + publicFacts.lastReviewed);
  });

  test("expose no secrets or internal infrastructure", () => {
    for (const doc of [txt, full]) {
      expect(doc).not.toMatch(/run\.app|API_KEY|cloud run/i);
    }
  });
});

describe("public facts consistency", () => {
  test("providers derive from production provider configuration", () => {
    expect(publicFacts.supportedProviders).toEqual(PROVIDERS.map((p) => p.name));
  });

  test("provider content covers every configured provider exactly once", () => {
    expect(PROVIDER_CONTENT.map((p) => p.key).sort()).toEqual(
      PROVIDERS.map((p) => p.key).sort()
    );
    expect(new Set(PROVIDER_CONTENT.map((p) => p.slug)).size).toBe(
      PROVIDER_CONTENT.length
    );
  });

  test("country content covers every supported country", () => {
    expect(COUNTRY_CONTENT.map((c) => c.slug).sort()).toEqual(
      site.countries.map((c) => c.slug).sort()
    );
  });

  test("country pages reference only existing providers and guides", () => {
    const providerSlugs = new Set(PROVIDER_CONTENT.map((p) => p.slug));
    for (const country of COUNTRY_CONTENT) {
      for (const slug of country.relatedProviderSlugs) {
        expect(providerSlugs.has(slug)).toBe(true);
      }
      for (const slug of country.relatedGuideSlugs) {
        expect(guideBySlug(slug)).toBeDefined();
      }
    }
  });

  test("guides have valid dates and unique slugs", () => {
    expect(new Set(GUIDES.map((g) => g.slug)).size).toBe(GUIDES.length);
    for (const guide of GUIDES) {
      expect(guide.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(guide.dateModified >= guide.datePublished).toBe(true);
    }
  });

  test("every hreflang pair has a real Arabic page and vice versa", () => {
    const arPaths = new Set(AR_PAGES.map((p) => p.path));
    for (const arPath of Object.values(LOCALIZED_PATHS)) {
      expect(arPaths.has(arPath)).toBe(true);
    }
    const pairedArPaths = new Set(Object.values(LOCALIZED_PATHS));
    for (const page of AR_PAGES) {
      expect(pairedArPaths.has(page.path)).toBe(true);
    }
  });
});

describe("IndexNow URL validation", () => {
  test("accepts only canonical-origin URLs", () => {
    const { valid, invalid } = validateIndexNowUrls([
      "https://reelseek.co/faq",
      "https://evil.example/faq",
      "https://movie-streaming-150176375922.europe-west1.run.app/",
      "not a url"
    ]);
    expect(valid).toEqual(["https://reelseek.co/faq"]);
    expect(invalid).toHaveLength(3);
  });
});
