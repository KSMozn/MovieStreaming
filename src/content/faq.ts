// Public FAQ content. The FAQ page renders exactly these questions and
// answers, and FAQPage JSON-LD is generated from the same array, so the
// structured data always matches the visible page.

import { publicFacts } from "@/content/publicFacts";

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is ReelSeek?",
    answer: publicFacts.expandedDescription
  },
  {
    question: "Does ReelSeek stream movies?",
    answer:
      "No. ReelSeek does not host, stream, or sell movies or TV episodes. It shows you where a title is legally available on third-party streaming services and links you to the provider."
  },
  {
    question: "Is ReelSeek a streaming service?",
    answer:
      "No. ReelSeek is a streaming-discovery service. You use it to decide what to watch and to find which streaming service carries a title in your country — the watching happens on the provider's own apps."
  },
  {
    question: "How does ReelSeek find streaming availability?",
    answer:
      "ReelSeek combines licensed data sources — TMDb for title metadata and provider mappings, Watchmode for supplemental availability, and OMDb for IMDb ratings — and normalizes them into a single per-country availability view."
  },
  {
    question: "Which countries does ReelSeek support?",
    answer: `ReelSeek currently supports ${publicFacts.supportedCountries.join(", ")}. You can switch country on any title page and in search filters.`
  },
  {
    question: "Which streaming services does ReelSeek check?",
    answer: `ReelSeek currently checks ${publicFacts.supportedProviders.join(", ")}.`
  },
  {
    question: "Is streaming availability the same in every country?",
    answer:
      "No. Licensing is negotiated per country, so the same title can be on different services — or unavailable — depending on where you are. That is exactly the problem ReelSeek solves: pick your country and see what applies to you."
  },
  {
    question: "Why does availability change?",
    answer:
      "Streaming licenses start and expire on schedules set by rights holders. Titles rotate on and off services regularly, which is why ReelSeek shows when data was last checked and recommends verifying with the provider before subscribing."
  },
  {
    question: "Does ReelSeek require an account?",
    answer:
      "No. There is no sign-up, no login, and no tracking profile. Features like the watchlist in the mobile apps are stored only on your device."
  },
  {
    question: "Is ReelSeek available on iPhone and Android?",
    answer:
      "Native iOS and Android apps are built and in pre-release. They are not yet published on the App Store or Google Play; this page will link to the listings when they go live."
  },
  {
    question: "How accurate is the availability information?",
    answer:
      "ReelSeek reflects what its data sources report and shows a last-checked timestamp. Because providers change catalogues frequently, data can occasionally lag; always confirm on the provider's page — one click away — before purchasing or subscribing."
  },
  {
    question:
      "Is ReelSeek affiliated with Netflix, Shahid, OSN+, TOD or other providers?",
    answer: publicFacts.nonAffiliation
  }
];
