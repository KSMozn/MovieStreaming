package com.khaledsamir.reelseek

import com.khaledsamir.reelseek.model.MediaTypeFilter
import com.khaledsamir.reelseek.model.ProviderKey
import com.khaledsamir.reelseek.model.SortKey
import com.khaledsamir.reelseek.network.DiscoverQuery
import org.junit.Assert.assertEquals
import org.junit.Test

// Mirrors ios DiscoverQuery.toQuery(): defaults are omitted, country is always sent.
class DiscoverQueryTest {

    @Test
    fun `default query only sends country`() {
        assertEquals(mapOf("country" to "EG"), DiscoverQuery().toQueryMap())
    }

    @Test
    fun `full query maps every filter`() {
        val query = DiscoverQuery(
            name = "batman",
            year = "2022",
            genreIds = listOf(28, 18),
            provider = ProviderKey.NETFLIX,
            voteGte = "7.5",
            personId = 1234,
            mediaType = MediaTypeFilter.MOVIE,
            country = "SA",
            sortBy = SortKey.RATING_DESC,
            page = 3
        )
        assertEquals(
            mapOf(
                "q" to "batman",
                "year" to "2022",
                "genres" to "28,18",
                "provider" to "netflix",
                "voteGte" to "7.5",
                "personId" to "1234",
                "mediaType" to "movie",
                "country" to "SA",
                "sortBy" to "rating.desc",
                "page" to "3"
            ),
            query.toQueryMap()
        )
    }

    @Test
    fun `page 1 and default sort are omitted`() {
        val map = DiscoverQuery(page = 1, sortBy = SortKey.POPULARITY_DESC).toQueryMap()
        assertEquals(setOf("country"), map.keys)
    }
}
