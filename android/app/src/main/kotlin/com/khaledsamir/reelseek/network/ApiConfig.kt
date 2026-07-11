package com.khaledsamir.reelseek.network

import com.khaledsamir.reelseek.BuildConfig

object ApiConfig {
    const val BASE_URL: String = BuildConfig.API_BASE_URL
    const val DEFAULT_COUNTRY: String = "EG"

    // Same fixed list as the website (TitleDetails.tsx / AdvancedSearchForm.tsx COUNTRIES).
    val COUNTRIES: List<Pair<String, String>> = listOf(
        "EG" to "Egypt",
        "SA" to "Saudi Arabia",
        "AE" to "United Arab Emirates"
    )
}
