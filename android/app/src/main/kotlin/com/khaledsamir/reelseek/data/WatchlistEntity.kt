package com.khaledsamir.reelseek.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.khaledsamir.reelseek.model.DiscoverResult
import com.khaledsamir.reelseek.model.MediaType
import com.khaledsamir.reelseek.model.MovieDetails

// Mirrors ios/Reelseek/Persistence/WatchlistItem.swift.
@Entity(tableName = "watchlist")
data class WatchlistEntity(
    @PrimaryKey val compositeKey: String,
    val tmdbId: Int,
    val mediaType: String,
    val title: String,
    val releaseYear: String?,
    val posterUrl: String?,
    val addedAt: Long
) {
    fun toDiscoverResult() = DiscoverResult(
        tmdbId = tmdbId,
        mediaType = MediaType.fromKey(mediaType),
        title = title,
        releaseYear = releaseYear,
        posterUrl = posterUrl
    )

    companion object {
        fun key(mediaType: MediaType, tmdbId: Int) = "${mediaType.key}-$tmdbId"

        fun from(r: DiscoverResult, addedAt: Long) = WatchlistEntity(
            compositeKey = key(r.mediaType, r.tmdbId),
            tmdbId = r.tmdbId,
            mediaType = r.mediaType.key,
            title = r.title,
            releaseYear = r.releaseYear,
            posterUrl = r.posterUrl,
            addedAt = addedAt
        )

        fun from(d: MovieDetails, addedAt: Long) = WatchlistEntity(
            compositeKey = key(d.mediaType, d.tmdbId),
            tmdbId = d.tmdbId,
            mediaType = d.mediaType.key,
            title = d.title,
            releaseYear = d.releaseDate?.take(4),
            posterUrl = d.posterUrl,
            addedAt = addedAt
        )
    }
}
