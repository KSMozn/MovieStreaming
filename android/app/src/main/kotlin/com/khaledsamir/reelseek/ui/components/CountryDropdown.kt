package com.khaledsamir.reelseek.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khaledsamir.reelseek.network.ApiConfig
import com.khaledsamir.reelseek.ui.theme.Theme

// Compact country selector used on Detail and in Filters. A dropdown scales to
// every supported country, unlike a segmented control.
@Composable
fun CountryDropdown(
    selected: String,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }
    val label = ApiConfig.COUNTRIES.firstOrNull { it.first == selected }?.second ?: selected

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
            .clip(RoundedCornerShape(Theme.CardCornerRadius))
            .background(Theme.Surface2)
            .clickable { expanded = true }
            .padding(horizontal = 10.dp, vertical = 8.dp)
    ) {
        Text(label, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = Theme.Accent)
        Icon(
            Icons.Default.ArrowDropDown,
            contentDescription = "Choose country",
            tint = Theme.Accent,
            modifier = Modifier.size(20.dp)
        )
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            ApiConfig.COUNTRIES.forEach { (code, name) ->
                DropdownMenuItem(
                    text = { Text(name) },
                    onClick = {
                        onSelect(code)
                        expanded = false
                    }
                )
            }
        }
    }
}
