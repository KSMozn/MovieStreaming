package com.khaledsamir.reelseek.network

import com.khaledsamir.reelseek.BuildConfig
import java.util.Locale

object ApiConfig {
    const val BASE_URL: String = BuildConfig.API_BASE_URL
    const val FALLBACK_COUNTRY: String = "EG"

    // Same fixed list as the website (src/lib/site.ts).
    val COUNTRIES: List<Pair<String, String>> = listOf(
        "EG" to "Egypt",
        "SA" to "Saudi Arabia",
        "AE" to "United Arab Emirates",
        "US" to "United States",
        "GB" to "United Kingdom",
        "CA" to "Canada"
    )

    private val SUPPORTED = COUNTRIES.map { it.first }.toSet()

    fun isSupported(code: String?): Boolean =
        code != null && code.uppercase() in SUPPORTED

    // Start on the device's region when ReelSeek supports it, else Egypt.
    // Mirrors the website's geo default (CF-IPCountry).
    val DEFAULT_COUNTRY: String
        get() {
            val region = Locale.getDefault().country.uppercase()
            return if (region in SUPPORTED) region else FALLBACK_COUNTRY
        }
}
