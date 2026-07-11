package com.khaledsamir.reelseek.ui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khaledsamir.reelseek.model.DiscoverResult
import com.khaledsamir.reelseek.ui.theme.Theme

// Mirrors ios PosterCard.swift: 2:3 poster, media + rating badges, title, year.
@Composable
fun PosterCard(result: DiscoverResult, modifier: Modifier = Modifier) {
    Column(modifier) {
        Box(
            Modifier
                .fillMaxWidth()
                .aspectRatio(2f / 3f)
                .clip(RoundedCornerShape(Theme.CardCornerRadius))
        ) {
            RemoteImage(
                url = result.posterUrl,
                contentDescription = result.title,
                modifier = Modifier.fillMaxWidth().aspectRatio(2f / 3f)
            )
            MediaBadge(
                mediaType = result.mediaType,
                modifier = Modifier.align(Alignment.TopStart).padding(6.dp)
            )
            result.voteAverage?.let {
                RatingBadge(
                    voteAverage = it,
                    modifier = Modifier.align(Alignment.TopEnd).padding(6.dp)
                )
            }
        }
        Text(
            text = result.title,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            color = Theme.TextPrimary,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.padding(top = 6.dp)
        )
        Text(
            text = result.releaseYear ?: "—",
            fontSize = 10.sp,
            color = Theme.TextMuted,
            modifier = Modifier.padding(top = 2.dp)
        )
    }
}
