package com.khaledsamir.reelseek.model

import kotlinx.serialization.Serializable

// Normalized DTOs mirroring src/types/index.ts (and ios/Reelseek/Models/).

@Serializable
data class DiscoverResult(
    val tmdbId: Int,
    val mediaType: MediaType,
    val title: String,
    val releaseYear: String? = null,
    val posterUrl: String? = null,
    val voteAverage: Double? = null,
    val voteCount: Int? = null
) {
    val id: String get() = "${mediaType.key}-$tmdbId"
}

@Serializable
data class DiscoverAppliedFilters(
    val name: String? = null,
    val year: Int? = null,
    val genreIds: List<Int> = emptyList(),
    val providerKey: ProviderKey? = null,
    val voteAverageGte: Double? = null,
    val personId: Int? = null,
    val mediaType: String,
    val country: String,
    val page: Int,
    val sortBy: SortKey
)

@Serializable
data class DiscoverResponse(
    val results: List<DiscoverResult>,
    val page: Int,
    val totalPages: Int,
    val totalResults: Int,
    val appliedFilters: DiscoverAppliedFilters,
    val warnings: List<String> = emptyList()
)

@Serializable
data class CombinedGenre(
    val id: Int,
    val name: String,
    val appliesTo: List<String>
)

@Serializable
data class CastMember(
    val personId: Int,
    val name: String,
    val character: String? = null,
    val profileUrl: String? = null
)

@Serializable
data class MovieDetails(
    val tmdbId: Int,
    val mediaType: MediaType,
    val imdbId: String? = null,
    val title: String,
    val originalTitle: String,
    val overview: String,
    val posterUrl: String? = null,
    val backdropUrl: String? = null,
    val releaseDate: String? = null,
    val runtime: Int? = null,
    val numberOfSeasons: Int? = null,
    val numberOfEpisodes: Int? = null,
    val genres: List<String> = emptyList(),
    val imdbRating: Double? = null,
    val tmdbRating: Double? = null,
    val tmdbVotes: Int? = null,
    val cast: List<CastMember> = emptyList()
)

@Serializable
data class ProviderAvailability(
    val providerKey: ProviderKey,
    val providerName: String,
    val logoUrl: String,
    val available: Boolean,
    val availabilityType: AvailabilityType? = null,
    val streamingUrl: String? = null,
    val startsAt: String? = null,
    val endsAt: String? = null,
    val providerGenre: String? = null
)

@Serializable
data class Availability(
    val country: String,
    val providers: List<ProviderAvailability>,
    val lastCheckedAt: String
)

@Serializable
data class PersonSearchResult(
    val personId: Int,
    val name: String,
    val profileUrl: String? = null,
    val knownForDepartment: String? = null,
    val knownForTitles: List<String> = emptyList()
)

@Serializable
data class PersonCredit(
    val tmdbId: Int,
    val mediaType: MediaType,
    val title: String,
    val character: String? = null,
    val releaseYear: String? = null,
    val releaseDate: String? = null,
    val posterUrl: String? = null,
    val voteAverage: Double? = null,
    val popularity: Double
) {
    val id: String get() = "${mediaType.key}-$tmdbId"
}

@Serializable
data class Person(
    val personId: Int,
    val name: String,
    val imdbId: String? = null,
    val biography: String = "",
    val birthday: String? = null,
    val deathday: String? = null,
    val placeOfBirth: String? = null,
    val knownForDepartment: String? = null,
    val profileUrl: String? = null,
    val credits: List<PersonCredit> = emptyList()
)
