import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), "utf8");

describe("route-level SEO policies", () => {
  test("search page is noindex,follow with a stable canonical", () => {
    const page = read("src/app/search/page.tsx");
    expect(page).toContain("index: false");
    expect(page).toContain("follow: true");
    expect(page).toContain('canonical: "/search"');
  });

  test("movie, tv and person routes are server components with generateMetadata", () => {
    for (const path of [
      "src/app/movie/[tmdbId]/page.tsx",
      "src/app/tv/[tmdbId]/page.tsx",
      "src/app/person/[personId]/page.tsx"
    ]) {
      const page = read(path);
      expect(page).not.toContain('"use client"');
      expect(page).toContain("generateMetadata");
    }
  });

  test("homepage is server-rendered (no top-level use client)", () => {
    expect(read("src/app/page.tsx")).not.toContain('"use client"');
  });

  test("sitemap renders at request time (env vars absent during Cloud Build)", () => {
    // Build-time prerender would freeze an empty catalogue when TMDB_API_KEY
    // is unset in the build environment; force-dynamic runs it per-request.
    expect(read("src/app/sitemap.ts")).toContain('dynamic = "force-dynamic"');
  });

  test("required public routes exist", () => {
    for (const route of [
      "about",
      "how-it-works",
      "where-to-watch",
      "streaming-services",
      "supported-countries",
      "providers",
      "movies",
      "tv-shows",
      "guides",
      "faq",
      "data-sources",
      "press",
      "support",
      "privacy",
      "terms",
      "ar",
      "ar/faq",
      "ar/data-sources"
    ]) {
      expect(existsSync(join(root, `src/app/${route}/page.tsx`))).toBe(true);
    }
    for (const file of [
      "src/app/robots.ts",
      "src/app/sitemap.ts",
      "src/app/llms.txt/route.ts",
      "src/app/llms-full.txt/route.ts",
      "src/app/feed.xml/route.ts",
      "src/app/indexnow-key.txt/route.ts"
    ]) {
      expect(existsSync(join(root, file))).toBe(true);
    }
  });

  test("root layout sets metadataBase and lang/dir switching", () => {
    const layout = read("src/app/layout.tsx");
    expect(layout).toContain("metadataBase");
    expect(layout).toContain('"x-pathname"');
    expect(layout).toContain('dir={isArabic ? "rtl" : "ltr"}');
    expect(layout).toContain('lang={isArabic ? "ar" : "en"}');
  });
});
