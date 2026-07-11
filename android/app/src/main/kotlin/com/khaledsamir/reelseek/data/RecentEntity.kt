package com.khaledsamir.reelseek.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.khaledsamir.reelseek.model.DiscoverResult
import com.khaledsamir.reelseek.model.MediaType

// Mirrors ios/Reelseek/Persistence/RecentItem.swift (and the web localStorage recents).
@Entity(tableName = "recents")
data class RecentEntity(
    @PrimaryKey val compositeKey: String,
    val tmdbId: Int,
    val mediaType: String,
    val title: String,
    val posterUrl: String?,
    val releaseYear: String?,
    val viewedAt: Long
) {
    fun toDiscoverResult() = DiscoverResult(
        tmdbId = tmdbId,
        mediaType = MediaType.fromKey(mediaType),
        title = title,
        releaseYear = releaseYear,
        posterUrl = posterUrl
    )
}
