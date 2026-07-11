package com.khaledsamir.reelseek.ui.about

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.PlayCircle
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.khaledsamir.reelseek.BuildConfig
import com.khaledsamir.reelseek.ui.components.SectionHeader
import com.khaledsamir.reelseek.ui.theme.Theme

// Mirrors ios AboutView: attribution, required TMDb notice, privacy, version.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AboutScreen(navController: NavController) {
    val uriHandler = LocalUriHandler.current

    Column(Modifier.fillMaxSize().background(Theme.Bg)) {
        TopAppBar(
            title = { Text("About", fontWeight = FontWeight.SemiBold) },
            navigationIcon = {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Theme.TextPrimary)
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = Theme.Bg,
                titleContentColor = Theme.TextPrimary
            )
        )

        Column(
            verticalArrangement = Arrangement.spacedBy(22.dp),
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(20.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                Box(
                    Modifier
                        .size(64.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Theme.Surface2),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.PlayCircle,
                        contentDescription = null,
                        tint = Theme.Accent,
                        modifier = Modifier.size(36.dp)
                    )
                }
                Column {
                    Text("ReelSeek", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Theme.TextPrimary)
                    Text("Find what to watch.", fontSize = 13.sp, color = Theme.TextSecondary)
                }
            }

            Section("About") {
                Text(
                    "ReelSeek helps you find where to watch any movie or TV show in your country, with ratings, cast, and live availability across major streaming providers.",
                    fontSize = 14.sp,
                    color = Theme.TextSecondary
                )
            }

            Section("Data sources") {
                Attribution(
                    "The Movie Database (TMDb)",
                    "Title metadata, ratings, cast, posters, and streaming-provider mappings.",
                    "https://www.themoviedb.org/",
                    uriHandler::openUri
                )
                Attribution(
                    "OMDb",
                    "IMDb ratings.",
                    "https://www.omdbapi.com/",
                    uriHandler::openUri
                )
                Attribution(
                    "Watchmode",
                    "Supplemental streaming availability data.",
                    "https://watchmode.com/",
                    uriHandler::openUri
                )
            }

            Section("Required notice") {
                Text(
                    "This product uses the TMDb API but is not endorsed or certified by TMDb.",
                    fontSize = 13.sp,
                    color = Theme.TextSecondary,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Theme.Surface2)
                        .padding(10.dp)
                )
            }

            Section("Privacy") {
                Bullet("No account, no sign-in, no analytics, no third-party SDKs.")
                Bullet("Your watchlist is stored only on this device.")
                Bullet("Search queries go to our own server, which proxies TMDb. We do not retain personal data.")
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier
                        .clickable { uriHandler.openUri("https://ksmozn.github.io/MovieStreaming/privacy") }
                        .padding(top = 4.dp)
                ) {
                    Icon(Icons.Default.OpenInNew, contentDescription = null, tint = Theme.Accent, modifier = Modifier.size(14.dp))
                    Text("Full privacy policy", fontSize = 13.sp, color = Theme.Accent)
                }
            }

            Section("Version") {
                Text(
                    "v${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})",
                    fontSize = 14.sp,
                    color = Theme.TextSecondary
                )
            }
        }
    }
}

@Composable
private fun Section(title: String, content: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        SectionHeader(title)
        content()
    }
}

@Composable
private fun Attribution(name: String, blurb: String, url: String, onOpen: (String) -> Unit) {
    Column(
        verticalArrangement = Arrangement.spacedBy(4.dp),
        modifier = Modifier.clickable { onOpen(url) }
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(name, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = Theme.TextPrimary)
            Icon(Icons.Default.OpenInNew, contentDescription = null, tint = Theme.TextMuted, modifier = Modifier.size(12.dp))
        }
        Text(blurb, fontSize = 13.sp, color = Theme.TextSecondary)
    }
}

@Composable
private fun Bullet(text: String) {
    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        Text("•", fontSize = 13.sp, color = Theme.TextMuted)
        Text(text, fontSize = 13.sp, color = Theme.TextSecondary)
    }
}
