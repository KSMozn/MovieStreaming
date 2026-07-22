import { fetchJson } from "./http";
import type { CountryReleaseDates } from "@/lib/theatrical";
import type {
  CastMemberDto,
  MediaType,
  MovieDetailsDto,
  PersonCreditDto,
  PersonDto,
  SearchResultDto
} from "@/types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

function key(): string {
  const k = process.env.TMDB_API_KEY;
  if (!k) throw new Error("TMDB_API_KEY is not set");
  return k;
}

function img(path: string | null, size: "w185" | "w500" | "original"): string | null {
  return path ? `${IMG_BASE}/${size}${path}` : null;
}

/* ---------------- Search (multi: movies + TV) ---------------- */

interface TmdbMultiItem {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  release_date?: string | null;
  name?: string;
  first_air_date?: string | null;
  poster_path?: string | null;
}
interface TmdbMultiResponse {
  results: TmdbMultiItem[];
}

function multiToSearchDto(r: TmdbMultiItem): SearchResultDto | null {
  if (r.media_type !== "movie" && r.media_type !== "tv") return null;
  const title = r.title ?? r.name ?? "";
  if (!title) return null;
  const date = r.release_date ?? r.first_air_date ?? null;
  return {
    tmdbId: r.id,
    mediaType: r.media_type,
    title,
    releaseYear: date ? date.slice(0, 4) : null,
    posterUrl: img(r.poster_path ?? null, "w185")
  };
}

export async function tmdbSearch(
  query: string,
  limit = 10
): Promise<SearchResultDto[]> {
  if (!query.trim()) return [];
  const url = `${TMDB_BASE}/search/multi?api_key=${encodeURIComponent(
    key()
  )}&query=${encodeURIComponent(query)}&include_adult=false&page=1`;
  const data = await fetchJson<TmdbMultiResponse>(url, { revalidate: 60 });
  return data.results
    .map(multiToSearchDto)
    .filter((x): x is SearchResultDto => x !== null)
    .slice(0, limit);
}

/* ---------------- IMDb id lookup ---------------- */

export const IMDB_ID_RE = /^tt\d{7,10}$/i;

interface TmdbFindResponse {
  movie_results: Array<{
    id: number;
    title: string;
    release_date?: string | null;
    poster_path?: string | null;
  }>;
  tv_results: Array<{
    id: number;
    name: string;
    first_air_date?: string | null;
    poster_path?: string | null;
  }>;
}

export async function tmdbFindByImdb(imdbId: string): Promise<SearchResultDto[]> {
  const id = imdbId.trim().toLowerCase();
  if (!IMDB_ID_RE.test(id)) return [];
  const url = `${TMDB_BASE}/find/${encodeURIComponent(
    id
  )}?api_key=${encodeURIComponent(key())}&external_source=imdb_id`;
  const data = await fetchJson<TmdbFindResponse>(url, { revalidate: 60 * 60 });
  const movies: SearchResultDto[] = data.movie_results.map((r) => ({
    tmdbId: r.id,
    mediaType: "movie",
    title: r.title,
    releaseYear: r.release_date ? r.release_date.slice(0, 4) : null,
    posterUrl: img(r.poster_path ?? null, "w185")
  }));
  const tv: SearchResultDto[] = data.tv_results.map((r) => ({
    tmdbId: r.id,
    mediaType: "tv",
    title: r.name,
    releaseYear: r.first_air_date ? r.first_air_date.slice(0, 4) : null,
    posterUrl: img(r.poster_path ?? null, "w185")
  }));
  return [...movies, ...tv];
}

/* ---------------- Title details (movie or tv) ---------------- */

interface TmdbGenre {
  id: number;
  name: string;
}
interface TmdbCastMember {
  id: number;
  name: string;
  character?: string | null;
  profile_path?: string | null;
  order?: number;
}
interface TmdbCredits {
  cast: TmdbCastMember[];
}

interface TmdbExternalIds {
  imdb_id?: string | null;
}

export interface TmdbTitle {
  id: number;
  // movie
  title?: string;
  original_title?: string;
  release_date?: string | null;
  runtime?: number | null;
  imdb_id?: string | null;
  // tv
  name?: string;
  original_name?: string;
  first_air_date?: string | null;
  episode_run_time?: number[] | null;
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
  external_ids?: TmdbExternalIds;
  // shared
  overview: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number | null;
  vote_count?: number | null;
  genres: TmdbGenre[];
  credits?: TmdbCredits;
  videos?: { results?: TmdbVideo[] };
}

// A trailer/teaser entry from TMDb's /videos data (studio-curated, hosted on
// YouTube/Vimeo). See src/lib/trailer.ts for selection.
export interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  official: boolean;
  name: string;
  size?: number;
  iso_639_1?: string;
  published_at?: string;
}

export async function tmdbGetTitle(
  tmdbId: number,
  mediaType: MediaType
): Promise<TmdbTitle> {
  const url = `${TMDB_BASE}/${mediaType}/${tmdbId}?api_key=${encodeURIComponent(
    key()
  )}&append_to_response=credits,external_ids,videos`;
  return fetchJson<TmdbTitle>(url, { revalidate: 60 * 60 });
}

// Per-country theatrical/digital release dates (movies only). Powers the
// "in theaters now" notice. Shape mirrors src/lib/theatrical.ts.
interface TmdbReleaseDatesResponse {
  id: number;
  results: CountryReleaseDates[];
}

export async function tmdbGetReleaseDates(
  tmdbId: number
): Promise<TmdbReleaseDatesResponse> {
  const url = `${TMDB_BASE}/movie/${tmdbId}/release_dates?api_key=${encodeURIComponent(
    key()
  )}`;
  return fetchJson<TmdbReleaseDatesResponse>(url, { revalidate: 60 * 60 });
}

export function normalizeTmdbTitle(
  t: TmdbTitle,
  mediaType: MediaType,
  imdbRating: number | null
): MovieDetailsDto {
  const cast: CastMemberDto[] = (t.credits?.cast ?? [])
    .slice(0, 12)
    .map((c) => ({
      personId: c.id,
      name: c.name,
      character: c.character ?? null,
      profileUrl: img(c.profile_path ?? null, "w185")
    }));

  const isTv = mediaType === "tv";
  const title = (isTv ? t.name : t.title) ?? "";
  const original = (isTv ? t.original_name : t.original_title) ?? title;
  const releaseDate = (isTv ? t.first_air_date : t.release_date) || null;
  const runtime = isTv
    ? Array.isArray(t.episode_run_time) && t.episode_run_time.length > 0
      ? t.episode_run_time[0] ?? null
      : null
    : t.runtime ?? null;
  const imdbId = (isTv ? t.external_ids?.imdb_id : t.imdb_id) ?? null;

  return {
    tmdbId: t.id,
    mediaType,
    imdbId,
    title,
    originalTitle: original,
    overview: t.overview,
    posterUrl: img(t.poster_path ?? null, "w500"),
    backdropUrl: img(t.backdrop_path ?? null, "original"),
    releaseDate,
    runtime,
    numberOfSeasons: isTv ? t.number_of_seasons ?? null : null,
    numberOfEpisodes: isTv ? t.number_of_episodes ?? null : null,
    genres: t.genres.map((g) => g.name),
    imdbRating,
    tmdbRating:
      typeof t.vote_average === "number" && t.vote_average > 0
        ? Number(t.vote_average.toFixed(1))
        : null,
    tmdbVotes:
      typeof t.vote_count === "number" && t.vote_count > 0 ? t.vote_count : null,
    cast
  };
}

/* ---------------- Watch providers (TMDb / JustWatch) ---------------- */

export interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority?: number;
}

export interface TmdbWatchCountry {
  link?: string;
  flatrate?: TmdbProvider[];
  free?: TmdbProvider[];
  ads?: TmdbProvider[];
  rent?: TmdbProvider[];
  buy?: TmdbProvider[];
}

interface TmdbWatchResponse {
  id: number;
  results: Record<string, TmdbWatchCountry | undefined>;
}

export async function tmdbGetWatchProviders(
  tmdbId: number,
  mediaType: MediaType,
  country: string
): Promise<{ country: TmdbWatchCountry; link: string | null } | null> {
  const url = `${TMDB_BASE}/${mediaType}/${tmdbId}/watch/providers?api_key=${encodeURIComponent(
    key()
  )}`;
  try {
    const data = await fetchJson<TmdbWatchResponse>(url, { revalidate: 60 * 30 });
    const c = data.results[country.toUpperCase()];
    if (!c) return null;
    const fix = (arr?: TmdbProvider[]) =>
      arr?.map((p) => ({
        ...p,
        logo_path: p.logo_path ? `${IMG_BASE}/w185${p.logo_path}` : null
      }));
    return {
      country: {
        link: c.link,
        flatrate: fix(c.flatrate),
        free: fix(c.free),
        ads: fix(c.ads),
        rent: fix(c.rent),
        buy: fix(c.buy)
      },
      link: c.link ?? null
    };
  } catch {
    return null;
  }
}

/* ---------------- Back-compat re-exports ---------------- */

export const tmdbSearchMovies = tmdbSearch;

export function tmdbGetMovie(tmdbId: number) {
  return tmdbGetTitle(tmdbId, "movie");
}

export function normalizeTmdbMovie(t: TmdbTitle, imdbRating: number | null) {
  return normalizeTmdbTitle(t, "movie", imdbRating);
}

/* ---------------- Person details + filmography ---------------- */

interface TmdbPersonCombinedCredit {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  character?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  poster_path?: string | null;
  vote_average?: number | null;
  popularity?: number | null;
}

interface TmdbPersonResponse {
  id: number;
  name: string;
  imdb_id?: string | null;
  biography?: string;
  birthday?: string | null;
  deathday?: string | null;
  place_of_birth?: string | null;
  known_for_department?: string | null;
  profile_path?: string | null;
  combined_credits?: {
    cast?: TmdbPersonCombinedCredit[];
  };
}

export async function tmdbGetPerson(personId: number): Promise<PersonDto> {
  const url = `${TMDB_BASE}/person/${personId}?api_key=${encodeURIComponent(
    key()
  )}&append_to_response=combined_credits`;
  const data = await fetchJson<TmdbPersonResponse>(url, {
    revalidate: 60 * 60
  });

  const seen = new Set<string>();
  const credits: PersonCreditDto[] = (data.combined_credits?.cast ?? [])
    .filter((c) => c.media_type === "movie" || c.media_type === "tv")
    .map((c): PersonCreditDto => {
      const title = c.title ?? c.name ?? "";
      const date = c.release_date ?? c.first_air_date ?? null;
      return {
        tmdbId: c.id,
        mediaType: c.media_type,
        title,
        character: c.character ?? null,
        releaseDate: date,
        releaseYear: date ? date.slice(0, 4) : null,
        posterUrl: img(c.poster_path ?? null, "w185"),
        voteAverage:
          typeof c.vote_average === "number" && c.vote_average > 0
            ? Number(c.vote_average.toFixed(1))
            : null,
        popularity: c.popularity ?? 0
      };
    })
    .filter((c) => {
      if (!c.title) return false;
      const k = `${c.mediaType}-${c.tmdbId}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    // Newest first; undated credits go last.
    .sort((a, b) => {
      if (!a.releaseDate && !b.releaseDate) return b.popularity - a.popularity;
      if (!a.releaseDate) return 1;
      if (!b.releaseDate) return -1;
      return b.releaseDate.localeCompare(a.releaseDate);
    });

  return {
    personId: data.id,
    name: data.name,
    imdbId: data.imdb_id ?? null,
    biography: data.biography ?? "",
    birthday: data.birthday ?? null,
    deathday: data.deathday ?? null,
    placeOfBirth: data.place_of_birth ?? null,
    knownForDepartment: data.known_for_department ?? null,
    profileUrl: img(data.profile_path ?? null, "w500"),
    credits
  };
}

/* ---------------- Person search (autocomplete) ---------------- */

export interface PersonSearchResult {
  personId: number;
  name: string;
  profileUrl: string | null;
  knownForDepartment: string | null;
  knownForTitles: string[];
}

interface TmdbPersonSearchItem {
  id: number;
  name: string;
  profile_path?: string | null;
  known_for_department?: string | null;
  known_for?: Array<{ title?: string; name?: string }>;
}
interface TmdbPersonSearchResponse {
  results: TmdbPersonSearchItem[];
}

export async function tmdbSearchPerson(
  query: string,
  limit = 10
): Promise<PersonSearchResult[]> {
  if (!query.trim()) return [];
  const url = `${TMDB_BASE}/search/person?api_key=${encodeURIComponent(
    key()
  )}&query=${encodeURIComponent(query)}&include_adult=false&page=1`;
  const data = await fetchJson<TmdbPersonSearchResponse>(url, { revalidate: 60 });
  return data.results.slice(0, limit).map((p) => ({
    personId: p.id,
    name: p.name,
    profileUrl: img(p.profile_path ?? null, "w185"),
    knownForDepartment: p.known_for_department ?? null,
    knownForTitles: (p.known_for ?? [])
      .map((k) => k.title ?? k.name ?? "")
      .filter(Boolean)
      .slice(0, 3)
  }));
}

/* ---------------- Genres ---------------- */

export interface GenreDto {
  id: number;
  name: string;
}

interface TmdbGenreListResponse {
  genres: GenreDto[];
}

export async function tmdbGetGenres(
  mediaType: MediaType
): Promise<GenreDto[]> {
  const url = `${TMDB_BASE}/genre/${mediaType}/list?api_key=${encodeURIComponent(
    key()
  )}&language=en-US`;
  const data = await fetchJson<TmdbGenreListResponse>(url, {
    revalidate: 60 * 60 * 24
  });
  return data.genres;
}

/* ---------------- Discover ---------------- */

export interface DiscoverFilters {
  mediaType: MediaType;
  genreIds?: number[];
  year?: number | null;
  voteAverageGte?: number | null;
  voteCountGte?: number | null;
  withCastIds?: number[]; // movie only
  withPeopleIds?: number[]; // tv (any role)
  watchProviderIds?: number[];
  watchRegion?: string;
  page?: number;
  sortBy?: string;
}

interface TmdbDiscoverMovieItem {
  id: number;
  title: string;
  release_date?: string | null;
  poster_path?: string | null;
  vote_average?: number | null;
  vote_count?: number | null;
}
interface TmdbDiscoverTvItem {
  id: number;
  name: string;
  first_air_date?: string | null;
  poster_path?: string | null;
  vote_average?: number | null;
  vote_count?: number | null;
}
interface TmdbDiscoverResponse<T> {
  page: number;
  total_pages: number;
  total_results: number;
  results: T[];
}

export interface DiscoverResultDto extends SearchResultDto {
  voteAverage: number | null;
  voteCount: number | null;
}

export async function tmdbDiscover(
  f: DiscoverFilters
): Promise<{
  results: DiscoverResultDto[];
  page: number;
  totalPages: number;
  totalResults: number;
}> {
  const params = new URLSearchParams();
  params.set("api_key", key());
  params.set("language", "en-US");
  params.set("include_adult", "false");
  params.set("page", String(f.page ?? 1));
  params.set("sort_by", f.sortBy ?? "popularity.desc");
  if (f.genreIds && f.genreIds.length > 0)
    params.set("with_genres", f.genreIds.join("|"));
  if (typeof f.voteAverageGte === "number")
    params.set("vote_average.gte", String(f.voteAverageGte));
  if (typeof f.voteCountGte === "number")
    params.set("vote_count.gte", String(f.voteCountGte));
  if (f.watchProviderIds && f.watchProviderIds.length > 0) {
    params.set("with_watch_providers", f.watchProviderIds.join("|"));
    params.set("watch_region", (f.watchRegion ?? "US").toUpperCase());
  }
  if (f.mediaType === "movie") {
    if (f.year) params.set("primary_release_year", String(f.year));
    if (f.withCastIds && f.withCastIds.length > 0)
      params.set("with_cast", f.withCastIds.join(","));
    else if (f.withPeopleIds && f.withPeopleIds.length > 0)
      params.set("with_people", f.withPeopleIds.join(","));
  } else {
    if (f.year) params.set("first_air_date_year", String(f.year));
    if (f.withPeopleIds && f.withPeopleIds.length > 0)
      params.set("with_people", f.withPeopleIds.join(","));
    else if (f.withCastIds && f.withCastIds.length > 0)
      params.set("with_people", f.withCastIds.join(","));
  }
  const url = `${TMDB_BASE}/discover/${f.mediaType}?${params.toString()}`;
  if (f.mediaType === "movie") {
    const data = await fetchJson<TmdbDiscoverResponse<TmdbDiscoverMovieItem>>(
      url,
      { revalidate: 60 * 5 }
    );
    return {
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      results: data.results.map((r) => ({
        tmdbId: r.id,
        mediaType: "movie",
        title: r.title,
        releaseYear: r.release_date ? r.release_date.slice(0, 4) : null,
        posterUrl: img(r.poster_path ?? null, "w185"),
        voteAverage:
          typeof r.vote_average === "number" && r.vote_average > 0
            ? Number(r.vote_average.toFixed(1))
            : null,
        voteCount: r.vote_count ?? null
      }))
    };
  } else {
    const data = await fetchJson<TmdbDiscoverResponse<TmdbDiscoverTvItem>>(url, {
      revalidate: 60 * 5
    });
    return {
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      results: data.results.map((r) => ({
        tmdbId: r.id,
        mediaType: "tv",
        title: r.name,
        releaseYear: r.first_air_date ? r.first_air_date.slice(0, 4) : null,
        posterUrl: img(r.poster_path ?? null, "w185"),
        voteAverage:
          typeof r.vote_average === "number" && r.vote_average > 0
            ? Number(r.vote_average.toFixed(1))
            : null,
        voteCount: r.vote_count ?? null
      }))
    };
  }
}

/* ---------------- Search by name with year (movie + tv) ---------------- */

export async function tmdbSearchByName(
  query: string,
  mediaType: MediaType | "both",
  year?: number | null
): Promise<DiscoverResultDto[]> {
  const k = key();
  const out: DiscoverResultDto[] = [];
  const yearKey = (m: MediaType) =>
    m === "movie" ? "primary_release_year" : "first_air_date_year";
  const fetchOne = async (m: MediaType) => {
    const params = new URLSearchParams();
    params.set("api_key", k);
    params.set("query", query);
    params.set("include_adult", "false");
    params.set("page", "1");
    if (year) params.set(yearKey(m), String(year));
    const url = `${TMDB_BASE}/search/${m}?${params.toString()}`;
    if (m === "movie") {
      const d = await fetchJson<TmdbDiscoverResponse<TmdbDiscoverMovieItem & { genre_ids?: number[] }>>(
        url,
        { revalidate: 60 }
      );
      d.results.forEach((r) => {
        out.push({
          tmdbId: r.id,
          mediaType: "movie",
          title: r.title,
          releaseYear: r.release_date ? r.release_date.slice(0, 4) : null,
          posterUrl: img(r.poster_path ?? null, "w185"),
          voteAverage:
            typeof r.vote_average === "number" && r.vote_average > 0
              ? Number(r.vote_average.toFixed(1))
              : null,
          voteCount: r.vote_count ?? null
        });
      });
    } else {
      const d = await fetchJson<TmdbDiscoverResponse<TmdbDiscoverTvItem & { genre_ids?: number[] }>>(
        url,
        { revalidate: 60 }
      );
      d.results.forEach((r) => {
        out.push({
          tmdbId: r.id,
          mediaType: "tv",
          title: r.name,
          releaseYear: r.first_air_date ? r.first_air_date.slice(0, 4) : null,
          posterUrl: img(r.poster_path ?? null, "w185"),
          voteAverage:
            typeof r.vote_average === "number" && r.vote_average > 0
              ? Number(r.vote_average.toFixed(1))
              : null,
          voteCount: r.vote_count ?? null
        });
      });
    }
  };
  if (mediaType === "both") {
    await Promise.all([fetchOne("movie"), fetchOne("tv")]);
  } else {
    await fetchOne(mediaType);
  }
  // Note: search endpoints don't accept genre/provider/cast filters.
  // We return raw search results; caller may apply lightweight filtering on
  // releaseYear/voteAverage. Genre/provider/actor filters are best-effort skipped
  // when a free-text name is provided.
  return out;
}
