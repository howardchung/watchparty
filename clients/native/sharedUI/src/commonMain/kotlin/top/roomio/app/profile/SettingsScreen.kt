package top.roomio.app.profile

import top.roomio.app.components.WatchPartyIcons
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import watchparty.sharedui.generated.resources.color_theme
import watchparty.sharedui.generated.resources.color_save_error
import androidx.compose.foundation.Image
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import watchparty.sharedui.generated.resources.Res
import watchparty.sharedui.generated.resources.app_language
import watchparty.sharedui.generated.resources.avatar
import watchparty.sharedui.generated.resources.avatar_description
import watchparty.sharedui.generated.resources.back
import watchparty.sharedui.generated.resources.choose_an_avatar
import watchparty.sharedui.generated.resources.english
import watchparty.sharedui.generated.resources.language
import watchparty.sharedui.generated.resources.language_description
import watchparty.sharedui.generated.resources.profile_preview
import watchparty.sharedui.generated.resources.ready_to_watch
import watchparty.sharedui.generated.resources.save_profile
import watchparty.sharedui.generated.resources.save_profile_error
import watchparty.sharedui.generated.resources.theme
import watchparty.sharedui.generated.resources.your_profile
import top.roomio.app.theme.AppTheme
import top.roomio.app.theme.LocalThemeIsDark
import top.roomio.app.theme.WatchPartyDesignSystem
import top.roomio.app.theme.WatchPartyTheme

@Composable
internal fun SettingsScreen(
    state: SettingsUiState,
    onAction: (SettingsAction) -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.surface,
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = { ProfileTopBar(onBack = { onAction(SettingsAction.BackClicked) }) },
        bottomBar = {
            SaveProfileBar(
                enabled = true,
                saveFailed = state.saveFailed,
                onSave = { onAction(SettingsAction.SaveClicked) },
            )
        },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .windowInsetsPadding(
                    WindowInsets.safeDrawing.only(WindowInsetsSides.Horizontal),
                )
                .padding(horizontal = 16.dp)
                .padding(top = 24.dp, bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Column(
                modifier = Modifier
                    .widthIn(max = 712.dp)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(32.dp),
            ) {
                ProfileSpotlight(
                    name = state.displayName,
                    avatar = state.draftAvatar,
                )
                ProfileSection(
                    number = "01",
                    title = stringResource(Res.string.avatar),
                    description = stringResource(Res.string.avatar_description),
                ) {
                    AvatarPicker(
                        selectedAvatar = state.draftAvatar,
                        onSelected = { onAction(SettingsAction.AvatarSelected(it)) },
                    )
                }
                ProfileSection(
                    number = "02",
                    title = stringResource(Res.string.color_theme),
                ) {
                    SettingsColorGarden(state.themeColor) { onAction(SettingsAction.ColorSelected(it)) }
                    if (state.colorSaveFailed) Text(stringResource(Res.string.color_save_error), color = MaterialTheme.colorScheme.error)
                }
                ProfileSection(
                    number = "03",
                    title = stringResource(Res.string.language),
                    description = stringResource(Res.string.language_description),
                    showDivider = false,
                ) {
                    SettingsLanguagePicker(state.draftLanguage) { onAction(SettingsAction.LanguageSelected(it)) }
                }
            }
        }
    }
}

@Composable
private fun ProfileTopBar(onBack: () -> Unit) {
    val themeIsDark = LocalThemeIsDark.current
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .windowInsetsPadding(
                WindowInsets.safeDrawing.only(
                    WindowInsetsSides.Horizontal + WindowInsetsSides.Top,
                ),
            ),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 72.dp),
            contentAlignment = Alignment.Center,
        ) {
            Row(
                modifier = Modifier
                    .widthIn(max = 1120.dp)
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = onBack, modifier = Modifier.size(48.dp)) {
                    Icon(
                        imageVector = WatchPartyIcons.ArrowBack,
                        contentDescription = stringResource(Res.string.back),
                    )
                }
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 4.dp),
                ) {
                    Text(
                        text = stringResource(Res.string.your_profile),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                    )
                }
                IconButton(
                    onClick = { themeIsDark.value = !themeIsDark.value },
                    modifier = Modifier.size(48.dp),
                ) {
                    Icon(
                        imageVector = if (themeIsDark.value) {
                            WatchPartyIcons.LightMode
                        } else {
                            WatchPartyIcons.DarkMode
                        },
                        contentDescription = stringResource(Res.string.theme),
                    )
                }
            }
        }
        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
    }
}

@Composable
private fun ProfileSpotlight(
    name: String,
    avatar: ProfileAvatar,
) {
    val previewLabel = stringResource(Res.string.profile_preview)
    val avatarDescription = name
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .semantics {
                contentDescription = "$previewLabel: $avatarDescription"
            },
        shape = WatchPartyDesignSystem.shapes.extraLargeIncreased,
        color = MaterialTheme.colorScheme.secondaryContainer,
        contentColor = MaterialTheme.colorScheme.onSecondaryContainer,
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            ProfileAvatarImage(
                avatar = avatar,
                description = avatarDescription,
                selected = false,
                baseArtworkSize = 76.dp,
                selectedArtworkSize = 76.dp,
            )
            Spacer(Modifier.width(16.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    text = stringResource(Res.string.ready_to_watch),
                    style = MaterialTheme.typography.labelMedium,
                )
                Text(
                    text = name,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                )
            }
        }
    }
}

@Composable
private fun ProfileSection(
    number: String,
    title: String,
    description: String? = null,
    showDivider: Boolean = true,
    content: @Composable () -> Unit,
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Surface(
                modifier = Modifier.size(width = 36.dp, height = 28.dp),
                shape = WatchPartyDesignSystem.shapes.full,
                color = MaterialTheme.colorScheme.tertiaryContainer,
                contentColor = MaterialTheme.colorScheme.onTertiaryContainer,
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = number,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
            Column(Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
                if (description != null) Text(
                    text = description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        content()
        if (showDivider) {
            HorizontalDivider(
                modifier = Modifier.padding(top = 16.dp),
                color = MaterialTheme.colorScheme.outlineVariant,
            )
        }
    }
}

@Composable
private fun AvatarPicker(
    selectedAvatar: ProfileAvatar,
    onSelected: (ProfileAvatar) -> Unit,
) {
    val pickerLabel = stringResource(Res.string.choose_an_avatar)
    BoxWithConstraints(modifier = Modifier.fillMaxWidth()) {
        val compact = maxWidth < 600.dp
        val columns = if (compact) 2 else 3
        val gap = if (compact) 8.dp else 16.dp
        val itemWidth = (maxWidth - gap * (columns - 1)) / columns
        FlowRow(
            modifier = Modifier
                .fillMaxWidth()
                .selectableGroup()
                .semantics { contentDescription = pickerLabel },
            horizontalArrangement = Arrangement.spacedBy(gap),
            verticalArrangement = Arrangement.spacedBy(gap),
            maxItemsInEachRow = columns,
        ) {
            ProfileAvatar.entries.forEach { avatar ->
                AvatarChoice(
                    avatar = avatar,
                    selected = avatar == selectedAvatar,
                    onClick = { onSelected(avatar) },
                    baseArtworkSize = minOf(itemWidth - 24.dp, 96.dp),
                    compact = compact,
                    selectedArtworkSize = 176.dp,
                    modifier = Modifier.width(if (avatar == selectedAvatar) itemWidth * 2 + gap else itemWidth),
                )
            }
        }
    }
}

@Composable
private fun AvatarChoice(
    avatar: ProfileAvatar,
    selected: Boolean,
    onClick: () -> Unit,
    baseArtworkSize: androidx.compose.ui.unit.Dp,
    selectedArtworkSize: androidx.compose.ui.unit.Dp,
    compact: Boolean,
    modifier: Modifier = Modifier,
) {
    val shape = if (selected) WatchPartyDesignSystem.shapes.extraExtraLarge else MaterialTheme.shapes.large
    Surface(
        modifier = modifier
            .heightIn(min = if (selected) 304.dp else 224.dp)
            .selectable(selected = selected, role = Role.RadioButton, onClick = onClick),
        shape = shape,
        color = if (selected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceContainerLow,
        contentColor = if (selected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface,
        border = BorderStroke(2.dp,
            if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant),
    ) {
        Column(
            modifier = Modifier.padding(horizontal = if (compact) 8.dp else 16.dp, vertical = if (compact) 12.dp else 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterVertically),
        ) {
            ProfileAvatarImage(
                avatar = avatar,
                description = avatar.localizedLabel,
                selected = selected,
                baseArtworkSize = baseArtworkSize,
                selectedArtworkSize = if (selected) selectedArtworkSize else baseArtworkSize,
            )
            Text(
                text = avatar.localizedLabel,
                style = if (selected) MaterialTheme.typography.headlineSmall else MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
            )
            if (selected) {
                Surface(shape = CircleShape, color = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary) {
                    Icon(WatchPartyIcons.Check, contentDescription = null, modifier = Modifier.size(32.dp).padding(6.dp))
                }
            }
        }
    }
}

@Composable
private fun ProfileAvatarImage(
    avatar: ProfileAvatar,
    description: String,
    selected: Boolean,
    baseArtworkSize: androidx.compose.ui.unit.Dp = 84.dp,
    selectedArtworkSize: androidx.compose.ui.unit.Dp = 96.dp,
) {
    val artworkSize by animateDpAsState(
        targetValue = if (selected) selectedArtworkSize else baseArtworkSize,
    )
    Image(
        painter = painterResource(avatar.resource),
        contentDescription = description,
        modifier = Modifier.size(artworkSize).clip(CircleShape)
            .border(2.dp, MaterialTheme.colorScheme.surfaceContainerLowest, CircleShape),
        contentScale = ContentScale.Crop,
    )
}

@Composable
private fun SaveProfileBar(
    enabled: Boolean,
    saveFailed: Boolean,
    onSave: () -> Unit,
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .windowInsetsPadding(
                WindowInsets.safeDrawing.only(
                    WindowInsetsSides.Horizontal + WindowInsetsSides.Bottom,
                ),
            ),
        color = MaterialTheme.colorScheme.surface,
        contentColor = MaterialTheme.colorScheme.onSurface,
    ) {
        Column {
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                contentAlignment = Alignment.Center,
            ) {
                Column(
                    modifier = Modifier
                        .widthIn(max = 728.dp)
                        .fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    if (saveFailed) {
                        Text(
                            text = stringResource(Res.string.save_profile_error),
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                    Button(
                        onClick = onSave,
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 48.dp),
                        enabled = enabled,
                    ) {
                        Text(stringResource(Res.string.save_profile))
                    }
                }
            }
        }
    }
}

@Preview(widthDp = 360, heightDp = 760)
@Composable
private fun SettingsCompactPreview() {
    AppTheme(onThemeChanged = {}) {
        SettingsScreen(
            state = SettingsUiState(ProfileAvatar.COMET),
            onAction = {},
        )
    }
}

@Preview(widthDp = 1205, heightDp = 805)
@Composable
private fun SettingsExpandedPreview() {
    AppTheme(onThemeChanged = {}) {
        SettingsScreen(
            state = SettingsUiState(ProfileAvatar.COMET),
            onAction = {},
        )
    }
}

@Preview(widthDp = 360, heightDp = 760, fontScale = 1.5f)
@Composable
private fun SettingsLargeTextPreview() {
    WatchPartyTheme(darkTheme = true) {
        SettingsScreen(
            state = SettingsUiState(ProfileAvatar.BERRY),
            onAction = {},
        )
    }
}

@Preview(widthDp = 360, heightDp = 760)
@Composable
private fun SettingsSaveErrorPreview() {
    AppTheme(onThemeChanged = {}) {
        SettingsScreen(
            state = SettingsUiState(
                draftAvatar = ProfileAvatar.COMET,
                saveFailed = true,
            ),
            onAction = {},
        )
    }
}
