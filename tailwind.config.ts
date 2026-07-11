import type { Config } from "tailwindcss";

// Color values live in src/app/globals.css (:root ReelSeek brand tokens).
// Utility names are kept from the original theme so existing components
// pick up the official palette without a rewrite.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--brand-background)",
        surface: "var(--brand-surface)",
        surface2: "var(--brand-surface-elevated)",
        border: "var(--brand-border)",
        accent: "var(--brand-accent)",
        brand: {
          primary: "var(--brand-primary)",
          charcoal: "var(--brand-charcoal)",
          accent: "var(--brand-accent)",
          neutral: "var(--brand-neutral)"
        }
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Tahoma",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};
export default config;
