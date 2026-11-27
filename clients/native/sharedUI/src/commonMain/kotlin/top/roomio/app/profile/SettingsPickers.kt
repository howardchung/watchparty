package top.roomio.app.profile

import top.roomio.app.components.WatchPartyIcons
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import org.jetbrains.compose.resources.stringResource
import watchparty.sharedui.generated.resources.*
import top.roomio.app.theme.WatchPartyDesignSystem
import top.roomio.app.theme.WatchPartyLightColorScheme
import top.roomio.app.theme.label
import top.roomio.app.theme.seed
import top.roomio.domain.profile.AppLanguage
import top.roomio.domain.profile.ThemeColor

@Composable
internal fun SettingsColorGarden(selected: ThemeColor, onSelect: (ThemeColor) -> Unit) {
    val pickerLabel = stringResource(Res.string.color_theme)
    Column(verticalArrangement = Arrangement.spacedBy(24.dp)) {
        Surface(shape = MaterialTheme.shapes.extraLarge,
            color = MaterialTheme.colorScheme.secondaryContainer,
            contentColor = MaterialTheme.colorScheme.onSecondaryContainer) {
            Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Icon(WatchPartyIcons.Palette, contentDescription = null)
                Column(Modifier.weight(1f)) {
                    Text(stringResource(Res.string.settings_current_color), style = MaterialTheme.typography.labelMedium)
                    Text(stringResource(selected.label), style = MaterialTheme.typography.titleLarge)
                }
                Box(Modifier.size(40.dp).background(selected.seed ?: WatchPartyLightColorScheme.primary, CircleShape)
                    .border(1.dp, MaterialTheme.colorScheme.outline, CircleShape))
            }
        }
        BoxWithConstraints(Modifier.fillMaxWidth().heightIn(max = 560.dp)
            .verticalScroll(rememberScrollState()).padding(4.dp).selectableGroup().semantics { contentDescription = pickerLabel }) {
            val gap = 8.dp
            val columns = maxOf(1, ((maxWidth + gap) / (112.dp + gap)).toInt())
            val itemWidth = (maxWidth - gap * (columns - 1)) / columns
            FlowRow(Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(gap), verticalArrangement = Arrangement.spacedBy(gap),
                maxItemsInEachRow = columns) {
                ThemeColor.entries.forEach { color ->
                    val isSelected = color == selected
                    Surface(modifier = Modifier.width(itemWidth).heightIn(min = 144.dp)
                        .selectable(selected = isSelected, role = Role.RadioButton, onClick = { onSelect(color) }),
                        shape = if (isSelected) MaterialTheme.shapes.extraLarge else MaterialTheme.shapes.large,
                        color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceContainerLow,
                        contentColor = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface,
                        border = if (isSelected) BorderStroke(2.dp, MaterialTheme.colorScheme.primary) else null) {
                        Column(Modifier.padding(horizontal = 8.dp, vertical = 12.dp), horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterVertically)) {
                            val swatchShape = if (isSelected) MaterialTheme.shapes.large else CircleShape
                            Box(Modifier.size(56.dp).background(color.seed ?: WatchPartyLightColorScheme.primary, swatchShape)
                                .border(1.dp, MaterialTheme.colorScheme.outline, swatchShape))
                            Text(stringResource(color.label), style = MaterialTheme.typography.labelLarge, textAlign = TextAlign.Center)
                            Box(Modifier.size(24.dp).background(if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent, CircleShape),
                                contentAlignment = Alignment.Center) {
                                if (isSelected) Icon(WatchPartyIcons.Check, null, Modifier.size(18.dp), tint = MaterialTheme.colorScheme.onPrimary)
                            }
                        }
                    }
                }
            }
        }
    }
}

private val AppLanguage.nativeName: String get() = if (this == AppLanguage.PERSIAN) "فارسی" else "English"

@Composable
private fun AppLanguage.translatedName(): String = stringResource(
    if (this == AppLanguage.PERSIAN) Res.string.settings_persian else Res.string.settings_english,
)

@Composable
internal fun SettingsLanguagePicker(value: AppLanguage, onSelect: (AppLanguage) -> Unit) {
    var open by remember { mutableStateOf(false) }
    var pending by remember { mutableStateOf(value) }
    var search by remember { mutableStateOf("") }
    val label = stringResource(Res.string.app_language)
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val compact = maxWidth < 600.dp
        val compactDialogWidth = maxWidth + 32.dp
        Surface(onClick = { pending = value; search = ""; open = true },
            modifier = Modifier.fillMaxWidth().semantics { contentDescription = label },
            shape = MaterialTheme.shapes.extraLarge, color = MaterialTheme.colorScheme.surfaceContainerHigh) {
            Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Surface(shape = MaterialTheme.shapes.large, color = MaterialTheme.colorScheme.tertiaryContainer,
                    contentColor = MaterialTheme.colorScheme.onTertiaryContainer) {
                    Box(Modifier.size(56.dp), contentAlignment = Alignment.Center) { Icon(WatchPartyIcons.Language, null) }
                }
                Column(Modifier.weight(1f)) {
                    Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(value.nativeName, style = MaterialTheme.typography.titleLarge)
                }
                Icon(WatchPartyIcons.ExpandMore, null)
            }
        }
        if (open) Dialog(onDismissRequest = { open = false }, properties = DialogProperties(usePlatformDefaultWidth = false)) {
            BoxWithConstraints(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Surface(modifier = Modifier.align(if (compact) Alignment.BottomCenter else Alignment.Center)
                    .padding(if (compact) 0.dp else 16.dp).widthIn(max = if (compact) compactDialogWidth else 560.dp).fillMaxWidth().heightIn(max = maxHeight * .92f),
                    shape = if (compact) androidx.compose.foundation.shape.RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp)
                        else MaterialTheme.shapes.extraLarge,
                    color = MaterialTheme.colorScheme.surfaceContainerHigh) {
                    Column {
                        Row(Modifier.fillMaxWidth().padding(start = 24.dp, top = 16.dp, end = 8.dp, bottom = 8.dp),
                            verticalAlignment = Alignment.CenterVertically) {
                            Text(stringResource(Res.string.settings_language_title), Modifier.weight(1f),
                                style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                            IconButton(onClick = { open = false }) { Icon(WatchPartyIcons.Close, stringResource(Res.string.close)) }
                        }
                        val query = search.trim().lowercase()
                        val filtered = AppLanguage.entries.filter {
                            val names = if (it == AppLanguage.PERSIAN) "فارسی persian farsi fa" else "English انگلیسی en"
                            names.lowercase().contains(query)
                        }
                        Column(Modifier.weight(1f, fill = false).verticalScroll(rememberScrollState()).padding(horizontal = 24.dp),
                            verticalArrangement = Arrangement.spacedBy(16.dp)) {
                            val searchLabel = stringResource(Res.string.settings_language_search)
                            TextField(value = search, onValueChange = { search = it }, singleLine = true,
                                modifier = Modifier.fillMaxWidth().semantics { contentDescription = searchLabel }, shape = CircleShape,
                                colors = TextFieldDefaults.colors(focusedContainerColor = MaterialTheme.colorScheme.surfaceContainerHighest,
                                    unfocusedContainerColor = MaterialTheme.colorScheme.surfaceContainerHighest,
                                    focusedIndicatorColor = Color.Transparent, unfocusedIndicatorColor = Color.Transparent),
                                placeholder = { Text(stringResource(Res.string.settings_language_search_placeholder)) },
                                leadingIcon = { Icon(WatchPartyIcons.Search, null) },
                                trailingIcon = if (search.isNotEmpty()) ({
                                    IconButton(onClick = { search = "" }) { Icon(WatchPartyIcons.Close, stringResource(Res.string.settings_clear_search)) }
                                }) else null)
                            if (filtered.isEmpty()) {
                                Text(stringResource(Res.string.settings_no_languages))
                                TextButton(onClick = { search = "" }) { Text(stringResource(Res.string.settings_show_languages)) }
                            } else Column(Modifier.selectableGroup(), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                filtered.forEachIndexed { index, language ->
                                    val isSelected = pending == language
                                    Surface(modifier = Modifier.fillMaxWidth().selectable(selected = isSelected, role = Role.RadioButton,
                                        onClick = { pending = language }),
                                        shape = if (isSelected) MaterialTheme.shapes.extraLarge else RoundedCornerShape(
                                            topStart = if (index == 0) 28.dp else 4.dp, topEnd = if (index == 0) 28.dp else 4.dp,
                                            bottomStart = if (index == filtered.lastIndex) 28.dp else 4.dp, bottomEnd = if (index == filtered.lastIndex) 28.dp else 4.dp),
                                        color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceContainerLow,
                                        contentColor = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface,
                                        border = if (isSelected) BorderStroke(2.dp, MaterialTheme.colorScheme.primary) else null) {
                                        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                            Surface(shape = MaterialTheme.shapes.large, color = MaterialTheme.colorScheme.secondaryContainer,
                                                contentColor = MaterialTheme.colorScheme.onSecondaryContainer) {
                                                Box(Modifier.size(48.dp), contentAlignment = Alignment.Center) {
                                                    Text(if (language == AppLanguage.PERSIAN) "آ" else "A", style = MaterialTheme.typography.headlineSmall)
                                                }
                                            }
                                            Column(Modifier.weight(1f)) {
                                                Text(language.nativeName, style = MaterialTheme.typography.titleLarge)
                                                Text(language.translatedName(), style = MaterialTheme.typography.bodyMedium)
                                            }
                                            Box(Modifier.size(24.dp).border(1.dp, LocalContentColor.current, CircleShape), contentAlignment = Alignment.Center) {
                                                if (isSelected) Icon(WatchPartyIcons.Check, null, Modifier.size(18.dp))
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        FlowRow(Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 16.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            TextButton(onClick = { open = false }) { Text(stringResource(Res.string.cancel)) }
                            Button(onClick = { onSelect(pending); open = false }) {
                                Text(stringResource(Res.string.settings_use_language, pending.nativeName))
                            }
                        }
                    }
                }
            }
        }
    }
}
