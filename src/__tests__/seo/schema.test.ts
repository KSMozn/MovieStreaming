import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  movieSchema,
  organizationSchema,
  personSchema,
  serializeJsonLd,
  softwareApplicationSchema,
  tvSeriesSchema,
  webSiteSchema
} from "@/lib/seo/schema";
import type { MovieDetailsDto, PersonDto } from "@/types";

const movie: MovieDetailsDto = {
  tmdbId: 27205,
  mediaType: "movie",
  imdbId: "tt1375666",
  title: "Inception",
  originalTitle: "Inception",
  overview: "A thief who steals corporate secrets…",
  posterUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
  backdropUrl: null,
  releaseDate: "2010-07-15",
  runtime: 148,
  numberOfSeasons: null,
  numberOfEpisodes: null,
  genres: ["Action", "Science Fiction"],
  imdbRating: 8.8,
  tmdbRating: 8.4,
  tmdbVotes: 34000,
  cast: [
    { personId: 6193, name: "Leonardo DiCaprio", character: "Cobb", profileUrl: null }
  ],
  trailer: null
};

describe("serializeJsonLd", () => {
  test("escapes script-breaking sequences while staying valid JSON", () => {
    const out = serializeJsonLd({ x: '</script><b>&"' });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(out).not.toContain("&");
    expect(JSON.parse(out)).toEqual({ x: '</script><b>&"' });
  });
});

describe("site-level schemas", () => {
  test("Organization has name, url, logo and stable @id", () => {
    const org = organizationSchema();
    expect(org["@type"]).toBe("Organization");
    expect(org.name).toBe("ReelSeek");
    expect(org.url).toBe("https://reelseek.co");
    expect(String(org.logo)).toContain("https://reelseek.co/brand/icons/");
  });

  test("WebSite references the organization", () => {
    const ws = webSiteSchema();
    expect(ws["@type"]).toBe("WebSite");
    expect(ws.publisher).toEqual({ "@id": "https://reelseek.co/#organization" });
  });

  test("SoftwareApplication carries no store URLs or fabricated ratings", () => {
    const app = softwareApplicationSchema();
    expect(app["@type"]).toBe("SoftwareApplication");
    expect(app).not.toHaveProperty("aggregateRating");
    expect(app).not.toHaveProperty("offers");
    expect(JSON.stringify(app)).not.toMatch(/apps\.apple|play\.google/);
  });
});

describe("content schemas", () => {
  test("Movie schema mirrors visible facts and omits aggregateRating", () => {
    const schema = movieSchema(movie);
    expect(schema["@type"]).toBe("Movie");
    expect(schema.name).toBe("Inception");
    expect(schema.url).toBe("https://reelseek.co/movie/27205");
    expect(schema.duration).toBe("PT148M");
    expect(schema.genre).toEqual(["Action", "Science Fiction"]);
    expect(schema).not.toHaveProperty("aggregateRating");
    expect(schema).not.toHaveProperty("review");
  });

  test("TVSeries schema includes seasons/episodes when present", () => {
    const schema = tvSeriesSchema({
      ...movie,
      tmdbId: 1399,
      mediaType: "tv",
      numberOfSeasons: 8,
      numberOfEpisodes: 73,
      runtime: null
    });
    expect(schema["@type"]).toBe("TVSeries");
    expect(schema.url).toBe("https://reelseek.co/tv/1399");
    expect(schema.numberOfSeasons).toBe(8);
    expect(schema.numberOfEpisodes).toBe(73);
  });

  test("Person schema validates dates and links IMDb via sameAs", () => {
    const person: PersonDto = {
      personId: 6193,
      name: "Leonardo DiCaprio",
      imdbId: "nm0000138",
      biography: "Actor.",
      birthday: "1974-11-11",
      deathday: null,
      placeOfBirth: "Los Angeles",
      knownForDepartment: "Acting",
      profileUrl: null,
      credits: []
    };
    const schema = personSchema(person);
    expect(schema.birthDate).toBe("1974-11-11");
    expect(schema.sameAs).toEqual(["https://www.imdb.com/name/nm0000138/"]);

    const invalid = personSchema({ ...person, birthday: "unknown", imdbId: null });
    expect(invalid).not.toHaveProperty("birthDate");
    expect(invalid).not.toHaveProperty("sameAs");
  });

  test("FAQ and Breadcrumb and Article schemas use canonical URLs", () => {
    const faq = faqSchema([{ question: "Q?", answer: "A." }]);
    expect(faq["@type"]).toBe("FAQPage");

    const crumbs = breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "FAQ", path: "/faq" }
    ]) as { itemListElement: { item: string; position: number }[] };
    expect(crumbs.itemListElement[1].item).toBe("https://reelseek.co/faq");
    expect(crumbs.itemListElement[1].position).toBe(2);

    const article = articleSchema({
      title: "T",
      description: "D",
      path: "/guides/x",
      datePublished: "2026-07-11",
      dateModified: "2026-07-11"
    });
    expect(article.mainEntityOfPage).toBe("https://reelseek.co/guides/x");
  });
});
