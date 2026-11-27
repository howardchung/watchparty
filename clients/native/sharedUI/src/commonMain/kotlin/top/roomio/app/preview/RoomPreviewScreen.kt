package top.roomio.app.preview

import top.roomio.app.components.WatchPartyIcons
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
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
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import org.jetbrains.compose.resources.stringResource
import watchparty.sharedui.generated.resources.Res
import watchparty.sharedui.generated.resources.invite_preview_loading
import watchparty.sharedui.generated.resources.invite_preview_unavailable
import watchparty.sharedui.generated.resources.invite_preview_retry
import watchparty.sharedui.generated.resources.back
import watchparty.sharedui.generated.resources.check_party_before_joining
import watchparty.sharedui.generated.resources.ended
import watchparty.sharedui.generated.resources.full
import watchparty.sharedui.generated.resources.in_the_room
import watchparty.sharedui.generated.resources.join_party
import watchparty.sharedui.generated.resources.joining_unavailable
import watchparty.sharedui.generated.resources.no_owner_in_room
import watchparty.sharedui.generated.resources.not_now
import watchparty.sharedui.generated.resources.offline_message
import watchparty.sharedui.generated.resources.open
import watchparty.sharedui.generated.resources.owner
import watchparty.sharedui.generated.resources.owner_is_away
import watchparty.sharedui.generated.resources.owner_away_preview_copy
import watchparty.sharedui.generated.resources.party_ended_preview_copy
import watchparty.sharedui.generated.resources.party_full_preview_copy
import watchparty.sharedui.generated.resources.party_label
import watchparty.sharedui.generated.resources.people_count
import watchparty.sharedui.generated.resources.person_count
import watchparty.sharedui.generated.resources.playing_now
import watchparty.sharedui.generated.resources.request_failed
import watchparty.sharedui.generated.resources.room_preview
import watchparty.sharedui.generated.resources.stream
import watchparty.sharedui.generated.resources.theme
import watchparty.sharedui.generated.resources.waiting_to_start
import top.roomio.app.theme.AppTheme
import top.roomio.app.theme.LocalThemeIsDark
import top.roomio.app.theme.WatchPartyDesignSystem
import top.roomio.app.theme.WatchPartyTheme
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow

internal enum class RoomAvailability { AVAILABLE, FULL, ENDED }
internal enum class PreviewStreamStatus { PLAYING, WAITING }

@Immutable
internal data class RoomPreviewModel(
    val code: String,
    val title: String,
    val ownerName: String,
    val ownerPresent: Boolean,
    val participantCount: Int,
    val availability: RoomAvailability,
    val streamStatus: PreviewStreamStatus,
)

internal fun roomPreviewForCode(code: String): RoomPreviewModel? = when (code.trim().uppercase()) {
    "MOON-42" -> RoomPreviewModel(
        code = "MOON-42",
        title = "Mira's late show",
        ownerName = "Mira",
        ownerPresent = true,
        participantCount = 3,
        availability = RoomAvailability.AVAILABLE,
        streamStatus = PreviewStreamStatus.PLAYING,
    )
    "ORBIT-08" -> RoomPreviewModel(
        code = "ORBIT-08",
        title = "Orbit double feature",
        ownerName = "Mira",
        ownerPresent = false,
        participantCount = 2,
        availability = RoomAvailability.AVAILABLE,
        streamStatus = PreviewStreamStatus.PLAYING,
    )
    "FULL-10" -> RoomPreviewModel(
        code = "FULL-10",
        title = "The packed premiere",
        ownerName = "Sana",
        ownerPresent = true,
        participantCount = 10,
        availability = RoomAvailability.FULL,
        streamStatus = PreviewStreamStatus.PLAYING,
    )
    "ENDED-3" -> RoomPreviewModel(
        code = "ENDED-3",
        title = "Sunday shorts",
        ownerName = "Arman",
        ownerPresent = false,
        participantCount = 0,
        availability = RoomAvailability.ENDED,
        streamStatus = PreviewStreamStatus.WAITING,
    )
    else -> null
}

@Composable
internal fun RoomPreviewScreen(
    state: RoomPreviewUiState,
    onAction: (RoomPreviewAction) -> Unit,
    effects: Flow<RoomPreviewEffect> = emptyFlow(),
    modifier: Modifier = Modifier,
) {
    val snackbarHostState = remember { SnackbarHostState() }
    val offlineMessage = stringResource(Res.string.offline_message)
    val requestFailed = stringResource(Res.string.request_failed)
    LaunchedEffect(effects) {
        effects.collect { effect ->
            when (effect) {
                is RoomPreviewEffect.Error -> snackbarHostState.showSnackbar(
                    if (effect.connectivity) offlineMessage else requestFailed,
                )
                else -> Unit
            }
        }
    }
    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.surface,
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = { PreviewTopBar(onBack = { onAction(RoomPreviewAction.BackClicked) }) },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .windowInsetsPadding(
                    WindowInsets.safeDrawing.only(
                        WindowInsetsSides.Horizontal + WindowInsetsSides.Bottom,
                    ),
                )
                .padding(horizontal = 16.dp)
                .padding(top = 24.dp, bottom = 56.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            when {
                state.isLoading -> {
                    CircularProgressIndicator()
                    Text(
                        stringResource(Res.string.invite_preview_loading),
                        modifier = Modifier.padding(24.dp),
                    )
                }
                state.errorMessage != null -> {
                    PreviewNotice(
                        title = stringResource(Res.string.joining_unavailable),
                        body = stringResource(
                            if (state.isOffline) Res.string.offline_message
                            else Res.string.invite_preview_unavailable,
                        ),
                        unavailable = true,
                    )
                    Button(
                        onClick = { onAction(RoomPreviewAction.RetryClicked) },
                        modifier = Modifier.padding(top = 16.dp).heightIn(min = 48.dp),
                    ) { Text(stringResource(Res.string.invite_preview_retry)) }
                    TextButton(onClick = { onAction(RoomPreviewAction.BackClicked) }) {
                        Text(stringResource(Res.string.not_now))
                    }
                }
                else -> PreviewCard(
                    model = state.model,
                    onBack = { onAction(RoomPreviewAction.BackClicked) },
                    onJoin = { onAction(RoomPreviewAction.JoinClicked) },
                    modifier = Modifier
                        .widthIn(max = 672.dp)
                        .fillMaxWidth(),
                )
            }
        }
    }
}

@Composable
private fun PreviewTopBar(onBack: () -> Unit) {
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
                .height(72.dp),
            contentAlignment = Alignment.Center,
        ) {
            Row(
                modifier = Modifier
                    .widthIn(max = 1120.dp)
                    .fillMaxWidth()
                    .padding(horizontal = 28.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = onBack, modifier = Modifier.size(48.dp)) {
                    Icon(
                        WatchPartyIcons.ArrowBack,
                        contentDescription = stringResource(Res.string.back),
                    )
                }
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 8.dp),
                ) {
                    Text(
                        stringResource(Res.string.room_preview),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        stringResource(Res.string.check_party_before_joining),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                IconButton(
                    onClick = { themeIsDark.value = !themeIsDark.value },
                    modifier = Modifier.size(48.dp),
                ) {
                    Icon(
                        if (themeIsDark.value) WatchPartyIcons.LightMode else WatchPartyIcons.DarkMode,
                        contentDescription = stringResource(Res.string.theme),
                    )
                }
            }
        }
        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
    }
}

@Composable
private fun PreviewCard(
    model: RoomPreviewModel,
    onBack: () -> Unit,
    onJoin: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val canJoin = model.availability == RoomAvailability.AVAILABLE
    Surface(
        modifier = modifier,
        shape = WatchPartyDesignSystem.shapes.extraLargeIncreased,
        color = MaterialTheme.colorScheme.surfaceContainerLow,
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp),
        ) {
            PreviewCinemaScene(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp),
            )
            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = Alignment.Top,
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = stringResource(Res.string.party_label, model.code),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        text = model.title,
                        style = MaterialTheme.typography.headlineLarge,
                        fontWeight = FontWeight.Bold,
                    )
                }
                AvailabilityPill(model.availability)
            }
            PreviewFacts(model)
            if (!model.ownerPresent && canJoin) {
                PreviewNotice(
                    title = stringResource(Res.string.no_owner_in_room),
                    body = stringResource(Res.string.owner_away_preview_copy, model.ownerName),
                    unavailable = false,
                )
            }
            if (!canJoin) {
                PreviewNotice(
                    title = stringResource(Res.string.joining_unavailable),
                    body = stringResource(
                        if (model.availability == RoomAvailability.FULL) {
                            Res.string.party_full_preview_copy
                        } else {
                            Res.string.party_ended_preview_copy
                        },
                    ),
                    unavailable = true,
                )
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                TextButton(onClick = onBack) {
                    Text(stringResource(Res.string.not_now))
                }
                Button(
                    onClick = onJoin,
                    enabled = canJoin,
                    modifier = Modifier.heightIn(min = 48.dp),
                ) {
                    Icon(
                        WatchPartyIcons.ArrowForward,
                        contentDescription = null,
                    )
                    Spacer(Modifier.size(8.dp))
                    Text(stringResource(Res.string.join_party))
                }
            }
        }
    }
}

@Composable
private fun AvailabilityPill(availability: RoomAvailability) {
    val available = availability == RoomAvailability.AVAILABLE
    Surface(
        shape = WatchPartyDesignSystem.shapes.full,
        color = if (available) {
            MaterialTheme.colorScheme.secondaryContainer
        } else {
            MaterialTheme.colorScheme.errorContainer
        },
        contentColor = if (available) {
            MaterialTheme.colorScheme.onSecondaryContainer
        } else {
            MaterialTheme.colorScheme.onErrorContainer
        },
    ) {
        Text(
            text = stringResource(
                when (availability) {
                    RoomAvailability.AVAILABLE -> Res.string.open
                    RoomAvailability.FULL -> Res.string.full
                    RoomAvailability.ENDED -> Res.string.ended
                },
            ),
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
        )
    }
}

@Composable
private fun PreviewFacts(model: RoomPreviewModel) {
    BoxWithConstraints(modifier = Modifier.fillMaxWidth()) {
        val compact = maxWidth < 560.dp
        val facts = listOf(
            Triple(
                WatchPartyIcons.MeetingRoom,
                stringResource(Res.string.owner),
                if (model.ownerPresent) {
                    model.ownerName
                } else {
                    stringResource(Res.string.owner_is_away, model.ownerName)
                },
            ),
            Triple(
                WatchPartyIcons.Groups,
                stringResource(Res.string.in_the_room),
                stringResource(
                    if (model.participantCount == 1) {
                        Res.string.person_count
                    } else {
                        Res.string.people_count
                    },
                    model.participantCount,
                ),
            ),
            Triple(
                WatchPartyIcons.Schedule,
                stringResource(Res.string.stream),
                stringResource(
                    if (model.streamStatus == PreviewStreamStatus.PLAYING) {
                        Res.string.playing_now
                    } else {
                        Res.string.waiting_to_start
                    },
                ),
            ),
        )
        if (compact) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                facts.forEach { (icon, label, value) ->
                    PreviewFact(icon, label, value)
                }
            }
        } else {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                facts.forEach { (icon, label, value) ->
                    PreviewFact(icon, label, value, Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
private fun PreviewFact(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.heightIn(min = 88.dp),
        shape = WatchPartyDesignSystem.shapes.largeIncreased,
        color = MaterialTheme.colorScheme.surfaceContainerLowest,
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(icon, contentDescription = null, modifier = Modifier.size(19.dp))
                Text(
                    label,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Bold,
                )
            }
            Text(
                value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
        }
    }
}

@Composable
private fun PreviewNotice(
    title: String,
    body: String,
    unavailable: Boolean,
) {
    Surface(
        shape = WatchPartyDesignSystem.shapes.largeIncreased,
        color = if (unavailable) {
            MaterialTheme.colorScheme.errorContainer
        } else {
            MaterialTheme.colorScheme.tertiaryContainer
        },
        contentColor = if (unavailable) {
            MaterialTheme.colorScheme.onErrorContainer
        } else {
            MaterialTheme.colorScheme.onTertiaryContainer
        },
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.Top,
        ) {
            Icon(
                if (unavailable) WatchPartyIcons.Block else WatchPartyIcons.Lock,
                contentDescription = null,
            )
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(title, fontWeight = FontWeight.Bold)
                Text(body, style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

@Composable
private fun PreviewCinemaScene(modifier: Modifier = Modifier) {
    val colors = WatchPartyDesignSystem.colors
    val primary = MaterialTheme.colorScheme.primary
    val secondary = MaterialTheme.colorScheme.secondary
    val tertiary = MaterialTheme.colorScheme.tertiary
    val playColor = MaterialTheme.colorScheme.inversePrimary
    Canvas(modifier) {
        drawRoundRect(
            color = colors.sceneSky,
            cornerRadius = CornerRadius(24.dp.toPx()),
        )
        val back = Path().apply {
            moveTo(0f, size.height * .80f)
            lineTo(size.width * .17f, size.height * .61f)
            lineTo(size.width * .38f, size.height * .85f)
            lineTo(size.width * .59f, size.height * .57f)
            lineTo(size.width * .79f, size.height * .82f)
            lineTo(size.width, size.height * .68f)
            lineTo(size.width, size.height)
            lineTo(0f, size.height)
            close()
        }
        drawPath(back, colors.sceneRidgeBack)
        val front = Path().apply {
            moveTo(0f, size.height * .90f)
            lineTo(size.width * .17f, size.height * .75f)
            lineTo(size.width * .38f, size.height)
            lineTo(size.width * .59f, size.height * .73f)
            lineTo(size.width * .79f, size.height * .95f)
            lineTo(size.width, size.height * .81f)
            lineTo(size.width, size.height)
            lineTo(0f, size.height)
            close()
        }
        drawPath(front, colors.sceneRidgeFront)

        val screenWidth = size.width * .52f
        val screenHeight = size.height * .43f
        val screenLeft = (size.width - screenWidth) / 2f
        val screenTop = size.height * .13f
        drawRoundRect(
            colors.mediaOutline,
            topLeft = Offset(screenLeft, screenTop),
            size = Size(screenWidth, screenHeight),
            cornerRadius = CornerRadius(16.dp.toPx()),
        )
        drawRoundRect(
            colors.mediaContainer,
            topLeft = Offset(screenLeft + 5.dp.toPx(), screenTop + 5.dp.toPx()),
            size = Size(screenWidth - 10.dp.toPx(), screenHeight - 10.dp.toPx()),
            cornerRadius = CornerRadius(11.dp.toPx()),
        )
        val playCenter = Offset(size.width / 2f, screenTop + screenHeight / 2f)
        val play = Path().apply {
            moveTo(playCenter.x - 8.dp.toPx(), playCenter.y - 14.dp.toPx())
            lineTo(playCenter.x + 14.dp.toPx(), playCenter.y)
            lineTo(playCenter.x - 8.dp.toPx(), playCenter.y + 14.dp.toPx())
            close()
        }
        drawPath(play, playColor)

        val seatWidth = 70.dp.toPx()
        val seatHeight = 58.dp.toPx()
        val firstLeft = size.width / 2f - seatWidth * 1.38f
        listOf(primary, secondary, tertiary).forEachIndexed { index, color ->
            drawRoundRect(
                color,
                topLeft = Offset(
                    firstLeft + index * seatWidth * .88f,
                    size.height - seatHeight - 20.dp.toPx(),
                ),
                size = Size(seatWidth, seatHeight),
                cornerRadius = CornerRadius(16.dp.toPx(), 9.dp.toPx()),
            )
        }
    }
}

@Preview(widthDp = 1224, heightDp = 708)
@Composable
private fun AvailablePreview() {
    AppTheme(onThemeChanged = {}) {
        RoomPreviewScreen(
            state = RoomPreviewUiState(requireNotNull(roomPreviewForCode("MOON-42")), isLoading = false),
            onAction = {},
        )
    }
}

@Preview(widthDp = 360, heightDp = 760)
@Composable
private fun OwnerAwayCompactPreview() {
    WatchPartyTheme(darkTheme = true) {
        RoomPreviewScreen(
            state = RoomPreviewUiState(requireNotNull(roomPreviewForCode("ORBIT-08")), isLoading = false),
            onAction = {},
        )
    }
}

@Preview(widthDp = 360, heightDp = 760, fontScale = 1.5f)
@Composable
private fun UnavailableLargeTextPreview() {
    AppTheme(onThemeChanged = {}) {
        RoomPreviewScreen(
            state = RoomPreviewUiState(requireNotNull(roomPreviewForCode("FULL-10")), isLoading = false),
            onAction = {},
        )
    }
}

@Preview(widthDp = 360, heightDp = 760)
@Composable
private fun InviteLoadingPreview() = WatchPartyTheme(darkTheme = false) {
    RoomPreviewScreen(state = RoomPreviewUiState(), onAction = {})
}

@Preview(widthDp = 360, heightDp = 760, fontScale = 1.5f)
@Composable
private fun InviteOfflinePreview() = WatchPartyTheme(darkTheme = true) {
    RoomPreviewScreen(
        state = RoomPreviewUiState(isLoading = false, errorMessage = "NETWORK", isOffline = true),
        onAction = {},
    )
}
