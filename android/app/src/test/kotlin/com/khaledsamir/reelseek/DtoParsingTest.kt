package com.khaledsamir.reelseek

import com.khaledsamir.reelseek.model.Availability
import com.khaledsamir.reelseek.model.CombinedGenre
import com.khaledsamir.reelseek.model.DiscoverResponse
import com.khaledsamir.reelseek.model.DiscoverResult
import com.khaledsamir.reelseek.model.MediaType
import com.khaledsamir.reelseek.model.MovieDetails
import com.khaledsamir.reelseek.model.Person
import com.khaledsamir.reelseek.model.PersonSearchResult
import com.khaledsamir.reelseek.model.ProviderKey
import com.khaledsamir.reelseek.network.ReelseekApi
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

// Decodes JSON captured from the live Cloud Run API (see fixtures/) to prove the
// Kotlin DTOs match the contract in src/types/index.ts.
class DtoParsingTest {

    private val json = ReelseekApi.json

    private fun fixture(name: String): String =
        checkNotNull(javaClass.classLoader?.getResourceAsStream("fixtures/$name")) {
            "missing fixture $name"
        }.bufferedReader().readText()

    @Test
    fun `discover response parses`() {
        val response = json.decodeFromString<DiscoverResponse>(fixture("discover_trending.json"))
        assertTrue(response.results.isNotEmpty())
        assertEquals("EG", response.appliedFilters.country)
        val first = response.results.first()
        assertTrue(first.tmdbId > 0)
        assertTrue(first.title.isNotEmpty())
    }

    @Test
    fun `genres parse`() {
        val genres = json.decodeFromString<List<CombinedGenre>>(fixture("genres.json"))
        assertTrue(genres.isNotEmpty())
        assertTrue(genres.all { it.name.isNotEmpty() && it.appliesTo.isNotEmpty() })
    }

    @Test
    fun `movie search results parse`() {
        val results = json.decodeFromString<List<DiscoverResult>>(fixture("movies_search.json"))
        assertTrue(results.isNotEmpty())
        assertTrue(results.any { it.title.contains("Inception", ignoreCase = true) })
    }

    @Test
    fun `movie details parse`() {
        val details = json.decodeFromString<MovieDetails>(fixture("movie_details.json"))
        assertEquals(27205, details.tmdbId)
        assertEquals(MediaType.MOVIE, details.mediaType)
        assertEquals("Inception", details.title)
        assertTrue(details.cast.isNotEmpty())
    }

    @Test
    fun `availability parses with all provider cards`() {
        val availability = json.decodeFromString<Availability>(fixture("availability.json"))
        assertEquals("EG", availability.country)
        // API always returns a card per tracked provider.
        assertEquals(ProviderKey.entries.size, availability.providers.size)
        assertEquals(
            ProviderKey.entries.toSet(),
            availability.providers.map { it.providerKey }.toSet()
        )
    }

    @Test
    fun `people search parses`() {
        val people = json.decodeFromString<List<PersonSearchResult>>(fixture("people_search.json"))
        assertTrue(people.isNotEmpty())
        assertTrue(people.first().personId > 0)
    }

    @Test
    fun `person details parse`() {
        val person = json.decodeFromString<Person>(fixture("person.json"))
        assertTrue(person.personId > 0)
        assertTrue(person.name.isNotEmpty())
        assertTrue(person.credits.isNotEmpty())
    }
}
