package com.khaledsamir.reelseek

import android.app.Application
import coil3.ImageLoader
import coil3.PlatformContext
import coil3.SingletonImageLoader
import coil3.network.okhttp.OkHttpNetworkFetcherFactory
import coil3.svg.SvgDecoder
import com.khaledsamir.reelseek.data.CountryPrefs
import com.khaledsamir.reelseek.data.ReelseekDatabase
import com.khaledsamir.reelseek.network.ReelseekApi

class ReelseekApp : Application(), SingletonImageLoader.Factory {
    val api: ReelseekApi by lazy { ReelseekApi.create() }
    val database: ReelseekDatabase by lazy { ReelseekDatabase.build(this) }
    val countryPrefs: CountryPrefs by lazy { CountryPrefs(this) }

    // SVG support so provider logos (same /providers/*.svg files the website
    // serves) render via Coil.
    override fun newImageLoader(context: PlatformContext): ImageLoader =
        ImageLoader.Builder(context)
            .components {
                add(OkHttpNetworkFetcherFactory())
                add(SvgDecoder.Factory())
            }
            .build()
}
