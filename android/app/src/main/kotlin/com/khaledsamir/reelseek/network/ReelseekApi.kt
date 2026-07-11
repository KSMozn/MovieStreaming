package com.khaledsamir.reelseek.network

import com.khaledsamir.reelseek.model.Availability
import com.khaledsamir.reelseek.model.CombinedGenre
import com.khaledsamir.reelseek.model.DiscoverResponse
import com.khaledsamir.reelseek.model.DiscoverResult
import com.khaledsamir.reelseek.model.MovieDetails
import com.khaledsamir.reelseek.model.Person
import com.khaledsamir.reelseek.model.PersonSearchResult
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.QueryMap
import java.util.concurrent.TimeUnit

interface ReelseekApi {
    @GET("api/discover")
    suspend fun discover(@QueryMap query: Map<String, String>): DiscoverResponse

    @GET("api/genres")
    suspend fun genres(): List<CombinedGenre>

    @GET("api/movies/search")
    suspend fun searchMovies(@Query("q") query: String): List<DiscoverResult>

    @GET("api/movies/{tmdbId}")
    suspend fun details(
        @Path("tmdbId") tmdbId: Int,
        @Query("type") type: String
    ): MovieDetails

    @GET("api/movies/{tmdbId}/availability")
    suspend fun availability(
        @Path("tmdbId") tmdbId: Int,
        @Query("type") type: String,
        @Query("country") country: String
    ): Availability

    @GET("api/people/search")
    suspend fun searchPeople(@Query("q") query: String): List<PersonSearchResult>

    @GET("api/people/{personId}")
    suspend fun person(@Path("personId") personId: Int): Person

    companion object {
        val json: Json = Json {
            ignoreUnknownKeys = true
            explicitNulls = false
        }

        fun create(baseUrl: String = ApiConfig.BASE_URL): ReelseekApi {
            val client = OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build()
            return Retrofit.Builder()
                .baseUrl(if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/")
                .client(client)
                .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
                .build()
                .create(ReelseekApi::class.java)
        }
    }
}
