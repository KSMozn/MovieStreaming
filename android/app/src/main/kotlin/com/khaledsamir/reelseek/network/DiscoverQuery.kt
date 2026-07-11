package com.khaledsamir.reelseek.network

import com.khaledsamir.reelseek.model.MediaTypeFilter
import com.khaledsamir.reelseek.model.ProviderKey
import com.khaledsamir.reelseek.model.SortKey

// Mirrors ios DiscoverQuery.toQuery() — omitted keys mean "no filter".
data class DiscoverQuery(
    val name: String = "",
    val year: String = "",
    val genreIds: List<Int> = emptyList(),
    val provider: ProviderKey? = null,
    val voteGte: String = "",
    val personId: Int? = null,
    val mediaType: MediaTypeFilter = MediaTypeFilter.BOTH,
    val country: String = ApiConfig.DEFAULT_COUNTRY,
    val sortBy: SortKey = SortKey.DEFAULT,
    val page: Int = 1
) {
    fun toQueryMap(): Map<String, String> = buildMap {
        if (name.isNotEmpty()) put("q", name)
        if (year.isNotEmpty()) put("year", year)
        if (genreIds.isNotEmpty()) put("genres", genreIds.joinToString(","))
        provider?.let { put("provider", it.key) }
        if (voteGte.isNotEmpty()) put("voteGte", voteGte)
        personId?.let { put("personId", it.toString()) }
        if (mediaType != MediaTypeFilter.BOTH) put("mediaType", mediaType.key)
        put("country", country)
        if (sortBy != SortKey.DEFAULT) put("sortBy", sortBy.key)
        if (page > 1) put("page", page.toString())
    }
}
