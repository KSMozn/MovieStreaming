package com.khaledsamir.reelseek.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khaledsamir.reelseek.model.Person
import com.khaledsamir.reelseek.network.ReelseekApi
import kotlinx.coroutines.launch

// Backs PersonScreen — the analogue of the web /person/[personId] page.
class PersonViewModel(private val api: ReelseekApi) : ViewModel() {
    var person by mutableStateOf<Person?>(null)
        private set
    var isLoading by mutableStateOf(false)
        private set
    var errorMessage by mutableStateOf<String?>(null)
        private set

    private var loadedPersonId: Int? = null

    fun load(personId: Int) {
        if (loadedPersonId == personId) return
        loadedPersonId = personId
        viewModelScope.launch {
            isLoading = true
            try {
                person = api.person(personId)
                errorMessage = null
            } catch (e: Exception) {
                errorMessage = e.message ?: "Failed to load person."
            } finally {
                isLoading = false
            }
        }
    }
}
