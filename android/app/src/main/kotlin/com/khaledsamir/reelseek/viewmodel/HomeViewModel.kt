package com.khaledsamir.reelseek.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khaledsamir.reelseek.model.DiscoverResult
import com.khaledsamir.reelseek.model.SortKey
import com.khaledsamir.reelseek.network.DiscoverQuery
import com.khaledsamir.reelseek.network.ReelseekApi
import kotlinx.coroutines.launch

// Mirrors ios HomeViewModel: trending = /api/discover with no filters, by popularity.
class HomeViewModel(private val api: ReelseekApi) : ViewModel() {
    var results by mutableStateOf<List<DiscoverResult>>(emptyList())
        private set
    var isLoading by mutableStateOf(false)
        private set
    var errorMessage by mutableStateOf<String?>(null)
        private set

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            isLoading = true
            try {
                val response = api.discover(
                    DiscoverQuery(sortBy = SortKey.POPULARITY_DESC).toQueryMap()
                )
                results = response.results
                errorMessage = null
            } catch (e: Exception) {
                errorMessage = e.message ?: "Failed to load trending titles."
            } finally {
                isLoading = false
            }
        }
    }
}
