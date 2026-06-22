import type { ProviderKey } from "@/types";

export interface ProviderConfig {
  key: ProviderKey;
  name: string;
  logoUrl: string; // local /providers/*.svg path
  // Aliases used to match Watchmode source names or TMDb provider names (case-insensitive)
  aliases: string[];
  // Watchmode source IDs when known. See https://api.watchmode.com/docs/#sources
  watchmodeSourceIds?: number[];
  // TMDb watch-provider IDs (used for /discover?with_watch_providers=)
  tmdbProviderIds?: number[];
}

// Order is the display order in the UI.
export const PROVIDERS: ProviderConfig[] = [
  {
    key: "netflix",
    name: "Netflix",
    logoUrl: "/providers/netflix.svg",
    aliases: ["netflix"],
    watchmodeSourceIds: [203],
    tmdbProviderIds: [8]
  },
  {
    key: "osn",
    name: "OSN+",
    logoUrl: "/providers/osn.svg",
    aliases: ["osn", "osn+", "osn plus", "osn streaming"],
    tmdbProviderIds: [389, 305]
  },
  {
    key: "amazon_prime_video",
    name: "Amazon Prime Video",
    logoUrl: "/providers/prime.svg",
    aliases: [
      "amazon prime video",
      "amazon prime",
      "prime video",
      "amazon video"
    ],
    watchmodeSourceIds: [26, 387],
    tmdbProviderIds: [119, 9]
  },
  {
    key: "shahid",
    name: "Shahid",
    logoUrl: "/providers/shahid.svg",
    aliases: ["shahid", "shahid vip", "shahidvip"],
    tmdbProviderIds: [195]
  },
  {
    key: "watch_it",
    name: "Watch It",
    logoUrl: "/providers/watchit.svg",
    aliases: ["watch it", "watchit", "watch-it"],
    tmdbProviderIds: [432]
  },
  {
    key: "tod",
    name: "TOD",
    logoUrl: "/providers/tod.svg",
    aliases: ["tod", "tod tv", "bein tod", "bein", "bein connect"],
    tmdbProviderIds: [1854]
  },
  {
    key: "disney_plus",
    name: "Disney+",
    logoUrl: "/providers/disney_plus.svg",
    aliases: ["disney plus", "disney+", "disneyplus"],
    watchmodeSourceIds: [372],
    tmdbProviderIds: [337]
  },
  {
    key: "apple_tv_plus",
    name: "Apple TV+",
    logoUrl: "/providers/apple_tv_plus.svg",
    aliases: [
      "apple tv plus",
      "apple tv+",
      "apple tv",
      "appletv+",
      "itunes"
    ],
    watchmodeSourceIds: [371],
    tmdbProviderIds: [350, 2]
  }
];

export function findProviderByName(
  name: string | null | undefined
): ProviderConfig | null {
  if (!name) return null;
  const n = name.trim().toLowerCase();
  for (const p of PROVIDERS) {
    if (p.aliases.some((a) => n === a || n.includes(a))) return p;
  }
  return null;
}

export function findProviderBySourceId(id: number): ProviderConfig | null {
  for (const p of PROVIDERS) {
    if (p.watchmodeSourceIds?.includes(id)) return p;
  }
  return null;
}
