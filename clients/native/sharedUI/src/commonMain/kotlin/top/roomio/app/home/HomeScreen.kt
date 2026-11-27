package top.roomio.app.home

import top.roomio.app.components.WatchPartyIcons
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
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
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import watchparty.sharedui.generated.resources.Res
import watchparty.sharedui.generated.resources.choose_name
import watchparty.sharedui.generated.resources.create_party
import watchparty.sharedui.generated.resources.edit_profile
import watchparty.sharedui.generated.resources.friends_no_owner
import watchparty.sharedui.generated.resources.friends_count
import watchparty.sharedui.generated.resources.join_with_code
import watchparty.sharedui.generated.resources.return_to_last_room
import watchparty.sharedui.generated.resources.last_room
import watchparty.sharedui.generated.resources.open_party_manager
import watchparty.sharedui.generated.resources.rejoin_as_owner
import watchparty.sharedui.generated.resources.stream_and_chill
import watchparty.sharedui.generated.resources.settings
import watchparty.sharedui.generated.resources.report_bug
import top.roomio.app.room.BugReportDialog
import top.roomio.app.room.RoomAction
import watchparty.sharedui.generated.resources.theme
import watchparty.sharedui.generated.resources.watching_as
import watchparty.sharedui.generated.resources.your_room_is_waiting
import top.roomio.app.theme.AppTheme
import top.roomio.app.theme.LocalThemeIsDark
import top.roomio.app.theme.WatchPartyDesignSystem
import top.roomio.app.theme.WatchPartyTheme
import top.roomio.app.profile.ProfileAvatar

@Immutable
internal data class HomeRoomPreview(
    val title: String,
    val friendCount: Int,
    val returnable: Boolean,
    val code: String = "",
)

internal val returnableHomeRoom = HomeRoomPreview(
    title = "Friday night screening",
    friendCount = 2,
    returnable = true,
)

private val recentRoom = HomeRoomPreview(
    title = "Mira's late show",
    friendCount = 4,
    returnable = false,
)

@Composable
internal fun HomeScreen(
    state: HomeUiState = HomeUiState(),
    onAction: (HomeAction) -> Unit = {},
    modifier: Modifier = Modifier,
) {
    if (state.report.bugReportOpen) BugReportDialog(state.report) { onAction(HomeAction.Report(it)) }
    var isDark by LocalThemeIsDark.current

    Scaffold(
        modifier = modifier.windowInsetsPadding(WindowInsets.safeDrawing),
    ) { contentPadding ->
        BoxWithConstraints(
            modifier = Modifier
                .fillMaxSize()
                .padding(contentPadding)
                .verticalScroll(rememberScrollState()),
        ) {
            val expanded = maxWidth >= 840.dp
            val mediumOrWider = maxWidth >= 600.dp
            val horizontalPadding = if (mediumOrWider) {
                WatchPartyDesignSystem.spacing.medium
            } else {
                WatchPartyDesignSystem.spacing.small
            }

            Column(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .widthIn(max = if (expanded) 1040.dp else 720.dp)
                    .fillMaxWidth(),
            ) {
                HomeControls(
                    isDark = isDark,
                    onReport = { onAction(HomeAction.Report(RoomAction.BugReportClicked)) },
                    onSettings = { onAction(HomeAction.SettingsClicked) },
                    onToggleTheme = { isDark = !isDark },
                    modifier = Modifier.padding(horizontal = horizontalPadding, vertical = WatchPartyDesignSystem.spacing.extraSmall),
                )
                if (expanded) {
                    Row(
                        modifier = Modifier
                            .widthIn(max = 1040.dp)
                            .fillMaxWidth()
                            .padding(
                                horizontal = horizontalPadding,
                                vertical = WatchPartyDesignSystem.spacing.extraLarge,
                            ),
                        horizontalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.large),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        HomeStage(
                            identityName = state.identityName,
                            identityAvatar = state.identityAvatar,
                            actionsHorizontal = true,
                            onSettings = { onAction(HomeAction.SettingsClicked) },
                            onCreate = { onAction(HomeAction.CreatePartyClicked) },
                            onJoin = { onAction(HomeAction.JoinPartyClicked) },
                            modifier = Modifier.weight(1.45f),
                        )
                        if (state.roomPreview != null) {
                            HomeRoomCard(
                                room = state.roomPreview,
                                expanded = true,
                                onClick = { onAction(HomeAction.OpenRoomClicked) },
                                modifier = Modifier.weight(.75f),
                            )
                        }
                    }
                } else {
                    Column(
                        modifier = Modifier
                            .widthIn(max = 720.dp)
                            .fillMaxWidth()
                            .padding(horizontal = horizontalPadding, vertical = WatchPartyDesignSystem.spacing.medium),
                        verticalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.large),
                    ) {
                        HomeStage(
                            identityName = state.identityName,
                            identityAvatar = state.identityAvatar,
                            actionsHorizontal = mediumOrWider,
                            onSettings = { onAction(HomeAction.SettingsClicked) },
                            onCreate = { onAction(HomeAction.CreatePartyClicked) },
                            onJoin = { onAction(HomeAction.JoinPartyClicked) },
                        )
                        if (state.roomPreview != null) {
                            HomeRoomCard(
                                room = state.roomPreview,
                                expanded = false,
                                onClick = { onAction(HomeAction.OpenRoomClicked) },
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun HomeControls(
    isDark: Boolean,
    onReport: () -> Unit,
    onSettings: () -> Unit,
    onToggleTheme: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.extraSmall, Alignment.End),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        HomeIconButton(
            icon = WatchPartyIcons.BugReport,
            label = stringResource(Res.string.report_bug),
            onClick = onReport,
        )
        HomeIconButton(
            icon = if (isDark) WatchPartyIcons.LightMode else WatchPartyIcons.DarkMode,
            label = stringResource(Res.string.theme),
            onClick = onToggleTheme,
        )
        HomeIconButton(
            icon = WatchPartyIcons.Settings,
            label = stringResource(Res.string.settings),
            onClick = onSettings,
        )
    }
}

@Composable
private fun HomeIconButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    onClick: () -> Unit,
) {
    IconButton(
        onClick = onClick,
        modifier = Modifier.size(48.dp).semantics { contentDescription = label },
    ) {
        Icon(icon, contentDescription = null, modifier = Modifier.size(24.dp))
    }
}

@Composable
private fun HomeStage(
    identityName: String,
    identityAvatar: ProfileAvatar,
    actionsHorizontal: Boolean,
    onSettings: () -> Unit,
    onCreate: () -> Unit,
    onJoin: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.large),
    ) {
        Text(
            text = stringResource(Res.string.stream_and_chill),
            style = MaterialTheme.typography.displaySmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.semantics { heading() },
        )
        IdentityPill(
            identityName = identityName,
            identityAvatar = identityAvatar,
            onSettings = onSettings,
        )
        if (actionsHorizontal) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                CreatePartyButton(onClick = onCreate, modifier = Modifier.weight(1f))
                JoinPartyButton(onClick = onJoin, modifier = Modifier.weight(1f))
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                CreatePartyButton(onClick = onCreate)
                JoinPartyButton(onClick = onJoin)
            }
        }
    }
}

@Composable
private fun IdentityPill(
    identityName: String,
    identityAvatar: ProfileAvatar,
    onSettings: () -> Unit,
) {
    Surface(
        modifier = Modifier.fillMaxWidth().heightIn(min = 100.dp),
        shape = WatchPartyDesignSystem.shapes.extraLargeIncreased,
        color = MaterialTheme.colorScheme.primaryContainer,
        contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
    ) {
        Row(
            modifier = Modifier.padding(start = 16.dp, top = 12.dp, end = 12.dp, bottom = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.small),
        ) {
            Image(
                painter = painterResource(identityAvatar.resource),
                contentDescription = identityName,
                modifier = Modifier
                    .size(76.dp)
                    .clip(CircleShape)
                    .border(2.dp, MaterialTheme.colorScheme.surfaceContainerLowest, CircleShape),
                contentScale = ContentScale.Crop,
            )
            Column(Modifier.weight(1f)) {
                Text(
                    text = stringResource(Res.string.watching_as),
                    style = MaterialTheme.typography.labelMedium,
                )
                Text(
                    text = identityName.ifBlank { stringResource(Res.string.choose_name) },
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            HomeIconButton(
                icon = WatchPartyIcons.Settings,
                label = stringResource(Res.string.edit_profile),
                onClick = onSettings,
            )
        }
    }
}

@Composable
private fun CreatePartyButton(onClick: () -> Unit, modifier: Modifier = Modifier) {
    Button(
        onClick = onClick,
        modifier = modifier.fillMaxWidth().heightIn(min = 58.dp),
    ) {
        Icon(WatchPartyIcons.Add, contentDescription = null, modifier = Modifier.size(20.dp))
        Spacer(Modifier.width(WatchPartyDesignSystem.spacing.extraSmall))
        Text(stringResource(Res.string.create_party))
    }
}

@Composable
private fun JoinPartyButton(onClick: () -> Unit, modifier: Modifier = Modifier) {
    FilledTonalButton(
        onClick = onClick,
        modifier = modifier.fillMaxWidth().heightIn(min = 58.dp),
    ) {
        Icon(WatchPartyIcons.LocalActivity, contentDescription = null, modifier = Modifier.size(20.dp))
        Spacer(Modifier.width(WatchPartyDesignSystem.spacing.extraSmall))
        Text(stringResource(Res.string.join_with_code))
    }
}

@Composable
private fun HomeRoomCard(
    room: HomeRoomPreview,
    expanded: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val containerColor = if (room.returnable) {
        MaterialTheme.colorScheme.tertiaryContainer
    } else {
        MaterialTheme.colorScheme.surfaceContainerLow
    }
    val contentColor = if (room.returnable) {
        MaterialTheme.colorScheme.onTertiaryContainer
    } else {
        MaterialTheme.colorScheme.onSurface
    }
    val outlineColor = if (room.returnable) {
        MaterialTheme.colorScheme.tertiary
    } else {
        MaterialTheme.colorScheme.outlineVariant
    }

    Surface(
        modifier = modifier.fillMaxWidth().border(1.dp, outlineColor, MaterialTheme.shapes.medium),
        shape = MaterialTheme.shapes.medium,
        color = containerColor,
        contentColor = contentColor,
    ) {
        if (expanded) {
            Column(
                modifier = Modifier.padding(WatchPartyDesignSystem.spacing.small),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                MiniCinemaScene(
                    modifier = Modifier.fillMaxWidth().aspectRatio(16f / 10f),
                )
                RoomCardDetails(room = room, onClick = onClick)
            }
        } else {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                MiniCinemaScene(
                    modifier = Modifier.width(96.dp).aspectRatio(4f / 3f),
                )
                RoomCardDetails(room = room, onClick = onClick, modifier = Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun RoomCardDetails(
    room: HomeRoomPreview,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.extraSmall),
    ) {
        Column(Modifier.weight(1f)) {
            Text(
                text = stringResource(Res.string.last_room).uppercase(),
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = if (room.returnable) {
                    MaterialTheme.colorScheme.onTertiaryContainer
                } else {
                    MaterialTheme.colorScheme.primary
                },
            )
            Text(
                text = room.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = if (room.code.isNotBlank()) {
                    room.code
                } else if (room.returnable) {
                    stringResource(Res.string.friends_no_owner, room.friendCount)
                } else {
                    stringResource(Res.string.friends_count, room.friendCount)
                },
                style = MaterialTheme.typography.bodyMedium,
            )
        }
        IconButton(onClick = onClick, modifier = Modifier.size(48.dp)) {
            Icon(
                WatchPartyIcons.ArrowForward,
                contentDescription = stringResource(Res.string.return_to_last_room),
            )
        }
    }
}

@Composable
private fun CrownIcon(
    contentDescription: String,
    modifier: Modifier = Modifier,
) {
    val color = MaterialTheme.colorScheme.onSecondaryContainer
    Canvas(
        modifier = modifier
            .size(24.dp)
            .semantics { this.contentDescription = contentDescription },
    ) {
        drawCrown(color)
    }
}

private fun DrawScope.drawCrown(color: Color) {
    val crown = Path().apply {
        moveTo(size.width * .17f, size.height * .33f)
        lineTo(size.width * .36f, size.height * .53f)
        lineTo(size.width * .50f, size.height * .25f)
        lineTo(size.width * .64f, size.height * .53f)
        lineTo(size.width * .83f, size.height * .33f)
        lineTo(size.width * .75f, size.height * .72f)
        lineTo(size.width * .25f, size.height * .72f)
        close()
    }
    drawPath(crown, color)
    drawLine(
        color = color,
        start = Offset(size.width * .25f, size.height * .82f),
        end = Offset(size.width * .75f, size.height * .82f),
        strokeWidth = size.width * .09f,
        cap = StrokeCap.Round,
    )
}

@Composable
private fun MiniCinemaScene(modifier: Modifier = Modifier) {
    val colors = WatchPartyDesignSystem.colors
    Canvas(
        modifier = modifier
            .clip(MaterialTheme.shapes.medium)
            .background(colors.sceneSky),
    ) {
        drawCircle(
            color = colors.scenePlanet,
            radius = size.minDimension * .075f,
            center = Offset(size.width * .89f, size.height * .16f),
        )

        val back = Path().apply {
            moveTo(-size.width * .05f, size.height)
            lineTo(size.width * .20f, size.height * .57f)
            lineTo(size.width * .42f, size.height * .82f)
            lineTo(size.width * .65f, size.height * .49f)
            lineTo(size.width * 1.05f, size.height * .77f)
            lineTo(size.width * 1.05f, size.height)
            close()
        }
        drawPath(back, colors.sceneRidgeBack)

        val front = Path().apply {
            moveTo(-size.width * .05f, size.height)
            lineTo(size.width * .20f, size.height * .79f)
            lineTo(size.width * .42f, size.height)
            lineTo(size.width * .65f, size.height * .72f)
            lineTo(size.width * 1.05f, size.height)
            close()
        }
        drawPath(front, colors.sceneRidgeFront)
    }
}

@Preview(name = "Home · compact", widthDp = 412, heightDp = 920)
@Composable
private fun HomeCompactPreview() = AppTheme(onThemeChanged = {}) {
    HomeScreen()
}

@Preview(name = "Home · expanded", widthDp = 1280, heightDp = 800)
@Composable
private fun HomeExpandedPreview() = AppTheme(onThemeChanged = {}) {
    HomeScreen()
}

@Preview(name = "Home · dark", widthDp = 412, heightDp = 920)
@Composable
private fun HomeDarkPreview() = WatchPartyTheme(darkTheme = true) {
    HomeScreen()
}

@Preview(name = "Home · large text", widthDp = 412, heightDp = 920, fontScale = 1.5f)
@Composable
private fun HomeLargeTextPreview() = AppTheme(onThemeChanged = {}) {
    HomeScreen(
        state = HomeUiState(
            identityName = "",
            roomPreview = recentRoom,
        ),
    )
}
