package com.khaledsamir.reelseek.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khaledsamir.reelseek.model.MediaType
import com.khaledsamir.reelseek.ui.theme.Theme

@Composable
fun MediaBadge(mediaType: MediaType, modifier: Modifier = Modifier) {
    Text(
        text = if (mediaType == MediaType.TV) "TV" else "MOVIE",
        fontSize = 9.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 0.5.sp,
        color = Theme.Bg,
        modifier = modifier
            .clip(CircleShape)
            .background(if (mediaType == MediaType.TV) Color(0xFF22C55E).copy(alpha = 0.85f) else Color(0xFF3B82F6).copy(alpha = 0.85f))
            .padding(horizontal = 6.dp, vertical = 2.dp)
    )
}

@Composable
fun RatingBadge(voteAverage: Double, modifier: Modifier = Modifier) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
            .clip(CircleShape)
            .background(Theme.Bg.copy(alpha = 0.8f))
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(
            text = "★ " + "%.1f".format(voteAverage),
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = Theme.Accent
        )
    }
}

@Composable
fun SectionHeader(title: String, modifier: Modifier = Modifier) {
    Text(
        text = title.uppercase(),
        fontSize = 11.sp,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = 1.4.sp,
        color = Theme.TextMuted,
        modifier = modifier
    )
}
