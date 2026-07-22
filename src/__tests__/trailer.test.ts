import { pickTrailer, youtubeEmbedUrl, youtubeThumb } from "@/lib/trailer";
import type { TmdbVideo } from "@/lib/tmdbClient";

function v(p: Partial<TmdbVideo>): TmdbVideo {
  return {
    key: "k",
    site: "YouTube",
    type: "Trailer",
    official: true,
    name: "Trailer",
    ...p
  };
}

describe("pickTrailer", () => {
  test("returns null when there are no videos", () => {
    expect(pickTrailer(undefined)).toBeNull();
    expect(pickTrailer([])).toBeNull();
  });

  test("ignores non-YouTube sites", () => {
    expect(pickTrailer([v({ site: "Vimeo", key: "x" })])).toBeNull();
  });

  test("prefers an official Trailer over a Teaser", () => {
    const t = pickTrailer([
      v({ key: "teaser", type: "Teaser", official: true }),
      v({ key: "trailer", type: "Trailer", official: true })
    ]);
    expect(t?.key).toBe("trailer");
  });

  test("prefers official over unofficial of the same type", () => {
    const t = pickTrailer([
      v({ key: "unofficial", official: false }),
      v({ key: "official", official: true })
    ]);
    expect(t?.key).toBe("official");
  });

  test("rejects clips/featurettes (no real trailer)", () => {
    expect(
      pickTrailer([v({ type: "Featurette" }), v({ type: "Clip" })])
    ).toBeNull();
  });

  test("prefers the requested language, English as fallback", () => {
    const ar = pickTrailer(
      [
        v({ key: "en", iso_639_1: "en" }),
        v({ key: "ar", iso_639_1: "ar" })
      ],
      "ar"
    );
    expect(ar?.key).toBe("ar");
  });

  test("tie-breaks by most recent publish date", () => {
    const t = pickTrailer([
      v({ key: "old", published_at: "2020-01-01T00:00:00Z" }),
      v({ key: "new", published_at: "2026-01-01T00:00:00Z" })
    ]);
    expect(t?.key).toBe("new");
  });
});

describe("youtube url builders", () => {
  test("embed uses the no-cookie host and only autoplays when asked", () => {
    expect(youtubeEmbedUrl("abc")).toContain("youtube-nocookie.com/embed/abc");
    expect(youtubeEmbedUrl("abc")).not.toContain("autoplay");
    expect(youtubeEmbedUrl("abc", true)).toContain("autoplay=1");
  });
  test("thumbnail points at YouTube's image CDN", () => {
    expect(youtubeThumb("abc")).toBe("https://i.ytimg.com/vi/abc/hqdefault.jpg");
  });
});
