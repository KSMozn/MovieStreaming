package com.khaledsamir.reelseek.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khaledsamir.reelseek.model.DiscoverResult
import com.khaledsamir.reelseek.model.MediaType
import com.khaledsamir.reelseek.network.ReelseekApi
import com.khaledsamir.reelseek.ui.theme.Theme
import kotlinx.coroutines.delay

// Mirrors ios SearchBarField / web SearchBar: 300ms debounce against
// /api/movies/search with a dropdown of title rows.
@Composable
fun SearchBarField(
    api: ReelseekApi,
    onPick: (DiscoverResult) -> Unit,
    modifier: Modifier = Modifier
) {
    var text by remember { mutableStateOf("") }
    var results by remember { mutableStateOf<List<DiscoverResult>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(text) {
        val trimmed = text.trim()
        if (trimmed.isEmpty()) {
            results = emptyList()
            isLoading = false
            errorMessage = null
            return@LaunchedEffect
        }
        delay(300)
        isLoading = true
        errorMessage = null
        try {
            results = api.searchMovies(trimmed)
        } catch (e: Exception) {
            errorMessage = e.message ?: "Search failed."
        } finally {
            isLoading = false
        }
    }

    Column(modifier) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(Theme.CornerRadius))
                .background(Theme.Surface)
                .padding(horizontal = 14.dp, vertical = 13.dp)
        ) {
            Icon(Icons.Default.Search, contentDescription = null, tint = Theme.TextMuted, modifier = Modifier.size(18.dp))
            BasicTextField(
                value = text,
                onValueChange = { text = it },
                singleLine = true,
                textStyle = TextStyle(color = Theme.TextPrimary, fontSize = 15.sp),
                cursorBrush = SolidColor(Theme.Accent),
                decorationBox = { innerTextField ->
                    if (text.isEmpty()) {
                        Text(
                            "Search a movie… e.g. Inception",
                            color = Theme.TextMuted,
                            fontSize = 15.sp
                        )
                    }
                    innerTextField()
                },
                modifier = Modifier
                    .weight(1f)
                    .padding(start = 8.dp)
            )
            if (text.isNotEmpty()) {
                IconButton(onClick = { text = "" }, modifier = Modifier.size(20.dp)) {
                    Icon(Icons.Default.Cancel, contentDescription = "Clear", tint = Theme.TextMuted)
                }
            }
        }

        if (text.isNotEmpty()) {
            Column(
                Modifier
                    .fillMaxWidth()
                    .padding(top = 6.dp)
                    .clip(RoundedCornerShape(Theme.CornerRadius))
                    .background(Theme.Surface)
            ) {
                val message = when {
                    errorMessage != null -> errorMessage
                    isLoading && results.isEmpty() -> "Searching…"
                    results.isEmpty() -> "No results for “$text”."
                    else -> null
                }
                if (message != null) {
                    Text(
                        message,
                        fontSize = 13.sp,
                        color = if (errorMessage != null) Theme.Accent else Theme.TextSecondary,
                        modifier = Modifier.padding(12.dp)
                    )
                } else {
                    results.take(8).forEachIndexed { index, result ->
                        ResultRow(result) { onPick(result) }
                        if (index < minOf(results.size, 8) - 1) {
                            HorizontalDivider(color = Theme.Border)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ResultRow(result: DiscoverResult, onClick: () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 10.dp, vertical = 8.dp)
    ) {
        RemoteImage(
            url = result.posterUrl,
            modifier = Modifier
                .size(width = 36.dp, height = 50.dp)
                .clip(RoundedCornerShape(4.dp))
        )
        Column(Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    result.title,
                    fontSize = 14.sp,
                    color = Theme.TextPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f, fill = false)
                )
                Text(
                    if (result.mediaType == MediaType.TV) "TV" else "MOVIE",
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp,
                    color = if (result.mediaType == MediaType.TV) androidx.compose.ui.graphics.Color(0xFF22C55E)
                    else androidx.compose.ui.graphics.Color(0xFF3B82F6),
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(
                            (if (result.mediaType == MediaType.TV) androidx.compose.ui.graphics.Color(0xFF22C55E)
                            else androidx.compose.ui.graphics.Color(0xFF3B82F6)).copy(alpha = 0.20f)
                        )
                        .padding(horizontal = 5.dp, vertical = 1.dp)
                )
            }
            Text(result.releaseYear ?: "—", fontSize = 11.sp, color = Theme.TextMuted)
        }
    }
}
