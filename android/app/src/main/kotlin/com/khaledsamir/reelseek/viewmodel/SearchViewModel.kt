package com.khaledsamir.reelseek.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khaledsamir.reelseek.data.CountryPrefs
import com.khaledsamir.reelseek.model.CombinedGenre
import com.khaledsamir.reelseek.model.DiscoverResult
import com.khaledsamir.reelseek.model.PersonSearchResult
import com.khaledsamir.reelseek.network.DiscoverQuery
import com.khaledsamir.reelseek.network.ReelseekApi
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

// Mirrors ios SearchViewModel: filter-driven /api/discover with pagination,
// genres, and debounced person autocomplete.
class SearchViewModel(
    private val api: ReelseekApi,
    private val countryPrefs: CountryPrefs
) : ViewModel() {
    var query by mutableStateOf(DiscoverQuery())
    var results by mutableStateOf<List<DiscoverResult>>(emptyList())
        private set
    var totalResults by mutableStateOf(0)
        private set
    var totalPages by mutableStateOf(1)
        private set
    var isLoading by mutableStateOf(false)
        private set
    var errorMessage by mutableStateOf<String?>(null)
        private set
    var warnings by mutableStateOf<List<String>>(emptyList())
        private set
    var genres by mutableStateOf<List<CombinedGenre>>(emptyList())
        private set
    var personResults by mutableStateOf<List<PersonSearchResult>>(emptyList())
        private set
    var selectedPersonName by mutableStateOf("")
        private set

    private var searchJob: Job? = null
    private var personJob: Job? = null

    init {
        viewModelScope.launch {
            // Default the country filter to the persisted preference.
            query = query.copy(country = countryPrefs.country.first())
        }
        viewModelScope.launch {
            try {
                genres = api.genres()
            } catch (_: Exception) {
                // genres are non-critical
            }
        }
    }

    fun runSearch(resetPage: Boolean = true) {
        if (resetPage) query = query.copy(page = 1)
        val q = query
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            isLoading = true
            try {
                val response = api.discover(q.toQueryMap())
                if (q.page == 1) {
                    results = response.results
                } else {
                    results = results + response.results
                }
                totalResults = response.totalResults
                totalPages = response.totalPages
                warnings = response.warnings
                errorMessage = null
                countryPrefs.setCountry(q.country)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                errorMessage = e.message ?: "Search failed."
            } finally {
                isLoading = false
            }
        }
    }

    fun nextPage() {
        if (query.page >= totalPages || isLoading) return
        query = query.copy(page = query.page + 1)
        runSearch(resetPage = false)
    }

    fun searchPerson(name: String) {
        personJob?.cancel()
        val trimmed = name.trim()
        if (trimmed.isEmpty()) {
            personResults = emptyList()
            return
        }
        personJob = viewModelScope.launch {
            delay(250)
            try {
                personResults = api.searchPeople(trimmed)
            } catch (_: Exception) {
                // ignore
            }
        }
    }

    fun selectPerson(person: PersonSearchResult) {
        query = query.copy(personId = person.personId)
        selectedPersonName = person.name
        personResults = emptyList()
    }

    fun clearPerson() {
        query = query.copy(personId = null)
        selectedPersonName = ""
        personResults = emptyList()
    }

    fun reset() {
        query = DiscoverQuery()
        results = emptyList()
        totalResults = 0
        totalPages = 1
        warnings = emptyList()
        selectedPersonName = ""
        personResults = emptyList()
        errorMessage = null
    }
}
