import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { brand } from "@/lib/brand";

const root = process.cwd();

function grepSrc(pattern: string): string {
  try {
    return execSync(
      `grep -rn "${pattern}" src/ public/ --include='*.ts' --include='*.tsx' --include='*.css' --include='*.svg' --exclude-dir='__tests__' || true`,
      { cwd: root, encoding: "utf8" }
    ).trim();
  } catch {
    return "";
  }
}

describe("ReelSeek brand validation", () => {
  test("ReelSeek is the only public-facing brand name (no Streamly)", () => {
    expect(grepSrc("Streamly")).toBe("");
  });

  test("no public MovieStreaming branding in app code", () => {
    // The GitHub Pages privacy URL and the repository URL contain the legacy
    // repo name; both are intentionally retained infrastructure identifiers.
    const hits = grepSrc("MovieStreaming")
      .split("\n")
      .filter(Boolean)
      .filter((line) => !line.includes("ksmozn.github.io/MovieStreaming"))
      .filter((line) => !line.includes("github.com/KSMozn/MovieStreaming"));
    expect(hits).toEqual([]);
  });

  test("required brand assets exist", () => {
    for (const asset of [
      "public/brand/logo/reelseek-mark.svg",
      "public/brand/logo/reelseek-mark-dark.svg",
      "public/brand/logo/reelseek-mark-monochrome.svg",
      "public/brand/icons/favicon.svg",
      "public/brand/icons/favicon-32.png",
      "public/brand/icons/icon-192.png",
      "public/brand/icons/icon-512.png",
      "public/brand/icons/apple-touch-icon.png"
    ]) {
      expect(existsSync(join(root, asset))).toBe(true);
    }
  });

  test("metadata uses ReelSeek and the official theme color", () => {
    const layout = readFileSync(join(root, "src/app/layout.tsx"), "utf8");
    expect(layout).toContain("site.name");
    expect(layout).toContain("ReelSeek");
    expect(brand.name).toBe("ReelSeek");
    expect(brand.colors.primary.toUpperCase()).toBe("#0D1B2A");
    expect(brand.colors.accent.toUpperCase()).toBe("#F5A623");
    expect(brand.colors.charcoal.toUpperCase()).toBe("#222831");
    expect(brand.colors.neutral.toUpperCase()).toBe("#F7F8FA");
  });

  test("tailwind colors are centralized as CSS variables", () => {
    const tw = readFileSync(join(root, "tailwind.config.ts"), "utf8");
    expect(tw).toContain("var(--brand-background)");
    expect(tw).toContain("var(--brand-accent)");
    expect(tw).not.toMatch(/#(0b0d12|f5c518|141821|1c2230|262d3d)/i);
  });

  test("globals.css defines the official palette tokens", () => {
    const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
    expect(css).toContain("--brand-primary: #0d1b2a");
    expect(css).toContain("--brand-accent: #f5a623");
    expect(css).toContain("--brand-charcoal: #222831");
    expect(css).toContain("--brand-neutral: #f7f8fa");
  });

  test("obsolete Streamly favicon is removed", () => {
    expect(existsSync(join(root, "public/favicon.svg"))).toBe(false);
  });
});
