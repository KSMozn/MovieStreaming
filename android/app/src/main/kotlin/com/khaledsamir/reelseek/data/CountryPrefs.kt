package com.khaledsamir.reelseek.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.khaledsamir.reelseek.network.ApiConfig
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "settings")
private val COUNTRY_KEY = stringPreferencesKey("country")

// Selected availability country (EG/SA/AE) — the web keeps this in the URL,
// here it's a single persisted preference shared by Detail and Filters.
class CountryPrefs(private val context: Context) {
    val country: Flow<String> = context.dataStore.data
        .map { it[COUNTRY_KEY] ?: ApiConfig.DEFAULT_COUNTRY }

    suspend fun setCountry(code: String) {
        context.dataStore.edit { it[COUNTRY_KEY] = code }
    }
}
