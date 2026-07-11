package com.khaledsamir.reelseek.ui.watchlist

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.khaledsamir.reelseek.ui.DetailRoute
import com.khaledsamir.reelseek.ui.components.PosterCard
import com.khaledsamir.reelseek.ui.reelseekApp
import com.khaledsamir.reelseek.ui.theme.Theme
import kotlinx.coroutines.launch

// Mirrors ios WatchlistView: grid of saved titles, long-press to remove.
@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun WatchlistScreen(navController: NavController) {
    val app = reelseekApp()
    val scope = rememberCoroutineScope()
    val items by app.database.watchlistDao().observeAll()
        .collectAsState(initial = emptyList())

    Column(Modifier.fillMaxSize().background(Theme.Bg)) {
        TopAppBar(
            title = { Text("Watchlist", fontWeight = FontWeight.SemiBold) },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = Theme.Bg,
                titleContentColor = Theme.TextPrimary
            )
        )

        if (items.isEmpty()) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterVertically),
                modifier = Modifier.fillMaxSize().padding(32.dp)
            ) {
                Icon(
                    Icons.Default.BookmarkBorder,
                    contentDescription = null,
                    tint = Theme.TextMuted,
                    modifier = Modifier.size(40.dp)
                )
                Text("Your watchlist is empty", fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = Theme.TextPrimary)
                Text(
                    "Add titles from the detail view to keep them here. Long-press a saved title to remove it.",
                    fontSize = 13.sp,
                    color = Theme.TextSecondary,
                    textAlign = TextAlign.Center
                )
            }
        } else {
            Column(
                verticalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 14.dp)
            ) {
                items.chunked(3).forEach { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        row.forEach { item ->
                            val result = item.toDiscoverResult()
                            PosterCard(
                                result,
                                modifier = Modifier
                                    .weight(1f)
                                    .combinedClickable(
                                        onClick = {
                                            navController.navigate(
                                                DetailRoute(
                                                    tmdbId = result.tmdbId,
                                                    mediaType = result.mediaType.key,
                                                    title = result.title,
                                                    posterUrl = result.posterUrl,
                                                    releaseYear = result.releaseYear
                                                )
                                            )
                                        },
                                        onLongClick = {
                                            scope.launch {
                                                app.database.watchlistDao().delete(item.compositeKey)
                                            }
                                        }
                                    )
                            )
                        }
                        repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
                    }
                }
            }
        }
    }
}
