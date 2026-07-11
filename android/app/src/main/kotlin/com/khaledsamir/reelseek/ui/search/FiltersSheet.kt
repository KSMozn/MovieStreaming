package com.khaledsamir.reelseek.ui.search

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khaledsamir.reelseek.model.MediaTypeFilter
import com.khaledsamir.reelseek.model.ProviderKey
import com.khaledsamir.reelseek.model.SortKey
import com.khaledsamir.reelseek.network.ApiConfig
import com.khaledsamir.reelseek.ui.components.RemoteImage
import com.khaledsamir.reelseek.ui.components.SectionHeader
import com.khaledsamir.reelseek.ui.theme.Theme
import com.khaledsamir.reelseek.viewmodel.SearchViewModel

// Mirrors ios FiltersSheet, but with the website's fixed EG/SA/AE country list
// instead of free text.
@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun FiltersSheet(viewModel: SearchViewModel, onDismiss: () -> Unit) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Theme.Surface
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(18.dp),
            modifier = Modifier
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                TextButton(onClick = { viewModel.reset() }) {
                    Text("Reset", color = Theme.TextSecondary)
                }
                Spacer(Modifier.weight(1f))
                Text("Filters", fontWeight = FontWeight.SemiBold, color = Theme.TextPrimary)
                Spacer(Modifier.weight(1f))
                Button(
                    onClick = {
                        viewModel.runSearch()
                        onDismiss()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Theme.Accent, contentColor = Theme.Bg)
                ) {
                    Text("Search", fontWeight = FontWeight.Bold)
                }
            }

            FilterSection("Sort by") {
                DropdownSelector(
                    current = viewModel.query.sortBy.label,
                    options = SortKey.entries.map { it.label },
                    onSelect = { index ->
                        viewModel.query = viewModel.query.copy(sortBy = SortKey.entries[index])
                    }
                )
            }

            FilterSection("Type") {
                SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
                    MediaTypeFilter.entries.forEachIndexed { index, filter ->
                        SegmentedButton(
                            selected = viewModel.query.mediaType == filter,
                            onClick = { viewModel.query = viewModel.query.copy(mediaType = filter) },
                            shape = SegmentedButtonDefaults.itemShape(index, MediaTypeFilter.entries.size),
                            colors = SegmentedButtonDefaults.colors(
                                activeContainerColor = Theme.Accent.copy(alpha = 0.18f),
                                activeContentColor = Theme.Accent,
                                inactiveContainerColor = Theme.Surface2,
                                inactiveContentColor = Theme.TextPrimary
                            )
                        ) {
                            Text(filter.label)
                        }
                    }
                }
            }

            FilterSection("Provider") {
                DropdownSelector(
                    current = viewModel.query.provider?.displayName ?: "Any",
                    options = listOf("Any") + ProviderKey.entries.map { it.displayName },
                    onSelect = { index ->
                        viewModel.query = viewModel.query.copy(
                            provider = if (index == 0) null else ProviderKey.entries[index - 1]
                        )
                    }
                )
            }

            FilterSection("Country") {
                DropdownSelector(
                    current = ApiConfig.COUNTRIES
                        .firstOrNull { it.first == viewModel.query.country }?.second
                        ?: viewModel.query.country,
                    options = ApiConfig.COUNTRIES.map { it.second },
                    onSelect = { index ->
                        viewModel.query = viewModel.query.copy(
                            country = ApiConfig.COUNTRIES[index].first
                        )
                    }
                )
            }

            FilterSection("Year") {
                FilterTextField(
                    value = viewModel.query.year,
                    placeholder = "e.g. 2024",
                    keyboardType = KeyboardType.Number,
                    onChange = { viewModel.query = viewModel.query.copy(year = it) }
                )
            }

            FilterSection("Minimum rating") {
                FilterTextField(
                    value = viewModel.query.voteGte,
                    placeholder = "0–10 ★",
                    keyboardType = KeyboardType.Decimal,
                    onChange = { viewModel.query = viewModel.query.copy(voteGte = it) }
                )
            }

            FilterSection("Genres") {
                if (viewModel.genres.isEmpty()) {
                    Text("Loading genres…", color = Theme.TextMuted, fontSize = 13.sp)
                } else {
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        viewModel.genres.forEach { genre ->
                            val selected = genre.id in viewModel.query.genreIds
                            Text(
                                genre.name,
                                fontSize = 12.sp,
                                fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
                                color = if (selected) Theme.Accent else Theme.TextPrimary,
                                modifier = Modifier
                                    .clip(CircleShape)
                                    .background(if (selected) Theme.Accent.copy(alpha = 0.18f) else Theme.Surface2)
                                    .clickable {
                                        viewModel.query = viewModel.query.copy(
                                            genreIds = if (selected) viewModel.query.genreIds - genre.id
                                            else viewModel.query.genreIds + genre.id
                                        )
                                    }
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                    }
                }
            }

            FilterSection("Actor / cast member") {
                PersonPicker(viewModel)
            }
        }
    }
}

@Composable
private fun FilterSection(title: String, content: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SectionHeader(title)
        content()
    }
}

@Composable
private fun DropdownSelector(
    current: String,
    options: List<String>,
    onSelect: (Int) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    Column {
        Text(
            current,
            fontSize = 14.sp,
            color = Theme.TextPrimary,
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(Theme.CardCornerRadius))
                .background(Theme.Surface2)
                .clickable { expanded = true }
                .padding(horizontal = 12.dp, vertical = 10.dp)
        )
        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            options.forEachIndexed { index, option ->
                DropdownMenuItem(
                    text = { Text(option) },
                    onClick = {
                        onSelect(index)
                        expanded = false
                    }
                )
            }
        }
    }
}

@Composable
private fun FilterTextField(
    value: String,
    placeholder: String,
    keyboardType: KeyboardType,
    onChange: (String) -> Unit
) {
    BasicTextField(
        value = value,
        onValueChange = onChange,
        singleLine = true,
        textStyle = TextStyle(color = Theme.TextPrimary, fontSize = 14.sp),
        cursorBrush = SolidColor(Theme.Accent),
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        decorationBox = { innerTextField ->
            Row(
                Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(Theme.CardCornerRadius))
                    .background(Theme.Surface2)
                    .padding(horizontal = 12.dp, vertical = 10.dp)
            ) {
                if (value.isEmpty()) {
                    Text(placeholder, color = Theme.TextMuted, fontSize = 14.sp)
                }
                innerTextField()
            }
        }
    )
}

@Composable
private fun PersonPicker(viewModel: SearchViewModel) {
    var personQuery by remember { mutableStateOf("") }

    if (viewModel.selectedPersonName.isNotEmpty()) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(Theme.CardCornerRadius))
                .background(Theme.Surface2)
                .padding(horizontal = 12.dp, vertical = 8.dp)
        ) {
            Icon(Icons.Default.Person, contentDescription = null, tint = Theme.TextPrimary, modifier = Modifier.size(18.dp))
            Text(viewModel.selectedPersonName, color = Theme.TextPrimary, fontSize = 14.sp, modifier = Modifier.weight(1f))
            IconButton(onClick = { viewModel.clearPerson() }, modifier = Modifier.size(22.dp)) {
                Icon(Icons.Default.Cancel, contentDescription = "Clear person", tint = Theme.TextMuted)
            }
        }
    } else {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            FilterTextField(
                value = personQuery,
                placeholder = "Search person…",
                keyboardType = KeyboardType.Text,
                onChange = {
                    personQuery = it
                    viewModel.searchPerson(it)
                }
            )
            viewModel.personResults.forEach { person ->
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            viewModel.selectPerson(person)
                            personQuery = ""
                        }
                        .padding(vertical = 4.dp)
                ) {
                    RemoteImage(
                        url = person.profileUrl,
                        modifier = Modifier.size(32.dp).clip(CircleShape)
                    )
                    Column {
                        Text(person.name, color = Theme.TextPrimary, fontSize = 14.sp)
                        person.knownForDepartment?.let {
                            Text(it, color = Theme.TextMuted, fontSize = 11.sp)
                        }
                    }
                }
            }
        }
    }
}
