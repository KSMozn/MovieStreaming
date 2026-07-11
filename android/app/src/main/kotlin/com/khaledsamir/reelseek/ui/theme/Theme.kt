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

// Exact match to the web Tailwind tokens in /tailwind.config.ts (same as ios Theme.swift).
object Theme {
    val Bg = Color(0xFF0B0D12)
    val Surface = Color(0xFF141821)
    val Surface2 = Color(0xFF1C2230)
    val Border = Color(0xFF262D3D)
    val Accent = Color(0xFFF5C518) // IMDb yellow
    val TextPrimary = Color(0xFFE6E8EE)
    val TextSecondary = Color.White.copy(alpha = 0.62f)
    val TextMuted = Color.White.copy(alpha = 0.40f)

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
