package com.khaledsamir.reelseek.ui.person

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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.khaledsamir.reelseek.model.Person
import com.khaledsamir.reelseek.ui.DetailRoute
import com.khaledsamir.reelseek.ui.components.MediaBadge
import com.khaledsamir.reelseek.ui.components.RatingBadge
import com.khaledsamir.reelseek.ui.components.RemoteImage
import com.khaledsamir.reelseek.ui.reelseekApp
import com.khaledsamir.reelseek.ui.theme.Theme
import com.khaledsamir.reelseek.viewmodel.PersonViewModel

// Mirrors the web /person/[personId] page: profile, bio, filmography grid.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PersonScreen(navController: NavController, personId: Int) {
    val app = reelseekApp()
    val viewModel: PersonViewModel = viewModel { PersonViewModel(app.api) }

    LaunchedEffect(personId) { viewModel.load(personId) }

    Column(Modifier.fillMaxSize().background(Theme.Bg)) {
        TopAppBar(
            title = { Text(viewModel.person?.name ?: "", fontWeight = FontWeight.SemiBold) },
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

        val person = viewModel.person
        when {
            person != null -> PersonContent(person, navController)
            viewModel.isLoading ->
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
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

@Composable
private fun PersonContent(person: Person, navController: NavController) {
    val uriHandler = LocalUriHandler.current

    Column(
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
            .padding(bottom = 24.dp)
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            RemoteImage(
                url = person.profileUrl,
                contentDescription = person.name,
                modifier = Modifier
                    .width(120.dp)
                    .aspectRatio(2f / 3f)
                    .clip(RoundedCornerShape(Theme.CornerRadius))
            )
            Column(verticalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.weight(1f)) {
                Text(person.name, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Theme.TextPrimary)
                person.knownForDepartment?.let {
                    InfoLine("Known for", it)
                }
                lifespanLine(person)?.let { InfoLine("Born", it) }
                person.placeOfBirth?.let { InfoLine("From", it) }
                person.imdbId?.let { imdbId ->
                    Text(
                        "IMDb · View on IMDb ↗",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Theme.Bg,
                        modifier = Modifier
                            .padding(top = 4.dp)
                            .clip(RoundedCornerShape(6.dp))
                            .background(Theme.Accent)
                            .clickable { uriHandler.openUri("https://www.imdb.com/name/$imdbId/") }
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }
        }

        if (person.biography.isNotEmpty()) {
            Text(person.biography, fontSize = 14.sp, color = Theme.TextSecondary)
        }

        Text(
            buildString {
                append("Filmography (")
                append(person.credits.size)
                append(")")
            },
            fontSize = 17.sp,
            fontWeight = FontWeight.SemiBold,
            color = Theme.TextPrimary
        )

        if (person.credits.isEmpty()) {
            Text("No credits found.", fontSize = 13.sp, color = Theme.TextSecondary)
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                person.credits.chunked(3).forEach { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        row.forEach { credit ->
                            Column(
                                Modifier
                                    .weight(1f)
                                    .clickable {
                                        navController.navigate(
                                            DetailRoute(
                                                tmdbId = credit.tmdbId,
                                                mediaType = credit.mediaType.key,
                                                title = credit.title,
                                                posterUrl = credit.posterUrl,
                                                releaseYear = credit.releaseYear
                                            )
                                        )
                                    }
                            ) {
                                Box(
                                    Modifier
                                        .fillMaxWidth()
                                        .aspectRatio(2f / 3f)
                                        .clip(RoundedCornerShape(Theme.CardCornerRadius))
                                ) {
                                    RemoteImage(
                                        url = credit.posterUrl,
                                        contentDescription = credit.title,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                    MediaBadge(
                                        credit.mediaType,
                                        modifier = Modifier.align(Alignment.TopStart).padding(4.dp)
                                    )
                                    credit.voteAverage?.let {
                                        RatingBadge(
                                            it,
                                            modifier = Modifier.align(Alignment.BottomEnd).padding(4.dp)
                                        )
                                    }
                                }
                                Text(
                                    credit.title,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Theme.TextPrimary,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis,
                                    modifier = Modifier.padding(top = 4.dp)
                                )
                                Text(
                                    credit.releaseYear ?: "—",
                                    fontSize = 11.sp,
                                    color = Theme.TextMuted
                                )
                                credit.character?.takeIf { it.isNotBlank() }?.let {
                                    Text(
                                        "as $it",
                                        fontSize = 11.sp,
                                        color = Theme.TextMuted,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }
                        }
                        repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
                    }
                }
            }
        }
    }
}

@Composable
private fun InfoLine(label: String, value: String) {
    Row {
        Text("$label: ", fontSize = 13.sp, color = Theme.TextMuted)
        Text(value, fontSize = 13.sp, color = Theme.TextSecondary)
    }
}

// Same age/lifespan math as the web person page.
private fun lifespanLine(person: Person): String? {
    val birthday = person.birthday ?: return null
    val birthYear = birthday.take(4).toIntOrNull() ?: return null
    return if (person.deathday != null) {
        val deathYear = person.deathday.take(4).toIntOrNull()
        val aged = deathYear?.let { it - birthYear }
        "$birthday – ${person.deathday}" + (aged?.let { " (aged $it)" } ?: "")
    } else {
        val currentYear = java.util.Calendar.getInstance().get(java.util.Calendar.YEAR)
        "$birthday (age ${currentYear - birthYear})"
    }
}
