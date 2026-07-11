// Editorial guides. Each guide is original ReelSeek content with an honest
// publication history and an accountable editorial owner. Article JSON-LD,
// the /guides hub, the sitemap, and /feed.xml are all generated from this.

export interface GuideSection {
  heading: string;
  paragraphs: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: string;
  sections: GuideSection[];
  related: { label: string; href: string }[];
}

const EDITOR = "ReelSeek Editorial";

export const GUIDES: Guide[] = [
  {
    slug: "find-where-a-movie-is-streaming-in-egypt",
    title: "How to find where a movie is streaming in Egypt",
    description:
      "A practical walkthrough for checking which streaming service carries a movie in Egypt — across Netflix, Shahid, OSN+, Watch It, TOD, Prime Video and more.",
    datePublished: "2026-07-11",
    dateModified: "2026-07-11",
    author: EDITOR,
    sections: [
      {
        heading: "The problem: eight services, one movie",
        paragraphs: [
          "Egypt has one of the richest streaming markets in the region: global platforms like Netflix, Prime Video, Disney+ and Apple TV+ operate alongside regional services like Shahid, OSN+, TOD and the Egyptian service Watch It. That choice comes with a cost — when you want to watch one specific film, there is no single app that tells you where it lives. Opening eight apps to search the same title is the exact chore ReelSeek removes.",
          "Availability in Egypt is also not a copy of availability elsewhere. A film that streams on Netflix in the US may be licensed to OSN+ or Shahid in Egypt, or may not be streaming at all. Checking against your actual country is the only reliable approach."
        ]
      },
      {
        heading: "Step by step with ReelSeek",
        paragraphs: [
          "Type the movie's name into the search box on the ReelSeek homepage. Results appear as you type, with posters and years so you can tell remakes apart. Select the title to open its page.",
          "On the title page, make sure the country selector says EG. You'll see a \"Watch in EG\" section listing every service ReelSeek tracks, with the ones that carry the title highlighted, the kind of availability (subscription, rent, or buy), and a link straight to the title on that service.",
          "If the movie isn't available on any tracked service in Egypt, ReelSeek says so plainly. You can flip the selector to Saudi Arabia or the UAE to see whether it's a licensing gap specific to Egypt."
        ]
      },
      {
        heading: "Tips for Egyptian catalogues",
        paragraphs: [
          "Egyptian classics and local productions are strongest on Watch It and Shahid. Note that Watch It is missing from some international catalogue databases, so if you filter searches by that provider, coverage can be limited — ReelSeek shows a warning when this affects your results.",
          "Availability data changes as licenses rotate, so treat the last-checked timestamp on each title as part of the answer. When a decision matters — like starting a new subscription for one film — click through and confirm on the provider's own page. It's one tap from ReelSeek."
        ]
      }
    ],
    related: [
      { label: "Egypt on ReelSeek", href: "/countries/egypt" },
      { label: "Why availability changes by country", href: "/guides/why-streaming-availability-changes-by-country" },
      { label: "Watch It", href: "/providers/watch-it" }
    ]
  },
  {
    slug: "why-streaming-availability-changes-by-country",
    title: "Why streaming availability changes by country",
    description:
      "Licensing windows, regional rights and platform strategy: why the same movie streams on different services in Egypt, Saudi Arabia and the UAE — and how to check.",
    datePublished: "2026-07-11",
    dateModified: "2026-07-11",
    author: EDITOR,
    sections: [
      {
        heading: "Rights are sold per territory",
        paragraphs: [
          "Movies and series are licensed country by country. A studio may sell a film's streaming rights to Netflix in one market, to a regional service like OSN+ in another, and keep it for its own platform in a third. This is why 'is it on Netflix?' is an incomplete question — the honest question is 'is it on Netflix in my country, right now?'",
          "The Middle East adds its own layer: strong regional services such as Shahid, OSN+, TOD and Watch It actively license international and Arabic content for MENA territories, frequently outbidding global platforms for regional rights."
        ]
      },
      {
        heading: "Windows open and close",
        paragraphs: [
          "Licenses are time-boxed. A title can arrive on a service, stay for a year, and leave when the window expires — sometimes reappearing on a competitor a month later. Catalogue churn is normal, not an error, and it's why any availability answer includes an implicit 'as of today'.",
          "ReelSeek shows a last-checked timestamp with every availability answer and refreshes data continuously, but the definitive source is always the provider itself. Treat discovery tools as the map, not the territory."
        ]
      },
      {
        heading: "How to actually check",
        paragraphs: [
          "Search the title on ReelSeek, open its page, and set the country selector to where you are — Egypt, Saudi Arabia, or the UAE. The availability section recalculates for that market only. Flipping between countries is the fastest way to see how differently the same film is licensed across the region."
        ]
      }
    ],
    related: [
      { label: "Supported countries", href: "/supported-countries" },
      { label: "How ReelSeek works", href: "/how-it-works" },
      { label: "Data sources", href: "/data-sources" }
    ]
  },
  {
    slug: "compare-netflix-shahid-osn-tod-prime-video",
    title: "How to compare Netflix, Shahid, OSN+, TOD and Prime Video",
    description:
      "What each major streaming service in the Middle East is strongest at, and how to check which one actually has the titles you want before subscribing.",
    datePublished: "2026-07-11",
    dateModified: "2026-07-11",
    author: EDITOR,
    sections: [
      {
        heading: "Different services, different strengths",
        paragraphs: [
          "Netflix leads on volume and originals; its MENA catalogue differs from the US one but remains broad. Prime Video mixes a subscription library with a rental/purchase store, which makes it the fallback for recent releases that no subscription carries yet.",
          "Shahid is the deepest Arabic catalogue — MBC series, Arabic films and originals — while OSN+ is the regional home of HBO and premium Western prestige content. TOD couples entertainment with beIN's sport coverage, and Watch It specializes in Egyptian productions. Disney+ and Apple TV+ round out the market with franchise content and a smaller slate of high-budget originals respectively."
        ]
      },
      {
        heading: "Compare by the titles you actually watch",
        paragraphs: [
          "Rather than comparing subscription prices in the abstract, test services against your own watchlist. Search each title you care about on ReelSeek and note which service keeps appearing in the availability results for your country. Five searches usually reveal a clear pattern — and often that one subscription plus occasional rentals covers your needs.",
          "ReelSeek's advanced search can also flip the question around: filter by a provider and your country to browse what that service carries — by genre, year, rating or cast — before you commit to a subscription."
        ]
      },
      {
        heading: "Keep neutrality in mind",
        paragraphs: [
          "ReelSeek is not affiliated with any of these providers and doesn't earn commissions for sending you to one over another. The comparison that matters is the one against your own taste, in your own country, this month — which is exactly the data ReelSeek puts on one screen."
        ]
      }
    ],
    related: [
      { label: "All providers", href: "/providers" },
      { label: "Shahid", href: "/providers/shahid" },
      { label: "OSN+", href: "/providers/osn-plus" }
    ]
  },
  {
    slug: "find-a-movie-when-you-only-remember-part-of-the-title",
    title: "How to find a movie when you only remember part of its title",
    description:
      "Half-remembered titles, actors' faces, and 'that film from 2010' — practical search strategies using ReelSeek's instant search and filters.",
    datePublished: "2026-07-11",
    dateModified: "2026-07-11",
    author: EDITOR,
    sections: [
      {
        heading: "Start with the fragment you have",
        paragraphs: [
          "ReelSeek's search matches as you type, so a fragment is often enough: typing 'incep' surfaces Inception before you finish the word. Try the most distinctive word of the title rather than the first word — 'redemption' finds The Shawshank Redemption faster than 'the'.",
          "Posters and release years appear alongside every suggestion, which resolves the classic problem of remakes and same-name films: you can tell the 2019 film from the 1994 original at a glance without opening either."
        ]
      },
      {
        heading: "When the title is gone but the actor isn't",
        paragraphs: [
          "Open Advanced Search and use the cast filter: type the actor's name, pick them from the suggestions, and browse their filmography sorted by popularity or year. Every actor on a title page is also a link — opening a cast member shows their complete filmography, which is often the fastest route to 'that other movie they were in'.",
          "If you remember the era or the acclaim rather than a person, combine filters instead: a year, a genre, and a minimum rating narrows thousands of titles to a browsable page."
        ]
      },
      {
        heading: "The payoff",
        paragraphs: [
          "Because identification and availability live on the same page, the moment you recognize the film you were hunting, you also know where to watch it tonight in your country — no second search on another site."
        ]
      }
    ],
    related: [
      { label: "Advanced search", href: "/search" },
      { label: "Search by genre, actor, year and rating", href: "/guides/find-movies-by-genre-actor-year-rating" },
      { label: "How ReelSeek works", href: "/how-it-works" }
    ]
  },
  {
    slug: "find-movies-by-genre-actor-year-rating",
    title: "How to find movies by genre, actor, year, rating and runtime",
    description:
      "A tour of ReelSeek's advanced search: combining genre, cast, year, minimum rating, provider and country filters to answer 'what should we watch tonight?'",
    datePublished: "2026-07-11",
    dateModified: "2026-07-11",
    author: EDITOR,
    sections: [
      {
        heading: "Discovery without a title in mind",
        paragraphs: [
          "Sometimes the question isn't 'where is this movie?' but 'what's worth watching?' ReelSeek's advanced search is built for that mode: leave the title box empty and drive the catalogue entirely with filters. Every filter combination returns a ranked, poster-first grid you can paginate through.",
          "The available filters are: media type (movies, TV, or both), one or more genres, release year, minimum rating, a cast member, a streaming provider, your country, and sort order — most popular, best rated, newest, or most voted."
        ]
      },
      {
        heading: "Recipes that work",
        paragraphs: [
          "Friday night, low effort: Comedy + rating ≥ 7 + sort by most popular. Award-season catch-up: Drama + year 2025 + sort by rating. Kids are asleep: Thriller + your provider + your country, so everything in the grid is watchable right now without renting.",
          "The provider + country combination is the most underrated filter pair: it turns ReelSeek into a browsable catalogue of a single service's library in your market — useful both for using a subscription you already pay for and for evaluating one you're considering."
        ]
      },
      {
        heading: "From result to remote control",
        paragraphs: [
          "Every result opens a full title page with ratings, cast and the per-country availability panel, so the distance between 'that looks good' and pressing play on the right app is two taps. If a search comes up empty, loosen the rating floor first — it's the filter that eliminates the most titles."
        ]
      }
    ],
    related: [
      { label: "Advanced search", href: "/search" },
      { label: "Compare the major services", href: "/guides/compare-netflix-shahid-osn-tod-prime-video" },
      { label: "Movies hub", href: "/movies" }
    ]
  }
];

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
