package com.khaledsamir.reelseek.ui.search

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.khaledsamir.reelseek.model.MediaTypeFilter
import com.khaledsamir.reelseek.model.SortKey
import com.khaledsamir.reelseek.network.ApiConfig
import com.khaledsamir.reelseek.ui.DetailRoute
import com.khaledsamir.reelseek.ui.home.TitleGrid
import com.khaledsamir.reelseek.ui.reelseekApp
import com.khaledsamir.reelseek.ui.theme.Theme
import com.khaledsamir.reelseek.viewmodel.SearchViewModel

// Mirrors ios SearchView / web Advanced Search: optional title + filters-driven
// discover with chips, warnings, results grid, pagination.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(navController: NavController) {
    val app = reelseekApp()
    val viewModel: SearchViewModel = viewModel { SearchViewModel(app.api, app.countryPrefs) }
    var showFilters by remember { mutableStateOf(false) }

    Column(Modifier.fillMaxSize().background(Theme.Bg)) {
        TopAppBar(
            title = { Text("Search", fontWeight = FontWeight.SemiBold) },
            actions = {
                IconButton(onClick = { showFilters = true }) {
                    Icon(Icons.Default.Tune, contentDescription = "Filters", tint = Theme.Accent)
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = Theme.Bg,
                titleContentColor = Theme.TextPrimary
            )
        )

        Column(
            verticalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp)
                .padding(bottom = 24.dp)
        ) {
            QueryBar(viewModel)
            ActiveFiltersStrip(viewModel)

            viewModel.errorMessage?.let {
                Text(
                    it,
                    fontSize = 13.sp,
                    color = Color(0xFFEF4444),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFEF4444).copy(alpha = 0.1f))
                        .padding(10.dp)
                )
            }

            if (viewModel.warnings.isNotEmpty()) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFF97316).copy(alpha = 0.08f))
                        .padding(10.dp)
                ) {
                    viewModel.warnings.forEach {
                        Text("⚠ $it", fontSize = 12.sp, color = Color(0xFFF97316))
                    }
                }
            }

            if (viewModel.totalResults > 0) {
                Text(
                    "${viewModel.totalResults} matches · page ${viewModel.query.page} of ${viewModel.totalPages}",
                    fontSize = 12.sp,
                    color = Theme.TextMuted
                )
            }

            if (viewModel.results.isEmpty() && !viewModel.isLoading) {
                EmptyState { showFilters = true }
            } else {
                TitleGrid(viewModel.results, onOpen = { result ->
                    navController.navigate(
                        DetailRoute(
                            tmdbId = result.tmdbId,
                            mediaType = result.mediaType.key,
                            title = result.title,
                            posterUrl = result.posterUrl,
                            releaseYear = result.releaseYear
                        )
                    )
                })
            }

            when {
                viewModel.isLoading ->
                    Box(Modifier.fillMaxWidth().padding(vertical = 16.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Theme.Accent)
                    }
                viewModel.results.isNotEmpty() && viewModel.query.page < viewModel.totalPages ->
                    OutlinedButton(
                        onClick = { viewModel.nextPage() },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Theme.Accent),
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    ) {
                        Text("Load more")
                    }
            }
        }
    }

    if (showFilters) {
        FiltersSheet(viewModel, onDismiss = { showFilters = false })
    }
}

@Composable
private fun QueryBar(viewModel: SearchViewModel) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier
                .weight(1f)
                .clip(RoundedCornerShape(Theme.CardCornerRadius))
                .background(Theme.Surface)
                .padding(10.dp)
        ) {
            Icon(Icons.Default.Search, contentDescription = null, tint = Theme.TextMuted, modifier = Modifier.size(18.dp))
            BasicTextField(
                value = viewModel.query.name,
                onValueChange = { viewModel.query = viewModel.query.copy(name = it) },
                singleLine = true,
                textStyle = TextStyle(color = Theme.TextPrimary, fontSize = 15.sp),
                cursorBrush = SolidColor(Theme.Accent),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(onSearch = { viewModel.runSearch() }),
                decorationBox = { innerTextField ->
                    if (viewModel.query.name.isEmpty()) {
                        Text("Title (optional)", color = Theme.TextMuted, fontSize = 15.sp)
                    }
                    innerTextField()
                },
                modifier = Modifier.weight(1f)
            )
            if (viewModel.query.name.isNotEmpty()) {
                IconButton(
                    onClick = { viewModel.query = viewModel.query.copy(name = "") },
                    modifier = Modifier.size(20.dp)
                ) {
                    Icon(Icons.Default.Cancel, contentDescription = "Clear", tint = Theme.TextMuted)
                }
            }
        }
        Button(
            onClick = { viewModel.runSearch() },
            colors = ButtonDefaults.buttonColors(containerColor = Theme.Accent, contentColor = Theme.Bg)
        ) {
            Text("Go", fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun ActiveFiltersStrip(viewModel: SearchViewModel) {
    val chips = buildList {
        val q = viewModel.query
        if (q.year.isNotEmpty()) add("Year: ${q.year}")
        if (q.genreIds.isNotEmpty()) add("${q.genreIds.size} genre(s)")
        q.provider?.let { add(it.displayName) }
        if (q.voteGte.isNotEmpty()) add("≥ ${q.voteGte} ★")
        if (viewModel.selectedPersonName.isNotEmpty()) add("with ${viewModel.selectedPersonName}")
        if (q.mediaType != MediaTypeFilter.BOTH) add(q.mediaType.label)
        if (q.country != ApiConfig.DEFAULT_COUNTRY) add("📍 ${q.country}")
        if (q.sortBy != SortKey.DEFAULT) add(q.sortBy.label)
    }
    if (chips.isEmpty()) return

    Row(
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        modifier = Modifier.horizontalScroll(rememberScrollState())
    ) {
        chips.forEach { chip ->
            Text(
                chip,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Theme.TextSecondary,
                modifier = Modifier
                    .clip(CircleShape)
                    .background(Theme.Surface2)
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            )
        }
        Text(
            "✕ Clear",
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = Color(0xFFEF4444),
            modifier = Modifier
                .clip(CircleShape)
                .clickable { viewModel.reset() }
                .padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

@Composable
private fun EmptyState(onOpenFilters: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier.fillMaxWidth().padding(32.dp)
    ) {
        Icon(Icons.Default.Tune, contentDescription = null, tint = Theme.TextMuted, modifier = Modifier.size(32.dp))
        Text(
            "Open filters to narrow by genre, provider, year, rating, sort order, or cast member. Title is optional.",
            fontSize = 13.sp,
            color = Theme.TextSecondary,
            textAlign = TextAlign.Center
        )
        Button(
            onClick = onOpenFilters,
            colors = ButtonDefaults.buttonColors(containerColor = Theme.Accent, contentColor = Theme.Bg)
        ) {
            Text("Open filters")
        }
    }
}
