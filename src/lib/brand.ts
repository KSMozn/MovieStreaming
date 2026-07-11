// ReelSeek brand — typed source of truth.
// Mirrors the CSS custom properties in src/app/globals.css and the official
// brand board (Deep Navy / Charcoal / Warm Amber / Light Neutral).

export const brand = {
  name: "ReelSeek",
  slogan: "Find what to watch. Know where to stream it.",
  headline: "Find what to watch.",
  message:
    "ReelSeek helps you discover movies and TV shows, compare where they are streaming in your country, and decide what to watch faster.",
  colors: {
    primary: "#0D1B2A", // Deep Navy
    charcoal: "#222831", // Charcoal
    accent: "#F5A623", // Warm Amber
    neutral: "#F7F8FA", // Light Neutral
    background: "#0D1B2A",
    surface: "#222831",
    surfaceElevated: "#2B3440", // derived
    border: "#364252", // derived
    textPrimary: "#F7F8FA",
    textSecondary: "rgba(247, 248, 250, 0.65)",
    textMuted: "rgba(247, 248, 250, 0.42)"
  }
} as const;
