import { buildAvailabilityFromSources } from "@/lib/watchmodeClient";
import { normalizeTmdbMovie } from "@/lib/tmdbClient";

describe("buildAvailabilityFromSources", () => {
  it("always emits all tracked provider cards in fixed order", () => {
    const out = buildAvailabilityFromSources([], "EG", "EG");
    expect(out.providers.map((p) => p.providerKey)).toEqual([
      "netflix",
      "osn",
      "amazon_prime_video",
      "shahid",
      "watch_it",
      "tod",
      "disney_plus",
      "apple_tv_plus"
    ]);
    expect(out.providers.every((p) => !p.available)).toBe(true);
    expect(out.country).toBe("EG");
    expect(typeof out.lastCheckedAt).toBe("string");
  });

  it("maps Netflix and Prime by source name + maps types correctly", () => {
    const out = buildAvailabilityFromSources(
      [
        {
          source_id: 999,
          name: "Netflix",
          type: "sub",
          region: "EG",
          web_url: "https://netflix.com/title/1"
        },
        {
          source_id: 26,
          name: "Amazon Prime Video",
          type: "rent",
          region: "EG",
          web_url: "https://primevideo.com/x"
        }
      ],
      "EG",
      "EG"
    );
    const nf = out.providers.find((p) => p.providerKey === "netflix")!;
    expect(nf.available).toBe(true);
    expect(nf.availabilityType).toBe("subscription");
    expect(nf.streamingUrl).toBe("https://netflix.com/title/1");

    const pr = out.providers.find((p) => p.providerKey === "amazon_prime_video")!;
    expect(pr.available).toBe(true);
    expect(pr.availabilityType).toBe("rent");
  });

  it("filters out sources from a different region", () => {
    const out = buildAvailabilityFromSources(
      [{ source_id: 203, name: "Netflix", type: "sub", region: "US" }],
      "EG",
      "EG"
    );
    expect(out.providers.find((p) => p.providerKey === "netflix")!.available).toBe(
      false
    );
  });

  it("preserves nullable fields when not provided", () => {
    const out = buildAvailabilityFromSources(
      [{ source_id: 203, name: "Netflix", type: "sub", region: "EG" }],
      "EG",
      "EG"
    );
    const nf = out.providers.find((p) => p.providerKey === "netflix")!;
    expect(nf.startsAt).toBeNull();
    expect(nf.endsAt).toBeNull();
    expect(nf.providerGenre).toBeNull();
  });
});

describe("normalizeTmdbMovie", () => {
  it("normalizes core fields and trims cast to 12", () => {
    const cast = Array.from({ length: 20 }, (_, i) => ({
      id: 1000 + i,
      name: `Actor ${i}`,
      character: `Char ${i}`,
      profile_path: i % 2 === 0 ? `/p${i}.jpg` : null
    }));
    const dto = normalizeTmdbMovie(
      {
        id: 1,
        imdb_id: "tt0000001",
        title: "T",
        original_title: "OT",
        overview: "ov",
        poster_path: "/poster.jpg",
        backdrop_path: null,
        release_date: "2024-05-01",
        runtime: 100,
        vote_average: 7.456,
        vote_count: 1234,
        genres: [
          { id: 1, name: "Drama" },
          { id: 2, name: "Thriller" }
        ],
        credits: { cast }
      },
      8.2
    );
    expect(dto.tmdbId).toBe(1);
    expect(dto.imdbRating).toBe(8.2);
    expect(dto.tmdbRating).toBe(7.5);
    expect(dto.tmdbVotes).toBe(1234);
    expect(dto.genres).toEqual(["Drama", "Thriller"]);
    expect(dto.cast).toHaveLength(12);
    expect(dto.posterUrl).toContain("image.tmdb.org");
    expect(dto.backdropUrl).toBeNull();
  });
});
