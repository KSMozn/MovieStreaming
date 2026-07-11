package com.khaledsamir.reelseek.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.khaledsamir.reelseek.model.DiscoverResult
import com.khaledsamir.reelseek.ui.AboutRoute
import com.khaledsamir.reelseek.ui.DetailRoute
import com.khaledsamir.reelseek.ui.SearchRoute
import com.khaledsamir.reelseek.ui.components.PosterCard
import com.khaledsamir.reelseek.ui.components.RemoteImage
import com.khaledsamir.reelseek.ui.components.SearchBarField
import com.khaledsamir.reelseek.ui.components.SectionHeader
import com.khaledsamir.reelseek.ui.reelseekApp
import com.khaledsamir.reelseek.ui.theme.Theme
import com.khaledsamir.reelseek.ui.theme.cardStyle
import com.khaledsamir.reelseek.viewmodel.HomeViewModel

private fun NavController.openDetail(result: DiscoverResult) {
    navigate(
        DetailRoute(
            tmdbId = result.tmdbId,
            mediaType = result.mediaType.key,
            title = result.title,
            posterUrl = result.posterUrl,
            releaseYear = result.releaseYear
        )
    )
}

// Mirrors ios HomeView: hero, instant search, advanced-search CTA,
// recents row, trending grid, attribution footer.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavController) {
    val app = reelseekApp()
    val viewModel: HomeViewModel = viewModel { HomeViewModel(app.api) }
    val recents by app.database.recentDao().observeAll()
        .collectAsState(initial = emptyList())

    Column(Modifier.fillMaxSize().background(Theme.Bg)) {
        TopAppBar(
            title = { Text("Reelseek", fontWeight = FontWeight.SemiBold) },
            navigationIcon = {
                IconButton(onClick = { navController.navigate(AboutRoute) }) {
                    Icon(Icons.Default.Info, contentDescription = "About", tint = Theme.Accent)
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = Theme.Bg,
                titleContentColor = Theme.TextPrimary
            )
        )

        PullToRefreshBox(
            isRefreshing = viewModel.isLoading,
            onRefresh = { viewModel.load() }
        ) {
            Column(
                verticalArrangement = Arrangement.spacedBy(24.dp),
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp)
                    .padding(top = 4.dp, bottom = 24.dp)
            ) {
                Hero()
                SearchBarField(api = app.api, onPick = { navController.openDetail(it) })
                AdvancedSearchCta { navController.navigate(SearchRoute) }

                if (recents.isNotEmpty()) {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        SectionHeader("Recently viewed")
                        RecentsGrid(
                            recents.take(10).map { it.toDiscoverResult() },
                            onOpen = { navController.openDetail(it) }
                        )
                    }
                }

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    SectionHeader("Trending")
                    when {
                        viewModel.isLoading && viewModel.results.isEmpty() ->
                            Box(Modifier.fillMaxWidth().height(140.dp), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(color = Theme.Accent)
                            }
                        viewModel.errorMessage != null && viewModel.results.isEmpty() ->
                            Text(
                                viewModel.errorMessage ?: "",
                                fontSize = 13.sp,
                                color = androidx.compose.ui.graphics.Color(0xFFEF4444)
                            )
                        else ->
                            TitleGrid(
                                viewModel.results.take(12),
                                onOpen = { navController.openDetail(it) }
                            )
                    }
                }

                Text(
                    "Data from TMDb, Watchmode, and OMDb. Not affiliated with any provider.",
                    fontSize = 11.sp,
                    color = Theme.TextMuted,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().padding(top = 12.dp)
                )
            }
        }
    }
}

@Composable
private fun Hero() {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth().padding(top = 12.dp)
    ) {
        Text(
            "Find where to watch",
            fontSize = 30.sp,
            fontWeight = FontWeight.Bold,
            color = Theme.TextPrimary,
            textAlign = TextAlign.Center
        )
        Text(
            "Search any title and we’ll show ratings, cast, and which streaming service has it in your country.",
            fontSize = 13.sp,
            color = Theme.TextSecondary,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
private fun AdvancedSearchCta(onClick: () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier
            .fillMaxWidth()
            .cardStyle()
            .background(Theme.Surface)
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 11.dp)
    ) {
        Icon(Icons.Default.Tune, contentDescription = null, tint = Theme.TextPrimary, modifier = Modifier.size(18.dp))
        Text("Advanced search", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Theme.TextPrimary)
        Spacer(Modifier.weight(1f))
        Icon(
            Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = null,
            tint = Theme.TextMuted
        )
    }
}

// 3-column static grid (inside a scrolling column, so no LazyVerticalGrid).
@Composable
fun TitleGrid(
    results: List<DiscoverResult>,
    onOpen: (DiscoverResult) -> Unit,
    columns: Int = 3
) {
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        results.chunked(columns).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                row.forEach { result ->
                    PosterCard(
                        result,
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onOpen(result) }
                    )
                }
                repeat(columns - row.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}

// 5-across compact posters, like the ios recents row.
@Composable
private fun RecentsGrid(results: List<DiscoverResult>, onOpen: (DiscoverResult) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        results.chunked(5).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                row.forEach { result ->
                    Column(
                        Modifier
                            .weight(1f)
                            .clickable { onOpen(result) }
                    ) {
                        RemoteImage(
                            url = result.posterUrl,
                            contentDescription = result.title,
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(2f / 3f)
                                .clip(RoundedCornerShape(8.dp))
                        )
                        Text(
                            result.title,
                            fontSize = 10.sp,
                            color = Theme.TextSecondary,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
                repeat(5 - row.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}
