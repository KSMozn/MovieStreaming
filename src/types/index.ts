// Normalized DTOs used across the app.

export type MediaType = "movie" | "tv";

export type ProviderKey =
  | "netflix"
  | "osn"
  | "amazon_prime_video"
  | "shahid"
  | "watch_it"
  | "disney_plus"
  | "apple_tv_plus";

export interface SearchResultDto {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  releaseYear: string | null;
  posterUrl: string | null;
}

export interface CastMemberDto {
  personId: number;
  name: string;
  character: string | null;
  profileUrl: string | null;
}

export interface MovieDetailsDto {
  tmdbId: number;
  mediaType: MediaType;
  imdbId: string | null;
  title: string;
  originalTitle: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  runtime: number | null;
  /** TV only: total number of seasons. null for movies. */
  numberOfSeasons: number | null;
  /** TV only: total number of episodes. null for movies. */
  numberOfEpisodes: number | null;
  genres: string[];
  imdbRating: number | null;
  tmdbRating: number | null;
  tmdbVotes: number | null;
  cast: CastMemberDto[];
}

export type AvailabilityType =
  | "subscription"
  | "free"
  | "rent"
  | "buy"
  | "ads"
  | "unknown";

export interface ProviderAvailabilityDto {
  providerKey: ProviderKey;
  providerName: string;
  logoUrl: string;
  available: boolean;
  availabilityType: AvailabilityType | null;
  streamingUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  providerGenre: string | null;
}

export interface AvailabilityDto {
  country: string;
  providers: ProviderAvailabilityDto[];
  lastCheckedAt: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface PersonCreditDto {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  character: string | null;
  releaseYear: string | null;
  releaseDate: string | null;
  posterUrl: string | null;
  voteAverage: number | null;
  popularity: number;
}

export interface PersonDto {
  personId: number;
  name: string;
  imdbId: string | null;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  knownForDepartment: string | null;
  profileUrl: string | null;
  credits: PersonCreditDto[];
}
