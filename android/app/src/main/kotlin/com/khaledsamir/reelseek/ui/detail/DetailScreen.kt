package com.khaledsamir.reelseek.ui.detail

import android.annotation.SuppressLint
import android.net.Uri
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.PlayCircle
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Theaters
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.khaledsamir.reelseek.data.RecentEntity
import com.khaledsamir.reelseek.data.WatchlistEntity
import com.khaledsamir.reelseek.model.Availability
import com.khaledsamir.reelseek.model.CastMember
import com.khaledsamir.reelseek.model.ProviderAvailability
import com.khaledsamir.reelseek.model.Theatrical
import com.khaledsamir.reelseek.model.Trailer
import com.khaledsamir.reelseek.network.ApiConfig
import com.khaledsamir.reelseek.ui.DetailRoute
import com.khaledsamir.reelseek.ui.PersonRoute
import com.khaledsamir.reelseek.ui.components.CountryDropdown
import com.khaledsamir.reelseek.ui.components.MediaBadge
import com.khaledsamir.reelseek.ui.components.RemoteImage
import com.khaledsamir.reelseek.ui.reelseekApp
import com.khaledsamir.reelseek.ui.theme.Theme
import com.khaledsamir.reelseek.ui.theme.cardStyle
import com.khaledsamir.reelseek.viewmodel.DetailViewModel
import kotlinx.coroutines.launch

// Mirrors ios DetailView + the web TitleDetails: backdrop, title block, rating
// pills, watchlist/IMDb actions, country selector, provider cards, tappable cast.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetailScreen(navController: NavController, route: DetailRoute) {
    val app = reelseekApp()
    val viewModel: DetailViewModel = viewModel { DetailViewModel(app.api) }
    val scope = rememberCoroutineScope()
    val uriHandler = LocalUriHandler.current

    val country by app.countryPrefs.country.collectAsState(initial = ApiConfig.DEFAULT_COUNTRY)
    val compositeKey = WatchlistEntity.key(route.mediaTypeEnum, route.tmdbId)
    val inWatchlist by app.database.watchlistDao().observeContains(compositeKey)
        .collectAsState(initial = false)

    LaunchedEffect(route.tmdbId, country) {
        viewModel.load(route.tmdbId, route.mediaTypeEnum, country)
    }

    val details = viewModel.details

    // Record to recents once details (or prefetched info) are known.
    LaunchedEffect(details) {
        val title = details?.title ?: route.title ?: return@LaunchedEffect
        app.database.recentDao().touch(
            RecentEntity(
                compositeKey = compositeKey,
                tmdbId = route.tmdbId,
                mediaType = route.mediaType,
                title = title,
                posterUrl = details?.posterUrl ?: route.posterUrl,
                releaseYear = details?.releaseDate?.take(4) ?: route.releaseYear,
                viewedAt = System.currentTimeMillis()
            )
        )
    }

    Column(Modifier.fillMaxSize().background(Theme.Bg)) {
        TopAppBar(
            title = {},
            navigationIcon = {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Theme.TextPrimary)
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = Theme.Bg)
        )

        Column(
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 24.dp)
        ) {
            Backdrop(details?.backdropUrl ?: route.posterUrl)
            TitleBlock(route, viewModel)
            RatingsRow(viewModel)
            ActionsRow(
                inWatchlist = inWatchlist,
                imdbId = details?.imdbId,
                onToggleWatchlist = {
                    scope.launch {
                        if (inWatchlist) {
                            app.database.watchlistDao().delete(compositeKey)
                        } else {
                            val entity = details?.let {
                                WatchlistEntity.from(it, System.currentTimeMillis())
                            } ?: WatchlistEntity(
                                compositeKey = compositeKey,
                                tmdbId = route.tmdbId,
                                mediaType = route.mediaType,
                                title = route.title ?: "",
                                releaseYear = route.releaseYear,
                                posterUrl = route.posterUrl,
                                addedAt = System.currentTimeMillis()
                            )
                            app.database.watchlistDao().insert(entity)
                        }
                    }
                },
                onOpenImdb = { imdbId -> uriHandler.openUri("https://www.imdb.com/title/$imdbId/") }
            )

            when {
                details != null -> {
                    details.trailer?.let { TrailerBlock(it) }
                    OverviewBlock(details.overview)
                    AvailabilityBlock(
                        availability = viewModel.availability,
                        country = country,
                        title = details.title,
                        onCountryChange = { code -> scope.launch { app.countryPrefs.setCountry(code) } },
                        onOpenUrl = { url -> uriHandler.openUri(url) }
                    )
                    CastBlock(details.cast) { personId ->
                        navController.navigate(PersonRoute(personId))
                    }
                }
                viewModel.isLoading ->
                    Box(Modifier.fillMaxWidth().padding(vertical = 40.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Theme.Accent)
                    }
                viewModel.errorMessage != null ->
                    Text(
                        viewModel.errorMessage ?: "",
                        fontSize = 13.sp,
                        color = Color(0xFFEF4444),
                        modifier = Modifier.padding(16.dp)
                    )
            }
        }
    }
}

@Composable
private fun Backdrop(url: String?) {
    Box(Modifier.fillMaxWidth().height(220.dp)) {
        RemoteImage(url = url, modifier = Modifier.fillMaxSize())
        Box(
            Modifier
                .fillMaxWidth()
                .height(100.dp)
                .align(Alignment.BottomCenter)
                .background(
                    Brush.verticalGradient(listOf(Theme.Bg.copy(alpha = 0f), Theme.Bg))
                )
        )
    }
}

@Composable
private fun TitleBlock(route: DetailRoute, viewModel: DetailViewModel) {
    val details = viewModel.details
    val title = details?.title ?: route.title ?: ""
    val year = details?.releaseDate?.take(4) ?: route.releaseYear

    Column(
        verticalArrangement = Arrangement.spacedBy(4.dp),
        modifier = Modifier.padding(horizontal = 16.dp)
    ) {
        Text(title, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Theme.TextPrimary)
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            MediaBadge(route.mediaTypeEnum)
            year?.let { Text(it, fontSize = 13.sp, color = Theme.TextSecondary) }
            details?.runtime?.takeIf { it > 0 }?.let {
                Text("· $it min", fontSize = 13.sp, color = Theme.TextSecondary)
            }
            details?.numberOfSeasons?.takeIf { it > 0 }?.let {
                Text("· $it season${if (it == 1) "" else "s"}", fontSize = 13.sp, color = Theme.TextSecondary)
            }
        }
        details?.genres?.takeIf { it.isNotEmpty() }?.let {
            Text(it.joinToString(" · "), fontSize = 12.sp, color = Theme.TextMuted)
        }
    }
}

@Composable
private fun RatingsRow(viewModel: DetailViewModel) {
    val details = viewModel.details ?: return
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier.padding(horizontal = 16.dp)
    ) {
        details.tmdbRating?.let { RatingPill("%.1f".format(it), "TMDb") }
        details.imdbRating?.let { RatingPill("%.1f".format(it), "IMDb") }
        details.tmdbVotes?.let {
            Text("%,d votes".format(it), fontSize = 12.sp, color = Theme.TextMuted)
        }
    }
}

@Composable
private fun RatingPill(value: String, label: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        modifier = Modifier
            .clip(CircleShape)
            .background(Theme.Surface)
            .padding(horizontal = 10.dp, vertical = 5.dp)
    ) {
        Icon(Icons.Default.Star, contentDescription = null, tint = Theme.Accent, modifier = Modifier.size(13.dp))
        Text(value, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Theme.TextPrimary)
        Text(label, fontSize = 13.sp, color = Theme.TextSecondary)
    }
}

@Composable
private fun ActionsRow(
    inWatchlist: Boolean,
    imdbId: String?,
    onToggleWatchlist: () -> Unit,
    onOpenImdb: (String) -> Unit
) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally),
            modifier = Modifier
                .weight(1f)
                .clip(RoundedCornerShape(Theme.CardCornerRadius))
                .background(if (inWatchlist) Theme.Accent else Theme.Surface)
                .clickable(onClick = onToggleWatchlist)
                .padding(vertical = 10.dp)
        ) {
            Icon(
                if (inWatchlist) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                contentDescription = null,
                tint = if (inWatchlist) Theme.Bg else Theme.TextPrimary,
                modifier = Modifier.size(18.dp)
            )
            Text(
                if (inWatchlist) "In watchlist" else "Add to watchlist",
                fontSize = 14.sp,
                color = if (inWatchlist) Theme.Bg else Theme.TextPrimary
            )
        }
        if (imdbId != null) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally),
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(Theme.CardCornerRadius))
                    .background(Theme.Surface)
                    .clickable { onOpenImdb(imdbId) }
                    .padding(vertical = 10.dp)
            ) {
                Icon(Icons.Default.OpenInNew, contentDescription = null, tint = Theme.TextPrimary, modifier = Modifier.size(16.dp))
                Text("IMDb", fontSize = 14.sp, color = Theme.TextPrimary)
            }
        }
    }
}

@Composable
private fun OverviewBlock(overview: String) {
    Column(
        verticalArrangement = Arrangement.spacedBy(6.dp),
        modifier = Modifier.padding(horizontal = 16.dp)
    ) {
        Text("Overview", fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = Theme.TextPrimary)
        Text(
            overview.ifEmpty { "No overview available." },
            fontSize = 14.sp,
            color = Theme.TextSecondary
        )
    }
}

// Compact trailer viewer: a thumbnail facade that swaps to an inline YouTube
// (no-cookie) WebView player once tapped — YouTube isn't loaded until then.
@Composable
private fun TrailerBlock(trailer: Trailer) {
    var playing by remember { mutableStateOf(false) }
    Column(
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.padding(horizontal = 16.dp)
    ) {
        Text("Trailer", fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = Theme.TextPrimary)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(16f / 9f)
                .clip(RoundedCornerShape(Theme.CardCornerRadius))
                .background(Color.Black)
        ) {
            if (playing) {
                TrailerWebView(trailer.embedUrl, modifier = Modifier.fillMaxSize())
            } else {
                RemoteImage(
                    url = trailer.thumbnailUrl,
                    contentDescription = trailer.name,
                    modifier = Modifier.fillMaxSize()
                )
                Box(
                    Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.25f))
                        .clickable { playing = true },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.PlayCircle,
                        contentDescription = "Play official trailer",
                        tint = Color.White,
                        modifier = Modifier.size(56.dp)
                    )
                }
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
private fun TrailerWebView(embedUrl: String, modifier: Modifier = Modifier) {
    val url = remember(embedUrl) {
        val sep = if (embedUrl.contains("?")) "&" else "?"
        "$embedUrl${sep}autoplay=1&playsinline=1"
    }
    AndroidView(
        modifier = modifier,
        factory = { context ->
            WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.mediaPlaybackRequiresUserGesture = false
                settings.domStorageEnabled = true
                setBackgroundColor(android.graphics.Color.BLACK)
                webChromeClient = WebChromeClient()
                loadUrl(url)
            }
        }
    )
}

// "In theaters now / coming to cinemas" banner + honest showtimes search link.
@Composable
private fun TheatricalBanner(
    theatrical: Theatrical,
    countryLabel: String,
    title: String,
    onOpenUrl: (String) -> Unit
) {
    val heading = if (theatrical.status == "now")
        "In theaters now in $countryLabel"
    else
        "Coming to cinemas in $countryLabel"
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(Theme.CardCornerRadius))
            .background(Theme.Accent.copy(alpha = 0.12f))
            .padding(10.dp)
    ) {
        Icon(Icons.Default.Theaters, contentDescription = null, tint = Theme.Accent, modifier = Modifier.size(20.dp))
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(heading, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Theme.TextPrimary)
            theatrical.releaseDate?.let {
                Text(it.take(10), fontSize = 12.sp, color = Theme.TextSecondary)
            }
        }
        Text(
            "Showtimes",
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            color = Theme.Accent,
            modifier = Modifier.clickable {
                val q = Uri.encode("$title showtimes $countryLabel")
                onOpenUrl("https://www.google.com/search?q=$q")
            }
        )
    }
}

private fun countryLabel(code: String): String =
    ApiConfig.COUNTRIES.firstOrNull { it.first == code }?.second ?: code

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AvailabilityBlock(
    availability: Availability?,
    country: String,
    title: String,
    onCountryChange: (String) -> Unit,
    onOpenUrl: (String) -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.padding(horizontal = 16.dp)
    ) {
        availability?.theatrical?.takeIf { it.status != "none" }?.let {
            TheatricalBanner(
                theatrical = it,
                countryLabel = countryLabel(availability.country),
                title = title,
                onOpenUrl = onOpenUrl
            )
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                "Watch in ${countryLabel(country)}",
                fontSize = 17.sp,
                fontWeight = FontWeight.SemiBold,
                color = Theme.TextPrimary
            )
            Spacer(Modifier.weight(1f))
            // Dropdown (not segmented) so all supported countries fit.
            CountryDropdown(selected = country, onSelect = onCountryChange)
        }

        val available = availability?.providers?.filter { it.available }.orEmpty()
        when {
            availability == null ->
                Text("Checking availability…", fontSize = 13.sp, color = Theme.TextMuted)
            available.isEmpty() ->
                Text(
                    "Not available on tracked providers in ${countryLabel(availability.country)}.",
                    fontSize = 13.sp,
                    color = Theme.TextMuted
                )
            else ->
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.horizontalScroll(rememberScrollState())
                ) {
                    available.forEach { provider ->
                        ProviderCard(provider, onOpenUrl)
                    }
                }
        }
    }
}

@Composable
private fun ProviderCard(provider: ProviderAvailability, onOpen: (String) -> Unit) {
    val logoUrl = provider.logoUrl.let {
        if (it.startsWith("/")) ApiConfig.BASE_URL + it else it
    }
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp),
        modifier = Modifier
            .width(100.dp)
            .cardStyle()
            .background(Theme.Surface)
            .clickable(enabled = provider.streamingUrl != null) {
                provider.streamingUrl?.let(onOpen)
            }
            .padding(10.dp)
    ) {
        RemoteImage(
            url = logoUrl,
            contentDescription = provider.providerName,
            modifier = Modifier.size(40.dp).clip(RoundedCornerShape(8.dp))
        )
        Text(
            provider.providerName,
            fontSize = 11.sp,
            color = Theme.TextPrimary,
            textAlign = TextAlign.Center,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
        provider.availabilityType?.let {
            Text(
                it.label,
                fontSize = 9.sp,
                fontWeight = FontWeight.SemiBold,
                color = Theme.TextSecondary,
                modifier = Modifier
                    .clip(CircleShape)
                    .background(Theme.Surface2)
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            )
        }
    }
}

@Composable
private fun CastBlock(cast: List<CastMember>, onOpenPerson: (Int) -> Unit) {
    if (cast.isEmpty()) return
    Column(
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.padding(horizontal = 16.dp)
    ) {
        Text("Cast", fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = Theme.TextPrimary)
        Row(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.horizontalScroll(rememberScrollState())
        ) {
            cast.take(15).forEach { member ->
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                    // Tappable, like CastList on the website (iOS cast is static).
                    modifier = Modifier
                        .width(84.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { onOpenPerson(member.personId) }
                        .padding(vertical = 4.dp)
                ) {
                    RemoteImage(
                        url = member.profileUrl,
                        contentDescription = member.name,
                        modifier = Modifier.size(64.dp).clip(CircleShape)
                    )
                    Text(
                        member.name,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Theme.TextPrimary,
                        textAlign = TextAlign.Center,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                    member.character?.takeIf { it.isNotBlank() }?.let {
                        Text(
                            it,
                            fontSize = 10.sp,
                            color = Theme.TextMuted,
                            textAlign = TextAlign.Center,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }
    }
}
