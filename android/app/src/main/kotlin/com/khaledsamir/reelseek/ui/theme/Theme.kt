package com.khaledsamir.reelseek.ui.theme

import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

// Official ReelSeek palette — mirrors the web brand tokens in src/app/globals.css.
object Theme {
    val Bg = Color(0xFF0D1B2A)
    val Surface = Color(0xFF222831)
    val Surface2 = Color(0xFF2B3440)
    val Border = Color(0xFF364252)
    val Accent = Color(0xFFF5A623) // Warm Amber
    val TextPrimary = Color(0xFFF7F8FA)
    val TextSecondary = Color.White.copy(alpha = 0.65f)
    val TextMuted = Color.White.copy(alpha = 0.42f)

    val CornerRadius = 12.dp
    val CardCornerRadius = 10.dp
}

private val ReelseekColorScheme = darkColorScheme(
    primary = Theme.Accent,
    onPrimary = Theme.Bg,
    background = Theme.Bg,
    onBackground = Theme.TextPrimary,
    surface = Theme.Surface,
    onSurface = Theme.TextPrimary,
    surfaceVariant = Theme.Surface2,
    onSurfaceVariant = Theme.TextSecondary,
    surfaceContainer = Theme.Surface,
    surfaceContainerHigh = Theme.Surface2,
    surfaceContainerHighest = Theme.Surface2,
    outline = Theme.Border,
    outlineVariant = Theme.Border
)

// The app is dark-only, matching the website and the iOS app.
@Composable
fun ReelseekTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = ReelseekColorScheme,
        content = content
    )
}

fun Modifier.cardStyle(): Modifier = this
    .clip(RoundedCornerShape(Theme.CardCornerRadius))
    .border(1.dp, Theme.Border, RoundedCornerShape(Theme.CardCornerRadius))
