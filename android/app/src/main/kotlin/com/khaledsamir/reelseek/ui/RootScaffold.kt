package com.khaledsamir.reelseek.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import com.khaledsamir.reelseek.ReelseekApp
import com.khaledsamir.reelseek.model.MediaType
import com.khaledsamir.reelseek.ui.about.AboutScreen
import com.khaledsamir.reelseek.ui.detail.DetailScreen
import com.khaledsamir.reelseek.ui.home.HomeScreen
import com.khaledsamir.reelseek.ui.person.PersonScreen
import com.khaledsamir.reelseek.ui.search.SearchScreen
import com.khaledsamir.reelseek.ui.theme.Theme
import com.khaledsamir.reelseek.ui.watchlist.WatchlistScreen
import kotlinx.serialization.Serializable

@Serializable object HomeRoute
@Serializable object SearchRoute
@Serializable object WatchlistRoute
@Serializable object AboutRoute

@Serializable
data class DetailRoute(
    val tmdbId: Int,
    val mediaType: String,
    // Prefetched fields shown while details load (ios `prefetched: DiscoverResult?`).
    val title: String? = null,
    val posterUrl: String? = null,
    val releaseYear: String? = null
) {
    val mediaTypeEnum: MediaType get() = MediaType.fromKey(mediaType)
}

@Serializable
data class PersonRoute(val personId: Int)

@Composable
fun reelseekApp(): ReelseekApp =
    LocalContext.current.applicationContext as ReelseekApp

private data class Tab(val route: Any, val label: String, val icon: ImageVector)

// Equivalent of ios RootTabView: bottom bar Home/Search/Watchlist + nav stack.
@Composable
fun RootScaffold() {
    val navController = rememberNavController()
    val tabs = listOf(
        Tab(HomeRoute, "Home", Icons.Default.Home),
        Tab(SearchRoute, "Search", Icons.Default.Search),
        Tab(WatchlistRoute, "Watchlist", Icons.Default.Bookmark)
    )

    Scaffold(
        containerColor = Theme.Bg,
        bottomBar = {
            val backStackEntry by navController.currentBackStackEntryAsState()
            val destination = backStackEntry?.destination
            NavigationBar(containerColor = Theme.Surface) {
                tabs.forEach { tab ->
                    val selected = when (tab.route) {
                        is HomeRoute -> destination?.hasRoute<HomeRoute>() == true
                        is SearchRoute -> destination?.hasRoute<SearchRoute>() == true
                        else -> destination?.hasRoute<WatchlistRoute>() == true
                    }
                    NavigationBarItem(
                        selected = selected,
                        onClick = {
                            navController.navigate(tab.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = { Text(tab.label) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Theme.Accent,
                            selectedTextColor = Theme.Accent,
                            indicatorColor = Theme.Surface2,
                            unselectedIconColor = Theme.TextMuted,
                            unselectedTextColor = Theme.TextMuted
                        )
                    )
                }
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = HomeRoute,
            modifier = Modifier.padding(padding)
        ) {
            composable<HomeRoute> {
                HomeScreen(navController)
            }
            composable<SearchRoute> {
                SearchScreen(navController)
            }
            composable<WatchlistRoute> {
                WatchlistScreen(navController)
            }
            composable<DetailRoute> { entry ->
                DetailScreen(navController, entry.toRoute<DetailRoute>())
            }
            composable<PersonRoute> { entry ->
                PersonScreen(navController, entry.toRoute<PersonRoute>().personId)
            }
            composable<AboutRoute> {
                AboutScreen(navController)
            }
        }
    }
}
