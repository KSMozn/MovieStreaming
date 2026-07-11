package com.khaledsamir.reelseek.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khaledsamir.reelseek.model.Availability
import com.khaledsamir.reelseek.model.MediaType
import com.khaledsamir.reelseek.model.MovieDetails
import com.khaledsamir.reelseek.network.ReelseekApi
import kotlinx.coroutines.async
import kotlinx.coroutines.launch

// Mirrors ios DetailViewModel, plus website behavior: switching country
// re-fetches availability only.
class DetailViewModel(private val api: ReelseekApi) : ViewModel() {
    var details by mutableStateOf<MovieDetails?>(null)
        private set
    var availability by mutableStateOf<Availability?>(null)
        private set
    var isLoading by mutableStateOf(false)
        private set
    var errorMessage by mutableStateOf<String?>(null)
        private set

    private var loadedKey: Pair<Int, String>? = null

    fun load(tmdbId: Int, mediaType: MediaType, country: String) {
        val key = tmdbId to country
        if (loadedKey == key) return
        val sameTitle = loadedKey?.first == tmdbId
        loadedKey = key
        if (sameTitle) {
            // Country switch: details are unchanged, only availability moves.
            reloadAvailability(tmdbId, mediaType, country)
            return
        }
        viewModelScope.launch {
            isLoading = true
            try {
                val detailsDeferred = async { api.details(tmdbId, mediaType.key) }
                val availabilityDeferred = async {
                    runCatching { api.availability(tmdbId, mediaType.key, country) }.getOrNull()
                }
                details = detailsDeferred.await()
                availability = availabilityDeferred.await()
                errorMessage = null
            } catch (e: Exception) {
                errorMessage = e.message ?: "Failed to load details."
            } finally {
                isLoading = false
            }
        }
    }

    fun reloadAvailability(tmdbId: Int, mediaType: MediaType, country: String) {
        viewModelScope.launch {
            availability = runCatching {
                api.availability(tmdbId, mediaType.key, country)
            }.getOrNull()
        }
    }
}
