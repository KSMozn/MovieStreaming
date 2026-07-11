package com.khaledsamir.reelseek.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class MediaType(val key: String, val label: String) {
    @SerialName("movie") MOVIE("movie", "Movie"),
    @SerialName("tv") TV("tv", "TV");

    companion object {
        fun fromKey(key: String): MediaType = entries.first { it.key == key }
    }
}

enum class MediaTypeFilter(val key: String, val label: String) {
    BOTH("both", "Both"),
    MOVIE("movie", "Movies"),
    TV("tv", "TV")
}

@Serializable
enum class ProviderKey(val key: String, val displayName: String) {
    @SerialName("netflix") NETFLIX("netflix", "Netflix"),
    @SerialName("osn") OSN("osn", "OSN+"),
    @SerialName("amazon_prime_video") AMAZON_PRIME_VIDEO("amazon_prime_video", "Prime Video"),
    @SerialName("shahid") SHAHID("shahid", "Shahid"),
    @SerialName("watch_it") WATCH_IT("watch_it", "Watch It"),
    @SerialName("tod") TOD("tod", "TOD"),
    @SerialName("disney_plus") DISNEY_PLUS("disney_plus", "Disney+"),
    @SerialName("apple_tv_plus") APPLE_TV_PLUS("apple_tv_plus", "Apple TV+")
}

@Serializable
enum class AvailabilityType(val label: String) {
    @SerialName("subscription") SUBSCRIPTION("Subscription"),
    @SerialName("free") FREE("Free"),
    @SerialName("rent") RENT("Rent"),
    @SerialName("buy") BUY("Buy"),
    @SerialName("ads") ADS("With ads"),
    @SerialName("unknown") UNKNOWN("Unknown")
}

@Serializable
enum class SortKey(val key: String, val label: String) {
    @SerialName("popularity.desc") POPULARITY_DESC("popularity.desc", "Most popular"),
    @SerialName("rating.desc") RATING_DESC("rating.desc", "Rating ↓ (high to low)"),
    @SerialName("rating.asc") RATING_ASC("rating.asc", "Rating ↑ (low to high)"),
    @SerialName("release.desc") RELEASE_DESC("release.desc", "Newest first"),
    @SerialName("release.asc") RELEASE_ASC("release.asc", "Oldest first"),
    @SerialName("votes.desc") VOTES_DESC("votes.desc", "Most voted");

    companion object {
        val DEFAULT = POPULARITY_DESC
    }
}
