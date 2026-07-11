// Public provider-page content, keyed to the production provider
// configuration in src/lib/providers.ts. Pages are generated from this one
// typed config — a provider gets a page only if it exists in PROVIDERS.

import { PROVIDERS, type ProviderConfig } from "@/lib/providers";
import type { ProviderKey } from "@/types";

export interface ProviderContent {
  key: ProviderKey;
  slug: string;
  /** Neutral, factual description — never provider marketing copy. */
  description: string;
  /** Availability types ReelSeek may show for this provider. */
  availabilityTypes: string;
  /** Honest coverage notes and limitations. */
  notes?: string;
}

export const PROVIDER_CONTENT: ProviderContent[] = [
  {
    key: "netflix",
    slug: "netflix",
    description:
      "Netflix is a global subscription streaming service with a large catalogue of movies, series, and originals. Its library differs significantly between countries, which is why a title available in one region may be missing in another.",
    availabilityTypes:
      "Subscription availability, with a direct link to the title's Netflix page when one is known."
  },
  {
    key: "osn",
    slug: "osn-plus",
    description:
      "OSN+ is a MENA-focused streaming service known for carrying HBO content and premium Western series and films in the region, alongside Arabic content.",
    availabilityTypes: "Subscription availability."
  },
  {
    key: "amazon_prime_video",
    slug: "prime-video",
    description:
      "Amazon Prime Video combines a subscription catalogue with a transactional store, so a title can be included with Prime, rentable, or purchasable — sometimes all three.",
    availabilityTypes:
      "Subscription, rent, and buy availability, labelled separately."
  },
  {
    key: "shahid",
    slug: "shahid",
    description:
      "Shahid, operated by MBC Group, is one of the largest Arabic streaming services, with a deep catalogue of Arabic series, films, and live TV alongside selected international content.",
    availabilityTypes: "Subscription availability."
  },
  {
    key: "watch_it",
    slug: "watch-it",
    description:
      "Watch It is an Egyptian streaming service focused on Egyptian films, classic and contemporary series, and exclusive local productions.",
    availabilityTypes: "Subscription availability.",
    notes:
      "Watch It is not present in the upstream TMDb watch-provider catalogue, so provider filtering for Watch It can be limited; ReelSeek surfaces a warning in search when this affects results."
  },
  {
    key: "tod",
    slug: "tod",
    description:
      "TOD is beIN's streaming service for the MENA region, combining entertainment content with live sport coverage.",
    availabilityTypes: "Subscription availability."
  },
  {
    key: "disney_plus",
    slug: "disney-plus",
    description:
      "Disney+ carries Disney, Pixar, Marvel, Star Wars, and National Geographic titles. Regional catalogues and launch status vary across the Middle East.",
    availabilityTypes: "Subscription availability."
  },
  {
    key: "apple_tv_plus",
    slug: "apple-tv",
    description:
      "Apple TV+ is Apple's original-content subscription service; the wider Apple TV store also rents and sells many titles that are not part of the subscription.",
    availabilityTypes:
      "Subscription availability for Apple TV+ originals, plus rent/buy availability from the Apple TV store where known."
  }
];

export function providerConfigFor(content: ProviderContent): ProviderConfig {
  const config = PROVIDERS.find((p) => p.key === content.key);
  if (!config) {
    throw new Error(`Provider content references unknown provider: ${content.key}`);
  }
  return config;
}

export function providerContentBySlug(slug: string): ProviderContent | undefined {
  return PROVIDER_CONTENT.find((p) => p.slug === slug);
}
