package top.roomio.app.room

import top.roomio.app.components.WatchPartyTextField
import top.roomio.app.components.WatchPartyDialog
import top.roomio.app.components.rememberReportNetworkAvailable
import top.roomio.app.components.WatchPartyIcons
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.runtime.rememberCoroutineScope
import kotlinx.coroutines.launch
import top.roomio.app.diagnostics.loggedRunCatching

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DividerDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import co.touchlab.kermit.Logger
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import watchparty.sharedui.generated.resources.*
import top.roomio.app.platform.rememberFullscreenController
import top.roomio.app.navigation.RoomInviteLinks
import top.roomio.app.room.player.AudioTrack
import top.roomio.app.room.player.VideoPlayerHandle
import top.roomio.app.room.player.VideoPlayerSurface
import top.roomio.app.room.player.SubtitleTrack
import top.roomio.app.room.player.rememberPlatformVideoPicker
import top.roomio.app.room.player.rememberPlatformSubtitlePicker
import top.roomio.app.room.player.rememberPlatformVideoPlayer
import top.roomio.app.theme.AppTheme
import top.roomio.app.theme.LocalThemeIsDark
import top.roomio.app.theme.WatchPartyDesignSystem
import top.roomio.domain.party.VoicePeerStatus

private val log = Logger.withTag("RoomScreen")

/**
 * Screen fixture and state contract mirrored from the browser prototype's
 * PartyScreen. It stays local and deterministic while the product has no
 * room service or media implementation.
 */
internal data class RoomScreenModel(
    val title: String,
    val partyCode: String,
    val role: RoomRole,
    val ownerName: String,
    val ownerPresent: Boolean,
    val playback: RoomPlaybackState,
    val participants: List<RoomParticipant>,
)

internal enum class RoomRole { OWNER, GUEST }

internal enum class RoomPlaybackState {
    OWNER_EMPTY,
    WAITING_FOR_OWNER,
    LOADING,
    PLAYING,
    PAUSED,
    BUFFERING,
    ERROR,
    ABORTED,
}

internal enum class RoomAvatar {
    COMET,
    MINT,
    SUNNY,
    BERRY,
    CLOUD,
    EMBER,
    NOVA,
    ORBIT,
    PRISM,
    ECHO,
    SPARK,
    BLOOM,
}

internal data class RoomParticipant(
    val name: String,
    val avatar: RoomAvatar,
    val isSelf: Boolean = false,
    val isHost: Boolean = false,
    val isSpeaking: Boolean = false,
    val isMuted: Boolean = false,
    val isPresent: Boolean = true,
    val voiceStatus: VoicePeerStatus? = null,
)

private val ownerEmptyRoom = RoomScreenModel(
    title = "Friday night screening",
    partyCode = "MOON-42",
    role = RoomRole.OWNER,
    ownerName = "You",
    ownerPresent = true,
    playback = RoomPlaybackState.OWNER_EMPTY,
    participants = listOf(
        RoomParticipant("You", RoomAvatar.COMET, isSelf = true, isHost = true),
        RoomParticipant("Ellis", RoomAvatar.SUNNY, isSpeaking = true),
        RoomParticipant("Jo", RoomAvatar.BERRY, isMuted = true),
    ),
)

private val guestPlayingRoom = RoomScreenModel(
    title = "Mira's late show",
    partyCode = "MOON-42",
    role = RoomRole.GUEST,
    ownerName = "Mira",
    ownerPresent = true,
    playback = RoomPlaybackState.PLAYING,
    participants = listOf(
        RoomParticipant("Mira", RoomAvatar.MINT, isHost = true, isSpeaking = true),
        RoomParticipant("Ellis", RoomAvatar.SUNNY, isMuted = true),
        RoomParticipant("Jo", RoomAvatar.BERRY),
        RoomParticipant("You", RoomAvatar.COMET, isSelf = true),
    ),
)

internal fun ownerRoomModel(): RoomScreenModel = ownerEmptyRoom

internal fun joinedRoomModel(partyCode: String): RoomScreenModel = when (partyCode) {
    "ORBIT-08" -> guestPlayingRoom.copy(
        title = "Orbit double feature",
        partyCode = partyCode,
        ownerPresent = false,
        participants = guestPlayingRoom.participants.filterNot { it.isHost },
    )
    else -> guestPlayingRoom.copy(partyCode = partyCode)
}

private data class RoomSyncAction(val owner: Boolean = false, val active: Boolean = false, val enabled: Boolean = true)
private val LocalRoomSyncAction = staticCompositionLocalOf { RoomSyncAction() }

@Composable
private fun roomSyncActionLabel(): String {
    val action = LocalRoomSyncAction.current
    return stringResource(when {
        action.active -> Res.string.group_sync_view
        action.owner -> Res.string.group_sync_ask
        else -> Res.string.sync_to_room
    })
}

@Composable
internal fun RoomScreen(
    state: RoomUiState = RoomUiState(ownerEmptyRoom),
    effects: Flow<RoomEffect> = emptyFlow(),
    onAction: (RoomAction) -> Unit = {},
    modifier: Modifier = Modifier,
    playerContent: (@Composable (Modifier) -> Unit)? = null,
) {
    CompositionLocalProvider(LocalRoomSyncAction provides RoomSyncAction(
        owner = state.isOwner, active = state.groupSync?.active == true,
        enabled = state.chat.connected && !state.syncBusy && state.groupSync?.phase != top.roomio.domain.party.GroupSyncPhase.SCHEDULED,
    )) { RoomScreenContent(state, effects, onAction, modifier, playerContent) }
}

@Composable
private fun RoomScreenContent(
    state: RoomUiState = RoomUiState(ownerEmptyRoom),
    effects: Flow<RoomEffect> = emptyFlow(),
    onAction: (RoomAction) -> Unit = {},
    modifier: Modifier = Modifier,
    playerContent: (@Composable (Modifier) -> Unit)? = null,
) {
    var isDark by LocalThemeIsDark.current
    val snackbarHost = remember { SnackbarHostState() }
    val clipboard = LocalClipboardManager.current
    val scope = rememberCoroutineScope()
    val syncComplete = stringResource(Res.string.sync_complete)
    val syncUnavailable = stringResource(Res.string.sync_unavailable)
    val sampleUrl = stringResource(Res.string.sample_video_url)
    val partyCodeCopied = stringResource(Res.string.party_code_copied)
    val inviteLinkCopied = stringResource(Res.string.invite_link_copied)
    val copyUnavailable = stringResource(Res.string.copy_unavailable)
    val videoLinkCopied = stringResource(Res.string.video_link_copied)
    val offlineMessage = stringResource(Res.string.offline_message)
    val requestFailed = stringResource(Res.string.request_failed)
    val syncNoticeMessages=mapOf(GroupSyncNotice.FILE_FAILED to stringResource(Res.string.local_file_failed),GroupSyncNotice.FILE_SYNC_FAILED to stringResource(Res.string.local_sync_failed),GroupSyncNotice.CANCELLED to stringResource(Res.string.group_sync_cancelled),GroupSyncNotice.STOPPED to stringResource(Res.string.group_sync_stopped),GroupSyncNotice.EXCLUDED to stringResource(Res.string.group_sync_excluded),GroupSyncNotice.OWNER_RECOVERY to stringResource(Res.string.group_sync_owner_recovery),GroupSyncNotice.UNAVAILABLE to stringResource(Res.string.group_sync_unavailable))

    val playerHandle: VideoPlayerHandle? = if (playerContent == null) {
        rememberPlatformVideoPlayer { playerState ->
            onAction(RoomAction.PlayerStateChanged(playerState))
        }
    } else {
        null
    }
    var subtitleDialogOpen by remember { mutableStateOf(false) }
    var audioTrackDialogOpen by remember { mutableStateOf(false) }
    var resumePlaybackAfterSubtitlePicker by remember { mutableStateOf(false) }
    val pickSubtitleFile = rememberPlatformSubtitlePicker { subtitleFile ->
        playerHandle?.addSubtitle(subtitleFile)
        if (resumePlaybackAfterSubtitlePicker) playerHandle?.play()
        resumePlaybackAfterSubtitlePicker = false
    }
    val player: @Composable (Modifier) -> Unit = { playerModifier ->
        Box(playerModifier) {
            if(playerContent!=null) playerContent(Modifier.fillMaxSize())
            else if(playerHandle!=null) VideoPlayerSurface(playerHandle,Modifier.fillMaxSize())
            else CinemaScene(modifier=Modifier.fillMaxSize(),showTitle=true,muted=false)
        }
    }
    LaunchedEffect(state.groupSync?.phase,playerHandle) {
        if(playerHandle==null && playerContent==null && state.syncLocked) onAction(RoomAction.SyncPlayerUnavailable)
    }
    var chooseVideoOpen by remember { mutableStateOf(false) }
    var replaceLocalFile by remember { mutableStateOf(false) }
    val pickVideoFile = rememberPlatformVideoPicker({ onAction(RoomAction.LocalFilePicked(it,replaceLocalFile));replaceLocalFile=false;chooseVideoOpen=false }, { onAction(RoomAction.LocalFileFailed) })
    LaunchedEffect(state.sharedFileName,state.selectedFileName) { if(state.selectedFileName.isNotEmpty())chooseVideoOpen=false }
    if(chooseVideoOpen) LocalMediaSourceDialog(state.fileLoading||state.groupSync?.phase in setOf(top.roomio.domain.party.GroupSyncPhase.PREPARING,top.roomio.domain.party.GroupSyncPhase.SCHEDULED),{chooseVideoOpen=false},{replaceLocalFile=true;pickVideoFile()},{onAction(RoomAction.ReplaceStream(it));chooseVideoOpen=false})
    GroupSyncDialog(state,{replaceLocalFile=false;pickVideoFile()},onAction)
    // Load the shared stream when it becomes active (owner start or a remote
    // stream.started event) and keep the local player's play/pause in sync.
    var loadedVideoUrl by remember { mutableStateOf<String?>(null) }
    var loadedSourceSession by remember { mutableStateOf("") }
    LaunchedEffect(state.videoUrl, state.playback, state.sourceSessionId) {
        val handle = playerHandle ?: return@LaunchedEffect
        if(state.videoUrl.isBlank() && loadedVideoUrl!=null) { handle.stop();loadedVideoUrl=null }
        if (state.hasPlayer && state.videoUrl.isNotBlank() && (loadedVideoUrl != state.videoUrl || loadedSourceSession != state.sourceSessionId)) {
            loadedVideoUrl = state.videoUrl
            loadedSourceSession = state.sourceSessionId
            handle.load(state.videoUrl)
            if(state.localSource) handle.pause()
        }
        when (state.playback) {
            RoomPlaybackState.PLAYING -> if (state.hasPlayer) handle.play()
            RoomPlaybackState.PAUSED -> handle.pause()
            else -> Unit
        }
    }
    val pasteVideoLink = {
        val clip = clipboard.getText()?.text?.trim().orEmpty()
        onAction(RoomAction.VideoUrlPasted(clip.ifEmpty { sampleUrl }))
    }

    val requestMicThenJoin = rememberMicPermissionHandler { onAction(RoomAction.JoinVoiceClicked) }

    val fullscreenController = rememberFullscreenController {
        onAction(RoomAction.ToggleFullscreenClicked)
    }
    val fullscreenActive = state.fullscreenMode && state.hasPlayer
    LaunchedEffect(fullscreenActive, fullscreenController) {
        fullscreenController?.setFullscreen(fullscreenActive)
    }
    DisposableEffect(fullscreenController) {
        onDispose { fullscreenController?.setFullscreen(false) }
    }

    LaunchedEffect(effects) {
        effects.collect { effect ->
            when (effect) {
                RoomEffect.StopPlayer -> { playerHandle?.stop(); loadedVideoUrl=null }
                is RoomEffect.PlayerPlaying -> if(effect.playing)playerHandle?.play()else playerHandle?.pause()
                is RoomEffect.GroupSyncNotice -> snackbarHost.showSnackbar(syncNoticeMessages.getValue(effect.notice))
                is RoomEffect.SeekTo -> {
                    log.i("effect SeekTo target=${effect.positionMs}ms handle=${playerHandle != null} playback=${state.playback}")
                    playerHandle?.seekTo(effect.positionMs)
                }
                RoomEffect.SyncCompleted -> {
                    log.i("effect SyncCompleted → snackbar")
                    snackbarHost.showSnackbar(syncComplete)
                }
                RoomEffect.SyncUnavailable -> {
                    log.i("effect SyncUnavailable → snackbar")
                    snackbarHost.showSnackbar(syncUnavailable)
                }
                RoomEffect.PartyCodeCopied -> snackbarHost.showSnackbar(partyCodeCopied)
                RoomEffect.InviteLinkCopied -> snackbarHost.showSnackbar(inviteLinkCopied)
                RoomEffect.CopyUnavailable -> snackbarHost.showSnackbar(copyUnavailable)
                is RoomEffect.Error -> {
                    log.i("effect Error connectivity=${effect.connectivity} → snackbar")
                    snackbarHost.showSnackbar(if (effect.connectivity) offlineMessage else requestFailed)
                }
                // Navigation owns returning home when the user leaves.
                RoomEffect.Left -> Unit
            }
        }
    }

    if (fullscreenActive) {
        FullscreenCinema(
            playback = state.playback,
            syncLocked = state.syncLocked,
            syncCountdown = state.syncCountdown,
            positionMs = state.positionMs,
            durationMs = state.durationMs,
            isLive = state.isLive,
            videoAspectRatio = state.videoAspectRatio,
            volume = state.volume,
            micMuted = state.micMuted,
            subtitleTracks = state.subtitleTracks,
            audioTracks = state.audioTracks,
            audioTrackSelectionId = state.audioTrackSelectionId,
            player = player,
            snackbarHost = snackbarHost,
            onTogglePlayback = {
                onAction(RoomAction.TogglePlaybackClicked)
                if(!state.syncLocked)playerHandle?.togglePlayPause()
            },
            onPositionChange = {
                onAction(RoomAction.PlaybackPositionChanged(it))
                if(!state.syncLocked)playerHandle?.seekTo(it)
            },
            onSkip = {
                onAction(RoomAction.PlaybackSkipped(it))
                if(!state.syncLocked)playerHandle?.seekBy((it * 15_000f).toLong())
            },
            onVolumeChange = {
                onAction(RoomAction.VolumeChanged(it))
                playerHandle?.setVolume(it)
            },
            onToggleVolume = {
                onAction(RoomAction.ToggleVolumeClicked)
                playerHandle?.setVolume(if (state.volume == 0f) 0.72f else 0f)
            },
            onToggleFullscreen = { onAction(RoomAction.ToggleFullscreenClicked) },
            onSync = { onAction(RoomAction.SyncClicked) },
            onToggleMic = { onAction(RoomAction.ToggleMicClicked) },
            onOpenSubtitles = { subtitleDialogOpen = true },
            onOpenAudioTracks = { audioTrackDialogOpen = true },
        )
    } else {
        Scaffold(
            modifier = modifier.windowInsetsPadding(WindowInsets.safeDrawing).imePadding(),
            topBar = {
                RoomTopBar(
                    title = state.model.title,
                    subtitle = if (state.model.role == RoomRole.GUEST) {
                        "${state.model.partyCode} · ${stringResource(Res.string.guest)}"
                    } else {
                        null
                    },
                    showLink = state.hasPlayer && !state.localSource,
                    showTheme = true,
                    onInvite = { onAction(RoomAction.InviteClicked) },
                    onReportBug = { onAction(RoomAction.BugReportClicked) },
                    onShowLink = { if(state.localSource)chooseVideoOpen=state.isOwner else onAction(RoomAction.LinkClicked) },
                    onLeave = { onAction(RoomAction.LeaveClicked) },
                    onToggleTheme = { isDark = !isDark },
                )
            },
            snackbarHost = { SnackbarHost(snackbarHost) },
        ) { contentPadding ->
            BoxWithConstraints(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(contentPadding)
                    .verticalScroll(rememberScrollState()),
            ) {
                val compact = maxWidth < 1000.dp
            val cinema: @Composable ColumnScope.() -> Unit = {
                if (!state.model.ownerPresent) {
                    OwnerAwayBanner(state.model.ownerName)
                    Spacer(Modifier.height(WatchPartyDesignSystem.spacing.small))
                }
                CinemaCard(
                    playback = state.playback,
                    syncLocked = state.syncLocked,
                    syncCountdown = state.syncCountdown,
                    isOwner = state.isOwner,
                    ownerName = state.model.ownerName,
                    videoUrl = state.videoUrl,
                    positionMs = state.positionMs,
                    durationMs = state.durationMs,
                    isLive = state.isLive,
                    volume = state.volume,
                    micMuted = state.micMuted,
                    subtitleTracks = state.subtitleTracks,
                    audioTracks = state.audioTracks,
                    audioTrackSelectionId = state.audioTrackSelectionId,
                    playerError = state.playerError,
                    player = player,
                    onVideoUrlChange = { onAction(RoomAction.VideoUrlChanged(it)) },
                    onPaste = pasteVideoLink,
                    onChooseFile = {replaceLocalFile=false;pickVideoFile()},
                    localFileMissing = state.localSource && state.videoUrl.isBlank() && state.streamActive,
                    localFileName = state.sharedFileName,
                    onStart = { onAction(RoomAction.StartPlaybackClicked) },
                    onRetry = {
                        onAction(RoomAction.RetryPlaybackClicked)
                        playerHandle?.retry(state.videoUrl)
                        playerHandle?.play()
                    },
                    onTogglePlayback = {
                        onAction(RoomAction.TogglePlaybackClicked)
                        if(!state.syncLocked)playerHandle?.togglePlayPause()
                    },
                    onPositionChange = {
                        onAction(RoomAction.PlaybackPositionChanged(it))
                        if(!state.syncLocked)playerHandle?.seekTo(it)
                    },
                    onSkip = {
                        onAction(RoomAction.PlaybackSkipped(it))
                        if(!state.syncLocked)playerHandle?.seekBy((it * 15_000f).toLong())
                    },
                    onVolumeChange = {
                        onAction(RoomAction.VolumeChanged(it))
                        playerHandle?.setVolume(it)
                    },
                    onToggleVolume = {
                        onAction(RoomAction.ToggleVolumeClicked)
                        playerHandle?.setVolume(if (state.volume == 0f) 0.72f else 0f)
                    },
                    onToggleFullscreen = { onAction(RoomAction.ToggleFullscreenClicked) },
                    onSync = { onAction(RoomAction.SyncClicked) },
                    onToggleMic = { onAction(RoomAction.ToggleMicClicked) },
                    onOpenSubtitles = { subtitleDialogOpen = true },
                    onOpenAudioTracks = { audioTrackDialogOpen = true },
                )
                if (state.hasPlayer) {
                    Spacer(Modifier.height(WatchPartyDesignSystem.spacing.small))
                    SyncBand(
                        paused = state.playback == RoomPlaybackState.PAUSED,
                        onSync = { onAction(RoomAction.SyncClicked) },
                    )
                }
            }

            val support: @Composable () -> Unit = {
                Column(verticalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.small)) {
                RoomChatPanel(state.chat, onAction)
                RoomSupportPanel(
                    participants = state.model.participants,
                    expandedRoom = !compact,
                    micMuted = state.micMuted,
                    voiceState = state.voiceState,
                    voiceFailureCode = state.voiceFailureCode,
                    onRetryVoice = { onAction(RoomAction.RetryVoiceConnections) },
                    videoUrl = state.videoUrl,
                    streamActive = state.streamActive || state.hasPlayer,
                    localFileName = if(state.localSource)state.selectedFileName.ifEmpty { state.sharedFileName } else null,
                    onChangeSource = if(state.isOwner)({chooseVideoOpen=true}) else if(state.localSource)pickVideoFile else null,
                    isOwner = state.isOwner,
                    ownerPresent = state.model.ownerPresent,
                    onJoinVoice = requestMicThenJoin,
                    onToggleMic = { onAction(RoomAction.ToggleMicClicked) },
                    onCopyLink = {
                        val copied = loggedRunCatching("RoomScreen.copySource") { clipboard.setText(AnnotatedString(state.videoUrl)) }.isSuccess
                        scope.launch { snackbarHost.showSnackbar(if (copied) videoLinkCopied else copyUnavailable) }
                    },
                    onEndStream = { onAction(RoomAction.EndStreamClicked) },
                )
                }
            }

            if (compact) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .widthIn(max = 600.dp)
                        .padding(horizontal = WatchPartyDesignSystem.spacing.small, vertical = WatchPartyDesignSystem.spacing.small),
                    verticalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.small),
                ) {
                    cinema()
                    support()
                }
            } else {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .widthIn(max = 1376.dp)
                        .padding(horizontal = WatchPartyDesignSystem.spacing.small, vertical = WatchPartyDesignSystem.spacing.medium),
                    horizontalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.medium),
                    verticalAlignment = Alignment.Top,
                ) {
                    Column(Modifier.weight(1.7f), verticalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.small)) {
                        cinema()
                    }
                    Box(Modifier.width(360.dp)) { support() }
                }
            }
        }
    }
    }

    if (state.bugReportOpen) BugReportDialog(state, onAction)
    if (state.inviteOpen) {
        InviteFriendsDialog(
            partyCode = state.model.partyCode,
            inviteLink = RoomInviteLinks.create(state.model.partyCode),
            copyState = state.inviteCopyState,
            onDismiss = { onAction(RoomAction.InviteDismissed) },
            onCopied = { onAction(RoomAction.InviteCopySucceeded(it)) },
            onCopyFailed = { onAction(RoomAction.InviteCopyFailed) },
        )
    }
    if (state.linkOpen) {
        CurrentVideoLinkDialog(
            videoUrl = state.videoUrl,
            onDismiss = { onAction(RoomAction.LinkDismissed) },
        )
    }
    if (subtitleDialogOpen) {
        SubtitleSelectionDialog(
            tracks = state.subtitleTracks,
            canChooseFile = pickSubtitleFile != null,
            onDismiss = { subtitleDialogOpen = false },
            onSelect = { trackId ->
                playerHandle?.selectSubtitle(trackId)
                subtitleDialogOpen = false
            },
            onChooseFile = {
                subtitleDialogOpen = false
                resumePlaybackAfterSubtitlePicker = state.playback == RoomPlaybackState.PLAYING
                pickSubtitleFile?.invoke()
            },
        )
    }
    if (audioTrackDialogOpen) {
        AudioTrackSelectionDialog(
            tracks = state.audioTracks,
            selectedTrackId = state.audioTrackSelectionId,
            onDismiss = { audioTrackDialogOpen = false },
            onSelect = { trackId ->
                playerHandle?.selectAudioTrack(trackId)
                audioTrackDialogOpen = false
            },
        )
    }
    if (state.leaveOpen) {
        WatchPartyDialog(
            onDismissRequest = { onAction(RoomAction.LeaveDismissed) },
            title = { Text(stringResource(Res.string.leave_party)) },
            text = { Text(stringResource(if (state.isOwner) Res.string.leave_owner_copy else Res.string.leave_guest_copy)) },
            confirmButton = {
                Button(
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.errorContainer, contentColor = MaterialTheme.colorScheme.onErrorContainer),
                    onClick = {
                        playerHandle?.stop()
                        onAction(RoomAction.LeaveConfirmed)
                    },
                ) {
                    Text(stringResource(Res.string.leave))
                }
            },
            dismissButton = {
                TextButton(onClick = { onAction(RoomAction.LeaveDismissed) }) {
                    Text(stringResource(Res.string.stay))
                }
            },
        )
    }
    if (state.abortOpen) {
        WatchPartyDialog(
            onDismissRequest = { onAction(RoomAction.EndStreamDismissed) },
            title = { Text(stringResource(Res.string.end_stream_question)) },
            text = { Text(stringResource(Res.string.end_stream_copy)) },
            confirmButton = {
                Button(colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.errorContainer, contentColor = MaterialTheme.colorScheme.onErrorContainer), onClick = {
                    playerHandle?.stop()
                    onAction(RoomAction.EndStreamConfirmed)
                }) {
                    Text(stringResource(Res.string.end_for_everyone))
                }
            },
            dismissButton = {
                TextButton(onClick = { onAction(RoomAction.EndStreamDismissed) }) {
                    Text(stringResource(Res.string.cancel))
                }
            },
        )
    }
}

@Composable
private fun RoomTopBar(
    title: String,
    subtitle: String?,
    showLink: Boolean,
    showTheme: Boolean,
    onInvite: () -> Unit,
    onReportBug: () -> Unit,
    onShowLink: () -> Unit,
    onLeave: () -> Unit,
    onToggleTheme: () -> Unit,
) {
    Surface(color = MaterialTheme.colorScheme.surface, shadowElevation = 0.dp) {
        Column {
            BoxWithConstraints {
                val compactBar = maxWidth < 600.dp
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = if (compactBar) 64.dp else 72.dp)
                        .padding(
                            horizontal = if (compactBar) WatchPartyDesignSystem.spacing.small else 16.dp,
                            vertical = if (compactBar) 4.dp else 8.dp,
                        ),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(if (compactBar) 6.dp else 10.dp),
                ) {
                    Column(Modifier.weight(1f)) {
                        Text(
                            title,
                            style = if (compactBar) MaterialTheme.typography.titleMedium else MaterialTheme.typography.titleLarge,
                            maxLines = if (compactBar) 1 else 2,
                            overflow = TextOverflow.Ellipsis,
                        )
                        if (subtitle != null && !compactBar) {
                            Text(
                                subtitle,
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                    MaterialIconButton(WatchPartyIcons.PersonAdd, stringResource(Res.string.invite_friends), tonal = true, onClick = onInvite)
                    MaterialIconButton(WatchPartyIcons.BugReport, stringResource(Res.string.report_bug), onClick = onReportBug)
                    if (showLink) MaterialIconButton(WatchPartyIcons.Link, stringResource(Res.string.current_video_link), onClick = onShowLink)
                    MaterialIconButton(WatchPartyIcons.Logout, stringResource(Res.string.leave), onClick = onLeave)
                    if (showTheme && !compactBar) {
                        MaterialIconButton(WatchPartyIcons.DarkMode, stringResource(Res.string.theme), onClick = onToggleTheme)
                    }
                }
            }
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
        }
    }
}

@Composable
private fun MaterialIconButton(
    icon: ImageVector,
    label: String,
    tonal: Boolean = false,
    size: Dp = 48.dp,
    iconSize: Dp = 22.dp,
    enabled: Boolean = true,
    onClick: () -> Unit,
) {
    if (tonal) {
        FilledIconButton(
            onClick = onClick,
            enabled = enabled,
            modifier = Modifier.size(size).semantics { contentDescription = label },
            colors = IconButtonDefaults.filledIconButtonColors(
                containerColor = MaterialTheme.colorScheme.secondaryContainer,
                contentColor = MaterialTheme.colorScheme.onSecondaryContainer,
            ),
        ) { Icon(icon, contentDescription = null, modifier = Modifier.size(iconSize)) }
    } else {
        IconButton(onClick = onClick, enabled = enabled, modifier = Modifier.size(size).semantics { contentDescription = label }) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(iconSize))
        }
    }
}

@Composable
private fun CinemaCard(
    onChooseFile: () -> Unit,
    localFileMissing: Boolean,
    localFileName: String,
    playback: RoomPlaybackState,
    syncLocked: Boolean,
    syncCountdown: String?,
    isOwner: Boolean,
    ownerName: String,
    videoUrl: String,
    positionMs: Long,
    durationMs: Long,
    isLive: Boolean,
    volume: Float,
    micMuted: Boolean,
    subtitleTracks: List<SubtitleTrack>,
    audioTracks: List<AudioTrack>,
    audioTrackSelectionId: String?,
    playerError: String?,
    player: @Composable (Modifier) -> Unit,
    onVideoUrlChange: (String) -> Unit,
    onPaste: () -> Unit,
    onStart: () -> Unit,
    onRetry: () -> Unit,
    onTogglePlayback: () -> Unit,
    onPositionChange: (Long) -> Unit,
    onSkip: (Float) -> Unit,
    onVolumeChange: (Float) -> Unit,
    onToggleVolume: () -> Unit,
    onToggleFullscreen: () -> Unit,
    onSync: () -> Unit,
    onToggleMic: () -> Unit,
    onOpenSubtitles: () -> Unit,
    onOpenAudioTracks: () -> Unit,
) {
    val hasPlayer = playback in setOf(RoomPlaybackState.PLAYING, RoomPlaybackState.PAUSED, RoomPlaybackState.BUFFERING)
    Card(
        colors = CardDefaults.cardColors(
            containerColor = WatchPartyDesignSystem.colors.mediaSurface,
            contentColor = WatchPartyDesignSystem.colors.onMedia,
        ),
        shape = WatchPartyDesignSystem.shapes.extraLargeIncreased,
    ) {
        Column {
            Box(Modifier.fillMaxWidth()) {
                val playerModifier = Modifier.fillMaxWidth().aspectRatio(16f / 9f)
                if (hasPlayer) {
                    player(playerModifier)
                } else {
                    CinemaScene(modifier = playerModifier, showTitle = false, muted = true)
                }
                if (playback == RoomPlaybackState.PAUSED && !syncLocked) {
                    FilledIconButton(
                        onClick = onTogglePlayback,
                        modifier = Modifier.align(Alignment.Center).size(72.dp),
                        colors = IconButtonDefaults.filledIconButtonColors(containerColor = MaterialTheme.colorScheme.primary),
                    ) {
                        Icon(WatchPartyIcons.PlayArrow, contentDescription = stringResource(Res.string.play), modifier = Modifier.size(38.dp))
                    }
                }
                GroupSyncCountdown(syncCountdown)
            }
            when {
                localFileMissing -> Column(Modifier.fillMaxWidth().padding(24.dp),verticalArrangement=Arrangement.spacedBy(12.dp)) {
                    Text(stringResource(Res.string.local_choose_copy),style=MaterialTheme.typography.titleLarge)
                    Text(localFileName)
                    Text(stringResource(Res.string.local_no_video))
                    Button(onClick=onChooseFile){Text(stringResource(Res.string.local_choose_file))}
                }
                hasPlayer -> PlayerControls(
                    paused = playback == RoomPlaybackState.PAUSED,
                    buffering = playback == RoomPlaybackState.BUFFERING,
                    positionMs = positionMs,
                    durationMs = durationMs,
                    isLive = isLive,
                    volume = volume,
                    micMuted = micMuted,
                    subtitleTracks = subtitleTracks,
                    audioTracks = audioTracks,
                    audioTrackSelectionId = audioTrackSelectionId,
                    onTogglePlayback = onTogglePlayback,
                    onPositionChange = onPositionChange,
                    onSkip = onSkip,
                    onVolumeChange = onVolumeChange,
                    onToggleVolume = onToggleVolume,
                    onToggleFullscreen = onToggleFullscreen,
                    onSync = onSync,
                    onToggleMic = onToggleMic,
                    onOpenSubtitles = onOpenSubtitles,
                    onOpenAudioTracks = onOpenAudioTracks,
                )
                playback == RoomPlaybackState.LOADING -> LoadingCinema()
                playback == RoomPlaybackState.ERROR && videoUrl.isNotBlank() -> PlayerErrorCinema(playerError, onRetry)
                isOwner -> OwnerCinemaEntry(
                    onChooseFile = onChooseFile,
                    playback = playback,
                    videoUrl = videoUrl,
                    onVideoUrlChange = onVideoUrlChange,
                    onPaste = onPaste,
                    onStart = onStart,
                    onRetry = onRetry,
                )
                else -> GuestWaitingCinema(playback, ownerName, onRetry)
            }
        }
    }
}

@Composable
private fun CinemaScene(modifier: Modifier, showTitle: Boolean, muted: Boolean) {
    val colors = WatchPartyDesignSystem.colors
    Box(
        modifier = modifier.background(colors.sceneSky),
    ) {
        Canvas(Modifier.fillMaxSize()) {
            val planetCenter = Offset(size.width * .79f, size.height * .30f)
            drawCircle(colors.scenePlanet.copy(alpha = .15f), radius = size.minDimension * .22f, center = planetCenter)
            drawCircle(colors.scenePlanet.copy(alpha = if (muted) .68f else 1f), radius = size.minDimension * .17f, center = planetCenter)
            drawCircle(colors.onMedia.copy(alpha = .72f), radius = 2.5.dp.toPx(), center = Offset(size.width * .18f, size.height * .20f))
            drawCircle(colors.onMedia.copy(alpha = .72f), radius = 2.5.dp.toPx(), center = Offset(size.width * .43f, size.height * .12f))
            drawCircle(colors.onMedia.copy(alpha = .72f), radius = 2.5.dp.toPx(), center = Offset(size.width * .70f, size.height * .33f))

            val backRidge = Path().apply {
                moveTo(0f, size.height * .72f)
                lineTo(size.width * .19f, size.height * .37f)
                lineTo(size.width * .31f, size.height * .65f)
                lineTo(size.width * .48f, size.height * .22f)
                lineTo(size.width * .64f, size.height * .70f)
                lineTo(size.width * .80f, size.height * .35f)
                lineTo(size.width, size.height * .72f)
                lineTo(size.width, size.height)
                lineTo(0f, size.height)
                close()
            }
            drawPath(backRidge, colors.sceneRidgeBack)
            val frontRidge = Path().apply {
                moveTo(0f, size.height * .80f)
                lineTo(size.width * .20f, size.height * .55f)
                lineTo(size.width * .35f, size.height * .76f)
                lineTo(size.width * .48f, size.height * .48f)
                lineTo(size.width * .65f, size.height * .80f)
                lineTo(size.width * .80f, size.height * .50f)
                lineTo(size.width, size.height * .77f)
                lineTo(size.width, size.height)
                lineTo(0f, size.height)
                close()
            }
            drawPath(frontRidge, colors.sceneRidgeFront)

            val stationWidth = size.width * .23f
            val stationHeight = size.height * .26f
            val stationLeft = size.width * .14f
            val stationTop = size.height * .58f
            drawRect(colors.sceneStation, topLeft = Offset(stationLeft + stationWidth * .41f, stationTop - stationHeight * .45f), size = androidx.compose.ui.geometry.Size(stationWidth * .18f, stationHeight * .45f))
            drawRoundRect(
                color = colors.sceneStation,
                topLeft = Offset(stationLeft, stationTop),
                size = androidx.compose.ui.geometry.Size(stationWidth, stationHeight),
                cornerRadius = CornerRadius(size.minDimension * .055f),
            )
            drawRoundRect(
                color = colors.mediaOutline,
                topLeft = Offset(stationLeft, stationTop),
                size = androidx.compose.ui.geometry.Size(stationWidth, stationHeight),
                cornerRadius = CornerRadius(size.minDimension * .055f),
                style = Stroke(width = 3.dp.toPx()),
            )
            repeat(3) { index ->
                drawRoundRect(
                    color = colors.sceneWindow,
                    topLeft = Offset(stationLeft + stationWidth * (.18f + index * .25f), stationTop + stationHeight * .42f),
                    size = androidx.compose.ui.geometry.Size(stationWidth * .15f, stationHeight * .22f),
                    cornerRadius = CornerRadius(4.dp.toPx()),
                )
            }
        }
        if (showTitle) {
            Text(
                text = stringResource(Res.string.aurora_station),
                modifier = Modifier.padding(24.dp),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.ExtraBold,
                color = colors.onMedia,
            )
        }
    }
}

@Composable
private fun OwnerCinemaEntry(
    onChooseFile: () -> Unit,
    playback: RoomPlaybackState,
    videoUrl: String,
    onVideoUrlChange: (String) -> Unit,
    onPaste: () -> Unit,
    onStart: () -> Unit,
    onRetry: () -> Unit,
) {
    val colors = WatchPartyDesignSystem.colors
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(colors.mediaContainer)
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(stringResource(if (playback == RoomPlaybackState.ABORTED) Res.string.stream_aborted else Res.string.your_cinema_empty), style = MaterialTheme.typography.labelLarge, color = colors.onMedia)
        Text(stringResource(Res.string.local_bring_video), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        WatchPartyTextField(
            value = videoUrl,
            textStyle = MaterialTheme.typography.bodyLarge.copy(textDirection = androidx.compose.ui.text.style.TextDirection.Ltr),
            onValueChange = onVideoUrlChange,
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            isError = playback == RoomPlaybackState.ERROR,
            label = stringResource(Res.string.direct_video_url),
            placeholder = { Text(stringResource(Res.string.url_hint)) },
            trailingIcon = {
                MaterialIconButton(
                    WatchPartyIcons.ContentPaste,
                    stringResource(Res.string.paste_video_link),
                    size = 40.dp,
                    iconSize = 20.dp,
                    onClick = onPaste,
                )
            },
            supportingText = if (playback == RoomPlaybackState.ERROR) {
                { Text(stringResource(Res.string.stream_error_copy)) }
            } else {
                null
            },
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = colors.onMedia,
                unfocusedTextColor = colors.onMedia,
                focusedBorderColor = colors.onMedia.copy(alpha = .75f),
                unfocusedBorderColor = colors.mediaOutline,
                focusedLabelColor = colors.onMedia,
                unfocusedLabelColor = colors.onMedia.copy(alpha = .72f),
                cursorColor = colors.onMedia,
            ),
        )
        Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(12.dp)) {
        Button(
            onClick = if (playback == RoomPlaybackState.ERROR) onRetry else onStart,
            modifier = Modifier.weight(1f),
            enabled = playback == RoomPlaybackState.ERROR || videoUrl.isNotBlank(),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.primary,
                disabledContainerColor = colors.mediaContainerHigh,
                disabledContentColor = colors.onMedia.copy(alpha = .72f),
            ),
        ) {
            Text(stringResource(if (playback == RoomPlaybackState.ERROR) Res.string.try_again else Res.string.start_stream))
        }
        Button(onClick=onChooseFile,modifier=Modifier.weight(1f)) { Text(stringResource(Res.string.local_choose_file)) }
        }
    }
}

@Composable
private fun GuestWaitingCinema(playback: RoomPlaybackState, ownerName: String, onRetry: () -> Unit) {
    val isAborted = playback == RoomPlaybackState.ABORTED
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(WatchPartyDesignSystem.colors.mediaContainer)
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text(stringResource(if (isAborted) Res.string.stream_aborted else Res.string.waiting_room), style = MaterialTheme.typography.labelLarge, color = WatchPartyDesignSystem.colors.onMedia)
        Text(
            if (isAborted) stringResource(Res.string.waiting_for_next_stream) else "$ownerName ${stringResource(Res.string.is_choosing_video)}",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
        )
        if (playback == RoomPlaybackState.ERROR) TextButton(onClick = onRetry) { Text(stringResource(Res.string.try_again)) }
    }
}

@Composable
private fun LoadingCinema() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 160.dp)
            .background(WatchPartyDesignSystem.colors.mediaContainer)
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        CircularProgressIndicator(color = MaterialTheme.colorScheme.tertiaryContainer)
        Spacer(Modifier.height(12.dp))
        Text(stringResource(Res.string.preparing_cinema), style = MaterialTheme.typography.titleMedium)
    }
}

@Composable
private fun PlayerErrorCinema(error: String?, onRetry: () -> Unit) {
    val unsupportedFormat = error?.let { code ->
        code.contains("DECOD", ignoreCase = true) ||
            code.contains("CODEC", ignoreCase = true) ||
            code.contains("FORMAT", ignoreCase = true)
    } == true
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 160.dp)
            .background(WatchPartyDesignSystem.colors.mediaContainer)
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            stringResource(if (unsupportedFormat) Res.string.format_not_supported else Res.string.error_starting_stream),
            style = MaterialTheme.typography.titleMedium,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            stringResource(if (unsupportedFormat) Res.string.format_not_supported_copy else Res.string.stream_error_copy),
            style = MaterialTheme.typography.bodyMedium,
            color = WatchPartyDesignSystem.colors.onMedia,
        )
        Spacer(Modifier.height(12.dp))
        Button(onClick = onRetry) { Text(stringResource(Res.string.try_again)) }
    }
}

@Composable
private fun PlayerControls(
    paused: Boolean,
    buffering: Boolean,
    positionMs: Long,
    durationMs: Long,
    isLive: Boolean,
    volume: Float,
    micMuted: Boolean,
    subtitleTracks: List<SubtitleTrack>,
    audioTracks: List<AudioTrack>,
    audioTrackSelectionId: String?,
    onTogglePlayback: () -> Unit,
    onPositionChange: (Long) -> Unit,
    onSkip: (Float) -> Unit,
    onVolumeChange: (Float) -> Unit,
    onToggleVolume: () -> Unit,
    onToggleFullscreen: () -> Unit,
    onSync: () -> Unit,
    onToggleMic: () -> Unit,
    onOpenSubtitles: () -> Unit,
    onOpenAudioTracks: () -> Unit,
) {
    val colors = WatchPartyDesignSystem.colors
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(colors.mediaContainer)
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        if (isLive) {
            LiveIndicator()
        } else {
            val fraction = if (durationMs > 0L) {
                (positionMs.toFloat() / durationMs.toFloat()).coerceIn(0f, 1f)
            } else {
                0f
            }
            Slider(
                value = fraction,
                onValueChange = { onPositionChange((it * durationMs).toLong()) },
                modifier = Modifier.fillMaxWidth().height(28.dp),
                colors = SliderDefaults.colors(
                    thumbColor = MaterialTheme.colorScheme.primary,
                    activeTrackColor = MaterialTheme.colorScheme.primary,
                    inactiveTrackColor = colors.mediaOutline,
                ),
            )
        }
        if (buffering) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                CircularProgressIndicator(modifier = Modifier.size(16.dp), color = colors.onMedia, strokeWidth = 2.dp)
                Text(stringResource(Res.string.buffering), style = MaterialTheme.typography.labelMedium)
            }
        }
        BoxWithConstraints(Modifier.fillMaxWidth()) {
            if (maxWidth >= 560.dp) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    PlaybackTime(positionMs, durationMs, isLive, Modifier.weight(1f))
                    TransportControls(paused, isLive, onTogglePlayback, onSkip)
                    VolumeControls(
                        volume,
                        micMuted,
                        subtitleTracks.any(SubtitleTrack::selected),
                        audioTracks.isNotEmpty(),
                        audioTrackSelectionId != null,
                        onOpenSubtitles,
                        onOpenAudioTracks,
                        onVolumeChange,
                        onToggleVolume,
                        onToggleFullscreen,
                        onSync,
                        onToggleMic,
                        Modifier,
                    )
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        PlaybackTime(positionMs, durationMs, isLive, Modifier.weight(1f))
                        TransportControls(paused, isLive, onTogglePlayback, onSkip)
                    }
                    VolumeControls(
                        volume,
                        micMuted,
                        subtitleTracks.any(SubtitleTrack::selected),
                        audioTracks.isNotEmpty(),
                        audioTrackSelectionId != null,
                        onOpenSubtitles,
                        onOpenAudioTracks,
                        onVolumeChange,
                        onToggleVolume,
                        onToggleFullscreen,
                        onSync,
                        onToggleMic,
                        Modifier.fillMaxWidth(),
                    )
                }
            }
        }
    }
}

@Composable
private fun LiveIndicator() {
    Row(
        modifier = Modifier.fillMaxWidth().height(28.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.error),
        )
        Text(
            text = stringResource(Res.string.live),
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = WatchPartyDesignSystem.colors.onMedia,
        )
    }
}

@Composable
private fun PlaybackTime(
    positionMs: Long,
    durationMs: Long,
    isLive: Boolean,
    modifier: Modifier = Modifier,
) {
    val text = if (!isLive && durationMs > 0L) {
        "${formatPlaybackTime(positionMs)} / ${formatPlaybackTime(durationMs)}"
    } else {
        formatPlaybackTime(positionMs)
    }
    Text(
        text = text,
        modifier = modifier,
        style = MaterialTheme.typography.labelMedium,
        color = WatchPartyDesignSystem.colors.onMedia,
    )
}

private fun formatPlaybackTime(millis: Long): String {
    val totalSeconds = (millis / 1000L).coerceAtLeast(0L)
    val hours = totalSeconds / 3600L
    val minutes = (totalSeconds % 3600L) / 60L
    val seconds = totalSeconds % 60L
    fun pad(value: Long): String = if (value < 10L) "0$value" else value.toString()
    return if (hours > 0L) "$hours:${pad(minutes)}:${pad(seconds)}" else "${pad(minutes)}:${pad(seconds)}"
}

private const val CONTROLS_AUTO_HIDE_MS = 3_000L

@Composable
private fun TransportControls(
    paused: Boolean,
    live: Boolean,
    onTogglePlayback: () -> Unit,
    onSkip: (Float) -> Unit,
) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(2.dp)) {
        if (!live) {
            MaterialIconButton(WatchPartyIcons.FastRewind, stringResource(Res.string.rewind_15), size = 48.dp, onClick = { onSkip(-1f) })
        }
        FilledIconButton(
            onClick = onTogglePlayback,
            modifier = Modifier.size(56.dp),
            colors = IconButtonDefaults.filledIconButtonColors(containerColor = MaterialTheme.colorScheme.primary),
        ) {
            Icon(
                if (paused) WatchPartyIcons.PlayArrow else WatchPartyIcons.Pause,
                contentDescription = stringResource(if (paused) Res.string.play else Res.string.pause),
                modifier = Modifier.size(28.dp),
            )
        }
        if (!live) {
            MaterialIconButton(WatchPartyIcons.FastForward, stringResource(Res.string.forward_15), size = 48.dp, onClick = { onSkip(1f) })
        }
    }
}

@Composable
private fun VolumeControls(
    volume: Float,
    micMuted: Boolean,
    subtitlesSelected: Boolean,
    hasAlternativeAudioTracks: Boolean,
    audioTrackSelected: Boolean,
    onOpenSubtitles: () -> Unit,
    onOpenAudioTracks: () -> Unit,
    onVolumeChange: (Float) -> Unit,
    onToggleVolume: () -> Unit,
    onToggleFullscreen: () -> Unit,
    onSync: () -> Unit,
    onToggleMic: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(modifier, verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.End) {
        MaterialIconButton(WatchPartyIcons.Sync, roomSyncActionLabel(), enabled = LocalRoomSyncAction.current.enabled, size = 40.dp, iconSize = 20.dp, onClick = onSync)
        MaterialIconButton(
            WatchPartyIcons.Subtitles,
            stringResource(Res.string.subtitles),
            tonal = subtitlesSelected,
            size = 40.dp,
            iconSize = 20.dp,
            onClick = onOpenSubtitles,
        )
        if (hasAlternativeAudioTracks) {
            MaterialIconButton(
                WatchPartyIcons.GraphicEq,
                stringResource(Res.string.audio_tracks),
                tonal = audioTrackSelected,
                size = 40.dp,
                iconSize = 20.dp,
                onClick = onOpenAudioTracks,
            )
        }
        MaterialIconButton(
            if (micMuted) WatchPartyIcons.MicOff else WatchPartyIcons.Mic,
            stringResource(if (micMuted) Res.string.unmute else Res.string.mute),
            size = 40.dp,
            iconSize = 20.dp,
            onClick = onToggleMic,
        )
        MaterialIconButton(
            if (volume == 0f) WatchPartyIcons.VolumeOff else WatchPartyIcons.VolumeUp,
            stringResource(if (volume == 0f) Res.string.unmute_video else Res.string.mute_video),
            size = 40.dp,
            iconSize = 22.dp,
            onClick = onToggleVolume,
        )
        Slider(
            value = volume,
            onValueChange = onVolumeChange,
            modifier = Modifier.widthIn(min = 64.dp, max = 108.dp).weight(1f, fill = false),
            colors = SliderDefaults.colors(
                thumbColor = MaterialTheme.colorScheme.primary,
                activeTrackColor = MaterialTheme.colorScheme.primary,
                inactiveTrackColor = WatchPartyDesignSystem.colors.mediaOutline,
            ),
        )
        MaterialIconButton(WatchPartyIcons.Fullscreen, stringResource(Res.string.enter_fullscreen), size = 40.dp, iconSize = 22.dp, onClick = onToggleFullscreen)
    }
}

@Composable
private fun FullscreenCinema(
    playback: RoomPlaybackState,
    syncLocked: Boolean,
    syncCountdown: String?,
    positionMs: Long,
    durationMs: Long,
    isLive: Boolean,
    videoAspectRatio: Float,
    volume: Float,
    micMuted: Boolean,
    subtitleTracks: List<SubtitleTrack>,
    audioTracks: List<AudioTrack>,
    audioTrackSelectionId: String?,
    player: @Composable (Modifier) -> Unit,
    snackbarHost: SnackbarHostState,
    onTogglePlayback: () -> Unit,
    onPositionChange: (Long) -> Unit,
    onSkip: (Float) -> Unit,
    onVolumeChange: (Float) -> Unit,
    onToggleVolume: () -> Unit,
    onToggleFullscreen: () -> Unit,
    onSync: () -> Unit,
    onToggleMic: () -> Unit,
    onOpenSubtitles: () -> Unit,
    onOpenAudioTracks: () -> Unit,
) {
    var controlsVisible by remember { mutableStateOf(true) }
    LaunchedEffect(controlsVisible) {
        if (controlsVisible) {
            delay(CONTROLS_AUTO_HIDE_MS)
            controlsVisible = false
        }
    }
    val paused = playback == RoomPlaybackState.PAUSED
    val buffering = playback == RoomPlaybackState.BUFFERING
    val mediaColors = WatchPartyDesignSystem.colors
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .clickable(
                indication = null,
                interactionSource = remember { MutableInteractionSource() },
            ) {
                controlsVisible = !controlsVisible
            },
    ) {
        BoxWithConstraints(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            val aspectRatio = if (videoAspectRatio > 0f) videoAspectRatio else 16f / 9f
            val containerAspect = maxWidth.value / maxHeight.value
            val playerModifier = if (aspectRatio >= containerAspect) {
                Modifier.width(maxWidth).height(maxWidth / aspectRatio)
            } else {
                Modifier.height(maxHeight).width(maxHeight * aspectRatio)
            }
            player(playerModifier)
        }
        if (paused && !syncLocked) {
            FilledIconButton(
                onClick = onTogglePlayback,
                modifier = Modifier.align(Alignment.Center).size(72.dp),
                colors = IconButtonDefaults.filledIconButtonColors(containerColor = MaterialTheme.colorScheme.primary),
            ) {
                Icon(WatchPartyIcons.PlayArrow, contentDescription = stringResource(Res.string.play), modifier = Modifier.size(38.dp))
            }
        }
        if (controlsVisible) {
            CompositionLocalProvider(LocalContentColor provides mediaColors.onMedia) {
                FullscreenControls(
                    paused = paused,
                    buffering = buffering,
                    positionMs = positionMs,
                    durationMs = durationMs,
                    isLive = isLive,
                    volume = volume,
                    micMuted = micMuted,
                    subtitleTracks = subtitleTracks,
                    audioTracks = audioTracks,
                    audioTrackSelectionId = audioTrackSelectionId,
                    onTogglePlayback = onTogglePlayback,
                    onPositionChange = onPositionChange,
                    onSkip = onSkip,
                    onVolumeChange = onVolumeChange,
                    onToggleVolume = onToggleVolume,
                    onToggleFullscreen = onToggleFullscreen,
                    onSync = onSync,
                    onToggleMic = onToggleMic,
                    onOpenSubtitles = onOpenSubtitles,
                    onOpenAudioTracks = onOpenAudioTracks,
                    modifier = Modifier.align(Alignment.BottomCenter),
                )
            }
        }
        SnackbarHost(
            snackbarHost,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = if (controlsVisible) 128.dp else 24.dp),
        )
        GroupSyncCountdown(syncCountdown)
    }
}

@Composable
private fun FullscreenControls(
    paused: Boolean,
    buffering: Boolean,
    positionMs: Long,
    durationMs: Long,
    isLive: Boolean,
    volume: Float,
    micMuted: Boolean,
    subtitleTracks: List<SubtitleTrack>,
    audioTracks: List<AudioTrack>,
    audioTrackSelectionId: String?,
    onTogglePlayback: () -> Unit,
    onPositionChange: (Long) -> Unit,
    onSkip: (Float) -> Unit,
    onVolumeChange: (Float) -> Unit,
    onToggleVolume: () -> Unit,
    onToggleFullscreen: () -> Unit,
    onSync: () -> Unit,
    onToggleMic: () -> Unit,
    onOpenSubtitles: () -> Unit,
    onOpenAudioTracks: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = WatchPartyDesignSystem.colors
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(Color.Black.copy(alpha = 0.55f))
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        if (isLive) {
            LiveIndicator()
        } else {
            val fraction = if (durationMs > 0L) {
                (positionMs.toFloat() / durationMs.toFloat()).coerceIn(0f, 1f)
            } else {
                0f
            }
            Slider(
                value = fraction,
                onValueChange = { onPositionChange((it * durationMs).toLong()) },
                modifier = Modifier.fillMaxWidth().height(28.dp),
                colors = SliderDefaults.colors(
                    thumbColor = MaterialTheme.colorScheme.primary,
                    activeTrackColor = MaterialTheme.colorScheme.primary,
                    inactiveTrackColor = colors.mediaOutline,
                ),
            )
        }
        if (buffering) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                CircularProgressIndicator(modifier = Modifier.size(16.dp), color = colors.onMedia, strokeWidth = 2.dp)
                Text(stringResource(Res.string.buffering), style = MaterialTheme.typography.labelMedium, color = colors.onMedia)
            }
        }
        BoxWithConstraints(Modifier.fillMaxWidth()) {
            if (maxWidth >= 600.dp) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    PlaybackTime(positionMs, durationMs, isLive, Modifier.weight(1f))
                    TransportControls(paused, isLive, onTogglePlayback, onSkip)
                    FullscreenActionControls(
                        volume, micMuted, subtitleTracks.any(SubtitleTrack::selected), audioTracks.isNotEmpty(),
                        audioTrackSelectionId != null, onOpenSubtitles, onOpenAudioTracks, onVolumeChange, onToggleVolume, onSync, onToggleMic, onToggleFullscreen,
                        Modifier,
                    )
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        PlaybackTime(positionMs, durationMs, isLive, Modifier.weight(1f))
                        TransportControls(paused, isLive, onTogglePlayback, onSkip)
                    }
                    FullscreenActionControls(
                        volume, micMuted, subtitleTracks.any(SubtitleTrack::selected), audioTracks.isNotEmpty(),
                        audioTrackSelectionId != null, onOpenSubtitles, onOpenAudioTracks, onVolumeChange, onToggleVolume, onSync, onToggleMic, onToggleFullscreen,
                        Modifier.fillMaxWidth(),
                    )
                }
            }
        }
    }
}

@Composable
private fun FullscreenActionControls(
    volume: Float,
    micMuted: Boolean,
    subtitlesSelected: Boolean,
    hasAlternativeAudioTracks: Boolean,
    audioTrackSelected: Boolean,
    onOpenSubtitles: () -> Unit,
    onOpenAudioTracks: () -> Unit,
    onVolumeChange: (Float) -> Unit,
    onToggleVolume: () -> Unit,
    onSync: () -> Unit,
    onToggleMic: () -> Unit,
    onToggleFullscreen: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(modifier, verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.End) {
        MaterialIconButton(WatchPartyIcons.Sync, roomSyncActionLabel(), enabled = LocalRoomSyncAction.current.enabled, size = 40.dp, iconSize = 20.dp, onClick = onSync)
        MaterialIconButton(
            WatchPartyIcons.Subtitles,
            stringResource(Res.string.subtitles),
            tonal = subtitlesSelected,
            size = 40.dp,
            iconSize = 20.dp,
            onClick = onOpenSubtitles,
        )
        if (hasAlternativeAudioTracks) {
            MaterialIconButton(
                WatchPartyIcons.GraphicEq,
                stringResource(Res.string.audio_tracks),
                tonal = audioTrackSelected,
                size = 40.dp,
                iconSize = 20.dp,
                onClick = onOpenAudioTracks,
            )
        }
        MaterialIconButton(
            if (micMuted) WatchPartyIcons.MicOff else WatchPartyIcons.Mic,
            stringResource(if (micMuted) Res.string.unmute else Res.string.mute),
            size = 40.dp,
            iconSize = 20.dp,
            onClick = onToggleMic,
        )
        MaterialIconButton(
            if (volume == 0f) WatchPartyIcons.VolumeOff else WatchPartyIcons.VolumeUp,
            stringResource(if (volume == 0f) Res.string.unmute_video else Res.string.mute_video),
            size = 40.dp,
            iconSize = 20.dp,
            onClick = onToggleVolume,
        )
        Slider(
            value = volume,
            onValueChange = onVolumeChange,
            modifier = Modifier.widthIn(min = 64.dp, max = 96.dp).weight(1f, fill = false),
            colors = SliderDefaults.colors(
                thumbColor = MaterialTheme.colorScheme.primary,
                activeTrackColor = MaterialTheme.colorScheme.primary,
                inactiveTrackColor = WatchPartyDesignSystem.colors.mediaOutline,
            ),
        )
        MaterialIconButton(WatchPartyIcons.FullscreenExit, stringResource(Res.string.exit_fullscreen), size = 40.dp, iconSize = 20.dp, onClick = onToggleFullscreen)
    }
}

@Composable
private fun SubtitleSelectionDialog(
    tracks: List<SubtitleTrack>,
    canChooseFile: Boolean,
    onDismiss: () -> Unit,
    onSelect: (String?) -> Unit,
    onChooseFile: () -> Unit,
) {
    WatchPartyDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(Res.string.subtitles)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.extraSmall)) {
                if (tracks.isEmpty()) {
                    Text(
                        stringResource(Res.string.no_subtitle_tracks),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                } else {
                    SubtitleChoice(
                        label = stringResource(Res.string.subtitles_off),
                        selected = tracks.none(SubtitleTrack::selected),
                        onClick = { onSelect(null) },
                    )
                    tracks.forEach { track ->
                        SubtitleChoice(
                            label = track.label,
                            selected = track.selected,
                            onClick = { onSelect(track.id) },
                        )
                    }
                }
            }
        },
        confirmButton = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (canChooseFile) {
                    TextButton(onClick = onChooseFile) {
                        Icon(WatchPartyIcons.Subtitles, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text(stringResource(Res.string.choose_subtitle_file))
                    }
                }
                TextButton(onClick = onDismiss) { Text(stringResource(Res.string.done)) }
            }
        },
    )
}

@Composable
private fun SubtitleChoice(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 48.dp)
            .clickable(onClick = onClick),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        RadioButton(selected = selected, onClick = onClick)
        Text(label, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyLarge)
    }
}

@Composable
private fun AudioTrackSelectionDialog(
    tracks: List<AudioTrack>,
    selectedTrackId: String?,
    onDismiss: () -> Unit,
    onSelect: (String?) -> Unit,
) {
    WatchPartyDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(Res.string.audio_tracks)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.extraSmall)) {
                if (tracks.isEmpty()) {
                    Text(
                        stringResource(Res.string.no_audio_tracks),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                } else {
                    AudioTrackChoice(
                        label = stringResource(Res.string.audio_track_automatic),
                        selected = selectedTrackId == null,
                        onClick = { onSelect(null) },
                    )
                    if (tracks.size > 1) {
                        tracks.forEach { track ->
                            AudioTrackChoice(
                                label = track.label,
                                selected = track.id == selectedTrackId,
                                onClick = { onSelect(track.id) },
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text(stringResource(Res.string.done)) }
        },
    )
}

@Composable
private fun AudioTrackChoice(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 48.dp)
            .clickable(onClick = onClick),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        RadioButton(selected = selected, onClick = onClick)
        Text(label, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyLarge)
    }
}

@Composable
private fun SyncBand(paused: Boolean, onSync: () -> Unit) {
    val status: @Composable () -> Unit = {
        val playbackLabel = stringResource(Res.string.local_playback)
        if (playbackLabel.isNotBlank()) Text(playbackLabel, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.secondary)
        Text(stringResource(if (paused) Res.string.paused_for_you else Res.string.playing_for_you), style = MaterialTheme.typography.titleMedium)
    }
    val syncButton: @Composable () -> Unit = {
        FilledTonalButton(enabled = LocalRoomSyncAction.current.enabled, onClick = onSync) {
            Icon(WatchPartyIcons.Sync, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(6.dp))
            Text(roomSyncActionLabel())
        }
    }
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.extraLarge,
        color = MaterialTheme.colorScheme.secondaryContainer,
        contentColor = MaterialTheme.colorScheme.onSecondaryContainer,
    ) {
        BoxWithConstraints(Modifier.padding(horizontal = 20.dp, vertical = 14.dp)) {
            if (maxWidth < 480.dp) {
                Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    status()
                    syncButton()
                }
            } else {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Column(Modifier.weight(1f)) { status() }
                    syncButton()
                }
            }
        }
    }
}

@Composable
private fun OwnerAwayBanner(ownerName: String) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = WatchPartyDesignSystem.shapes.largeIncreased,
        color = MaterialTheme.colorScheme.tertiaryContainer,
        contentColor = MaterialTheme.colorScheme.onTertiaryContainer,
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(stringResource(Res.string.owner_away), style = MaterialTheme.typography.labelLarge)
            Text("$ownerName ${stringResource(Res.string.left_the_room)}", style = MaterialTheme.typography.titleMedium)
            Text(stringResource(Res.string.owner_away_copy), style = MaterialTheme.typography.bodyMedium)
        }
    }
}

@Composable
private fun RoomSupportPanel(
    localFileName: String? = null,
    onChangeSource: (() -> Unit)? = null,
    participants: List<RoomParticipant>,
    expandedRoom: Boolean,
    micMuted: Boolean,
    voiceState: VoiceConnectionState,
    voiceFailureCode: String?,
    onRetryVoice: () -> Unit,
    videoUrl: String,
    streamActive: Boolean,
    isOwner: Boolean,
    ownerPresent: Boolean,
    onJoinVoice: () -> Unit,
    onToggleMic: () -> Unit,
    onCopyLink: () -> Unit,
    onEndStream: () -> Unit,
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = androidx.compose.ui.graphics.Color.Transparent,
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            ParticipantSection(participants, micMuted, expandedRoom)
            HorizontalDivider(color = DividerDefaults.color)
            VoicePanel(voiceState, voiceFailureCode, micMuted, onJoinVoice, onToggleMic)
            if (voiceState == VoiceConnectionState.DEGRADED || participants.any { it.voiceStatus == VoicePeerStatus.UNAVAILABLE }) {
                OutlinedButton(onClick = onRetryVoice, modifier = Modifier.fillMaxWidth()) {
                    Text(stringResource(Res.string.voice_retry_connections))
                }
            }
            if (voiceFailureCode == "VOICE_SERVICE_UNAVAILABLE" || voiceFailureCode == "VOICE_AUDIO_DEVICE_FAILED") {
                Text(stringResource(if (voiceFailureCode == "VOICE_SERVICE_UNAVAILABLE") Res.string.voice_service_failed else Res.string.voice_audio_device_failed),
                    color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium)
            }
            if (streamActive) {
                HorizontalDivider(color = DividerDefaults.color)
                if(localFileName==null)SourceRow(videoUrl,onCopyLink) else Text(localFileName,style=MaterialTheme.typography.titleMedium)
                if(onChangeSource!=null)TextButton(onClick=onChangeSource){Text(stringResource(Res.string.local_change))}
            }
            if (isOwner && ownerPresent && streamActive) {
                Button(
                    onClick = onEndStream,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer,
                        contentColor = MaterialTheme.colorScheme.onErrorContainer,
                    ),
                ) {
                    Icon(WatchPartyIcons.Stop, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(stringResource(Res.string.end_stream_for_everyone))
                }
            }
        }
    }
}

@Composable
private fun ParticipantSection(participants: List<RoomParticipant>, micMuted: Boolean, expandedRoom: Boolean) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(stringResource(Res.string.voice_party), style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                Text(stringResource(Res.string.room_members), style = MaterialTheme.typography.titleLarge)
            }
            Surface(shape = CircleShape, color = MaterialTheme.colorScheme.primaryContainer) {
                Text(
                    text = participants.size.toString(),
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                )
            }
        }
        BoxWithConstraints(Modifier.fillMaxWidth()) {
            val largeText = androidx.compose.ui.platform.LocalDensity.current.fontScale > 1.3f
            val columns = if (largeText || maxWidth < 280.dp) 1 else if (expandedRoom) 3 else 2
            val gap = 10.dp
            val itemWidth = (maxWidth - gap * (columns - 1)) / columns
            FlowRow(horizontalArrangement = Arrangement.spacedBy(gap), verticalArrangement = Arrangement.spacedBy(gap), maxItemsInEachRow = columns) {
                participants.forEach { ParticipantRow(it, micMuted, expandedRoom && columns > 1, Modifier.width(itemWidth)) }
            }
        }
    }
}

@Composable
private fun ParticipantRow(participant: RoomParticipant, micMuted: Boolean, stacked: Boolean, modifier: Modifier = Modifier) {
    val speaking = participant.isPresent && participant.isSpeaking && !(participant.isSelf && micMuted)
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = if (speaking) WatchPartyDesignSystem.shapes.extraLargeIncreased else MaterialTheme.shapes.large,
        color = if (speaking) MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.surfaceContainerLowest,
        contentColor = if (speaking) MaterialTheme.colorScheme.onSecondaryContainer else MaterialTheme.colorScheme.onSurface,
    ) {
        val copy: @Composable () -> Unit = {
            Column(horizontalAlignment = if (stacked) Alignment.CenterHorizontally else Alignment.Start) {
                Text(if (participant.isSelf) stringResource(Res.string.chat_you) else participant.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, textAlign = if (stacked) androidx.compose.ui.text.style.TextAlign.Center else androidx.compose.ui.text.style.TextAlign.Start)
                Text(
                    when {
                        participant.voiceStatus == VoicePeerStatus.CONNECTING -> stringResource(Res.string.voice_peer_connecting)
                        participant.voiceStatus == VoicePeerStatus.RECONNECTING -> stringResource(Res.string.voice_peer_reconnecting)
                        participant.voiceStatus == VoicePeerStatus.UNAVAILABLE -> stringResource(Res.string.voice_peer_unavailable)
                        !participant.isPresent -> stringResource(Res.string.away)
                        participant.isHost -> stringResource(Res.string.host)
                        speaking -> stringResource(Res.string.speaking)
                        participant.isMuted || (participant.isSelf && micMuted) -> stringResource(Res.string.mic_muted)
                        else -> stringResource(Res.string.listening)
                    },
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        if (stacked) Column(Modifier.padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(10.dp)) {
            ParticipantAvatar(participant, speaking)
            copy()
        } else Row(Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            ParticipantAvatar(participant, speaking)
            Box(Modifier.weight(1f)) { copy() }
        }
    }
}

@Composable
private fun ParticipantAvatar(participant: RoomParticipant, speaking: Boolean) {
    val painter = when (participant.avatar) {
        RoomAvatar.COMET -> painterResource(Res.drawable.avatar_comet)
        RoomAvatar.MINT -> painterResource(Res.drawable.avatar_mint)
        RoomAvatar.SUNNY -> painterResource(Res.drawable.avatar_sunny)
        RoomAvatar.BERRY -> painterResource(Res.drawable.avatar_berry)
        RoomAvatar.CLOUD -> painterResource(Res.drawable.avatar_cloud)
        RoomAvatar.EMBER -> painterResource(Res.drawable.avatar_ember)
        RoomAvatar.NOVA -> painterResource(Res.drawable.avatar_nova)
        RoomAvatar.ORBIT -> painterResource(Res.drawable.avatar_orbit)
        RoomAvatar.PRISM -> painterResource(Res.drawable.avatar_prism)
        RoomAvatar.ECHO -> painterResource(Res.drawable.avatar_echo)
        RoomAvatar.SPARK -> painterResource(Res.drawable.avatar_spark)
        RoomAvatar.BLOOM -> painterResource(Res.drawable.avatar_bloom)
    }
    val avatarShape = if (speaking) WatchPartyDesignSystem.shapes.largeIncreased else CircleShape
    Box(
        modifier = Modifier
            .size(56.dp)
            .clip(avatarShape)
            .background(MaterialTheme.colorScheme.surfaceContainerHigh)
            .border(
                width = if (speaking) 4.dp else 2.dp,
                color = if (speaking) WatchPartyDesignSystem.colors.speaker else MaterialTheme.colorScheme.outlineVariant,
                shape = avatarShape,
            ),
        contentAlignment = Alignment.Center,
    ) {
        Image(painter = painter, contentDescription = participant.name, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
        Surface(
            modifier = Modifier.align(Alignment.BottomEnd).size(22.dp),
            shape = CircleShape,
            color = MaterialTheme.colorScheme.surfaceContainerHighest,
        ) {
            Icon(
                imageVector = if (participant.isMuted) WatchPartyIcons.MicOff else WatchPartyIcons.Mic,
                contentDescription = null,
                modifier = Modifier.fillMaxSize().padding(3.dp),
            )
        }
    }
}

@Composable
private fun VoicePanel(
    voiceState: VoiceConnectionState,
    voiceFailureCode: String?,
    micMuted: Boolean,
    onJoinVoice: () -> Unit,
    onToggleMic: () -> Unit,
) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Column(Modifier.weight(1f)) {
            Text(stringResource(Res.string.voice_room), style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
            Text(
                when (voiceState) {
                    VoiceConnectionState.IDLE -> stringResource(Res.string.voice_idle_copy)
                    VoiceConnectionState.CONNECTING -> stringResource(Res.string.joining_voice)
                    VoiceConnectionState.DEGRADED -> stringResource(Res.string.voice_degraded)
                    VoiceConnectionState.RECONNECTING -> stringResource(Res.string.voice_reconnecting)
                    VoiceConnectionState.FAILED -> stringResource(
                        if (voiceFailureCode == "NETWORK") Res.string.voice_network_failed else Res.string.voice_connection_failed,
                    )
                    VoiceConnectionState.CONNECTED -> stringResource(if (micMuted) Res.string.your_mic_is_muted else Res.string.your_mic_is_on)
                },
                style = MaterialTheme.typography.titleMedium,
            )
        }
        when (voiceState) {
            VoiceConnectionState.CONNECTING -> CircularProgressIndicator(Modifier.size(24.dp))
            VoiceConnectionState.CONNECTED, VoiceConnectionState.DEGRADED, VoiceConnectionState.RECONNECTING -> FilledIconButton(
                onClick = onToggleMic,
                colors = IconButtonDefaults.filledIconButtonColors(containerColor = MaterialTheme.colorScheme.secondaryContainer, contentColor = MaterialTheme.colorScheme.onSecondaryContainer),
            ) {
                Icon(
                    if (micMuted) WatchPartyIcons.MicOff else WatchPartyIcons.Mic,
                    contentDescription = stringResource(if (micMuted) Res.string.unmute else Res.string.mute),
                    modifier = Modifier.size(24.dp),
                )
            }
            else -> Button(onClick = onJoinVoice) {
                Text(stringResource(Res.string.join_voice))
            }
        }
    }
}

@Composable
private fun SourceRow(videoUrl: String, onCopyLink: () -> Unit) {
    val fileName = videoUrl.videoFileName() ?: stringResource(Res.string.video_link)
    Row(verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text(stringResource(Res.string.video_source), style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(fileName, style = MaterialTheme.typography.titleMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        MaterialIconButton(WatchPartyIcons.ContentCopy, stringResource(Res.string.copy_video_link), size = 48.dp, iconSize = 22.dp, onClick = onCopyLink)
    }
}

private fun String.videoFileName(): String? {
    val urlWithoutSuffix = substringBefore('#').substringBefore('?')
    val path = urlWithoutSuffix.substringAfter("://", missingDelimiterValue = "").substringAfter('/', missingDelimiterValue = "")
    return path.substringAfterLast('/').takeIf(String::isNotBlank)
}

@Composable
private fun InviteFriendsDialog(
    partyCode: String,
    inviteLink: String,
    copyState: InviteCopyState,
    onDismiss: () -> Unit,
    onCopied: (InviteCopyTarget) -> Unit,
    onCopyFailed: () -> Unit,
) {
    val clipboard = LocalClipboardManager.current
    val shareLink = rememberPlatformInviteShare()
    var shareFailed by remember(inviteLink) { mutableStateOf(false) }

    fun copy(value: String, target: InviteCopyTarget) {
        loggedRunCatching("RoomScreen.run1") { clipboard.setText(AnnotatedString(value)) }
            .onSuccess {
                onCopied(target)
            }
            .onFailure {
                onCopyFailed()
            }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false),
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(WatchPartyDesignSystem.spacing.small),
            contentAlignment = Alignment.Center,
        ) {
            InviteFriendsDialogCard(
                partyCode = partyCode,
                inviteLink = inviteLink,
                copyState = copyState,
                onCopyCode = { copy(partyCode, InviteCopyTarget.CODE) },
                onCopyLink = { copy(inviteLink, InviteCopyTarget.LINK) },
                onShareLink = shareLink?.let { share ->
                    { shareFailed = !share(inviteLink) }
                },
                shareFailed = shareFailed,
                onDismiss = onDismiss,
            )
        }
    }
}

@Composable
private fun InviteFriendsDialogCard(
    partyCode: String,
    inviteLink: String,
    copyState: InviteCopyState,
    onCopyCode: () -> Unit,
    onCopyLink: () -> Unit,
    onDismiss: () -> Unit,
    onShareLink: (() -> Unit)? = null,
    shareFailed: Boolean = false,
) {
    Surface(
        modifier = Modifier
            .widthIn(max = 520.dp)
            .fillMaxWidth()
            .heightIn(max = 720.dp),
        shape = MaterialTheme.shapes.extraLarge,
        color = MaterialTheme.colorScheme.surfaceContainerHigh,
        contentColor = MaterialTheme.colorScheme.onSurface,
        tonalElevation = 6.dp,
    ) {
        Column {
            Row(
                modifier = Modifier.padding(start = 24.dp, top = 16.dp, end = 8.dp, bottom = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = stringResource(Res.string.invite_friends),
                    modifier = Modifier.weight(1f),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                )
                val closeLabel = stringResource(Res.string.close)
                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier.semantics { contentDescription = closeLabel },
                ) {
                    Icon(WatchPartyIcons.Close, contentDescription = null)
                }
            }

            Column(
                modifier = Modifier
                    .weight(1f, fill = false)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 24.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.small),
            ) {
                Text(
                    text = stringResource(Res.string.invite_friends_description),
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                InviteShareOption(
                    label = stringResource(Res.string.party_code),
                    value = partyCode,
                    buttonLabel = stringResource(
                        if (copyState == InviteCopyState.CODE) Res.string.code_copied else Res.string.copy_code,
                    ),
                    copied = copyState == InviteCopyState.CODE,
                    tonal = true,
                    onCopy = onCopyCode,
                )
                InviteShareOption(
                    label = stringResource(Res.string.prototype_invite_link),
                    value = inviteLink,
                    buttonLabel = stringResource(
                        if (onShareLink != null) Res.string.share_invite
                        else if (copyState == InviteCopyState.LINK) Res.string.link_copied else Res.string.copy_link,
                    ),
                    copied = onShareLink == null && copyState == InviteCopyState.LINK,
                    tonal = false,
                    share = onShareLink != null,
                    onCopy = onShareLink ?: onCopyLink,
                )
                if (copyState == InviteCopyState.ERROR || shareFailed) {
                    Surface(
                        shape = MaterialTheme.shapes.medium,
                        color = MaterialTheme.colorScheme.errorContainer,
                        contentColor = MaterialTheme.colorScheme.onErrorContainer,
                    ) {
                        Text(
                            text = stringResource(
                                if (shareFailed) Res.string.share_unavailable_details else Res.string.copy_unavailable_details,
                            ),
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                }
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 24.dp, top = 8.dp, end = 24.dp, bottom = 16.dp),
                horizontalArrangement = Arrangement.End,
            ) {
                TextButton(onClick = onDismiss) {
                    Text(stringResource(Res.string.done))
                }
            }
        }
    }
}

@Composable
private fun InviteShareOption(
    label: String,
    value: String,
    buttonLabel: String,
    copied: Boolean,
    tonal: Boolean,
    share: Boolean = false,
    onCopy: () -> Unit,
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = WatchPartyDesignSystem.shapes.largeIncreased,
        color = MaterialTheme.colorScheme.surfaceContainerLowest,
        contentColor = MaterialTheme.colorScheme.onSurface,
    ) {
        BoxWithConstraints(Modifier.padding(WatchPartyDesignSystem.spacing.small)) {
            val horizontal = maxWidth >= 400.dp
            val field: @Composable (Modifier) -> Unit = { fieldModifier ->
                WatchPartyTextField(
                    value = value,
                    textStyle = MaterialTheme.typography.bodyLarge.copy(textDirection = androidx.compose.ui.text.style.TextDirection.Ltr),
                    onValueChange = {},
                    modifier = fieldModifier,
                    readOnly = true,
                    singleLine = true,
                    label = label,
                )
            }
            val action: @Composable () -> Unit = {
                val icon = if (copied) {
                    WatchPartyIcons.Check
                } else if (share) {
                    WatchPartyIcons.Share
                } else if (tonal) {
                    WatchPartyIcons.ContentCopy
                } else {
                    WatchPartyIcons.Link
                }
                if (tonal) {
                    FilledTonalButton(
                        onClick = onCopy,
                        modifier = Modifier.heightIn(min = 48.dp),
                    ) {
                        Icon(icon, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text(buttonLabel)
                    }
                } else {
                    OutlinedButton(
                        onClick = onCopy,
                        modifier = Modifier.heightIn(min = 48.dp),
                    ) {
                        Icon(icon, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text(buttonLabel)
                    }
                }
            }

            if (horizontal) {
                Row(
                    verticalAlignment = Alignment.Bottom,
                    horizontalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.extraSmall),
                ) {
                    field(Modifier.weight(1f))
                    action()
                }
            } else {
                Column(
                    verticalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.extraSmall),
                ) {
                    field(Modifier.fillMaxWidth())
                    Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.CenterEnd) {
                        action()
                    }
                }
            }
        }
    }
}

@Composable
private fun CurrentVideoLinkDialog(
    videoUrl: String,
    onDismiss: () -> Unit,
) {
    val clipboard = LocalClipboardManager.current
    var copied by remember(videoUrl) { mutableStateOf(false) }
    var copyFailed by remember(videoUrl) { mutableStateOf(false) }
    val copyLabel = stringResource(if (copied) Res.string.link_copied else Res.string.copy_link)
    WatchPartyDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(Res.string.current_video_link)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.small)) {
                Text(
                    stringResource(Res.string.current_video_link_description),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Row(
                    verticalAlignment = Alignment.Top,
                    horizontalArrangement = Arrangement.spacedBy(WatchPartyDesignSystem.spacing.extraSmall),
                ) {
                    WatchPartyTextField(
                        value = videoUrl,
                        textStyle = MaterialTheme.typography.bodyLarge.copy(textDirection = androidx.compose.ui.text.style.TextDirection.Ltr),
                        onValueChange = {},
                        modifier = Modifier.weight(1f),
                        readOnly = true,
                        minLines = 2,
                        maxLines = 4,
                        label = stringResource(Res.string.video_link),
                    )
                    FilledTonalIconButton(
                        onClick = {
                            loggedRunCatching("RoomScreen.run2") { clipboard.setText(AnnotatedString(videoUrl)) }
                                .onSuccess {
                                    copied = true
                                    copyFailed = false
                                }
                                .onFailure {
                                    copied = false
                                    copyFailed = true
                                }
                        },
                        enabled = videoUrl.isNotBlank(),
                        modifier = Modifier.semantics { contentDescription = copyLabel },
                    ) {
                        Icon(
                            imageVector = if (copied) WatchPartyIcons.Check else WatchPartyIcons.ContentCopy,
                            contentDescription = null,
                        )
                    }
                }
                if (copied) {
                    Text(
                        text = stringResource(Res.string.video_link_copied),
                        modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary,
                    )
                }
                if (copyFailed) {
                    Text(
                        text = stringResource(Res.string.copy_video_link_unavailable_details),
                        modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error,
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(stringResource(Res.string.done))
            }
        },
    )
}

private val PreviewPlayer: @Composable (Modifier) -> Unit = { modifier ->
    CinemaScene(modifier = modifier, showTitle = true, muted = false)
}

@Preview(name = "Owner empty · compact", widthDp = 412, heightDp = 920)
@Composable
private fun OwnerEmptyRoomPreview() = AppTheme(onThemeChanged = {}) {
    RoomScreen(RoomUiState(ownerEmptyRoom), playerContent = PreviewPlayer)
}

@Preview(name = "Owner playing · compact", widthDp = 412, heightDp = 920)
@Composable
private fun OwnerPlayingRoomPreview() = AppTheme(onThemeChanged = {}) {
    RoomScreen(RoomUiState(ownerEmptyRoom.copy(playback = RoomPlaybackState.PLAYING)), playerContent = PreviewPlayer)
}

@Preview(name = "Owner playing · small", widthDp = 360, heightDp = 800)
@Composable
private fun OwnerPlayingSmallPreview() = AppTheme(onThemeChanged = {}) {
    RoomScreen(RoomUiState(ownerEmptyRoom.copy(playback = RoomPlaybackState.PLAYING)), playerContent = PreviewPlayer)
}

@Preview(name = "Invite friends · compact", widthDp = 360, heightDp = 720)
@Composable
private fun InviteFriendsDialogCompactPreview() = AppTheme(onThemeChanged = {}) {
    Box(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        contentAlignment = Alignment.Center,
    ) {
        InviteFriendsDialogCard(
            partyCode = "NOVA-27",
            inviteLink = RoomInviteLinks.create("NOVA-27"),
            copyState = InviteCopyState.IDLE,
            onCopyCode = {},
            onCopyLink = {},
            onDismiss = {},
        )
    }
}

@Preview(name = "Invite friends · copied", widthDp = 540, heightDp = 620)
@Composable
private fun InviteFriendsDialogCopiedPreview() = AppTheme(onThemeChanged = {}) {
    Box(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        contentAlignment = Alignment.Center,
    ) {
        InviteFriendsDialogCard(
            partyCode = "NOVA-27",
            inviteLink = RoomInviteLinks.create("NOVA-27"),
            copyState = InviteCopyState.CODE,
            onCopyCode = {},
            onCopyLink = {},
            onDismiss = {},
        )
    }
}

@Preview(name = "Guest playing · desktop", widthDp = 1200, heightDp = 800)
@Composable
private fun GuestPlayingDesktopPreview() = AppTheme(onThemeChanged = {}) {
    RoomScreen(RoomUiState(guestPlayingRoom), playerContent = PreviewPlayer)
}

@Preview(name = "Guest waiting · compact", widthDp = 412, heightDp = 920)
@Composable
private fun GuestWaitingPreview() = AppTheme(onThemeChanged = {}) {
    RoomScreen(RoomUiState(guestPlayingRoom.copy(playback = RoomPlaybackState.WAITING_FOR_OWNER)), playerContent = PreviewPlayer)
}

@Preview(name = "Owner away · desktop", widthDp = 1200, heightDp = 800)
@Composable
private fun OwnerAwayDesktopPreview() = AppTheme(onThemeChanged = {}) {
    RoomScreen(
        RoomUiState(
            guestPlayingRoom.copy(
                ownerPresent = false,
                playback = RoomPlaybackState.PLAYING,
            ),
        ),
        playerContent = PreviewPlayer,
    )
}

@Composable
internal fun BugReportDialog(state: BugReportState, onAction: (RoomAction) -> Unit) {
    var readingScreenshot by remember { mutableStateOf(false) }
    val screenshotActions = rememberReportScreenshotPicker(
        onPicked = { onAction(RoomAction.BugScreenshotsAdded(listOf(it))) },
        onError = { onAction(RoomAction.BugScreenshotFailed(it)) },
        onBusy = { readingScreenshot = it },
    )
    BugReportDialogContent(state, onAction, screenshotActions, readingScreenshot, rememberReportNetworkAvailable() != false)
}

@Composable
internal fun BugReportDialogContent(
    state: BugReportState,
    onAction: (RoomAction) -> Unit,
    screenshotActions: ReportScreenshotActions?,
    readingScreenshot: Boolean = false,
    online: Boolean = true,
) {
    val busy = state.bugSending || readingScreenshot
    WatchPartyDialog(
        onDismissRequest = { if (!busy) onAction(RoomAction.BugReportDismissed) },
        dismissEnabled = !busy,
        title = { Text(stringResource(Res.string.report_bug)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                if (state.bugSent) {
                    Text(stringResource(Res.string.bug_report_sent))
                } else {
                    WatchPartyTextField(
                        value = state.bugDescription,
                        onValueChange = { onAction(RoomAction.BugDescriptionChanged(it)) },
                        label = stringResource(Res.string.bug_report_description),
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 4, maxLines = 8, enabled = !busy,
                    )
                    if (screenshotActions != null) {
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(onClick = screenshotActions.pick, enabled = !busy && state.bugScreenshots.size < 3) { Text(stringResource(Res.string.bug_screenshot_attach)) }
                            OutlinedButton(onClick = screenshotActions.paste, enabled = !busy && state.bugScreenshots.size < 3) { Text(stringResource(Res.string.bug_screenshot_paste)) }
                        }
                        Text(stringResource(Res.string.bug_screenshot_hint), style = MaterialTheme.typography.bodySmall)
                    }
                    if (readingScreenshot) Text(stringResource(Res.string.bug_screenshot_reading))
                    state.bugScreenshots.forEachIndexed { index, image ->
                        val bytes = remember(image) { kotlin.io.encoding.Base64.decode(image.data) }
                        coil3.compose.AsyncImage(
                            model = bytes,
                            contentDescription = stringResource(Res.string.bug_screenshot_number, index + 1),
                            contentScale = ContentScale.Fit,
                            modifier = Modifier.fillMaxWidth().heightIn(max = 160.dp),
                        )
                        TextButton(onClick = { onAction(RoomAction.BugScreenshotRemoved(index)) }, enabled = !busy) {
                            Text(stringResource(Res.string.bug_screenshot_remove, index + 1))
                        }
                    }
                    state.bugScreenshotError?.let { code ->
                        Text(stringResource(when (code) {
                            "SCREENSHOTS_TOO_LARGE" -> Res.string.bug_screenshot_limit
                            "SCREENSHOT_CLIPBOARD_EMPTY" -> Res.string.bug_screenshot_clipboard_empty
                            else -> Res.string.bug_screenshot_unreadable
                        }), color = MaterialTheme.colorScheme.error)
                    }
                    if (!online) Text(stringResource(Res.string.bug_report_offline), style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.semantics { liveRegion = androidx.compose.ui.semantics.LiveRegionMode.Polite })
                    if (state.bugError != null) {
                        Text(stringResource(when (state.bugError) {
                            "REPORT_TOO_LARGE" -> Res.string.bug_report_too_large
                            "RATE_LIMITED" -> Res.string.bug_report_rate_limited
                            else -> Res.string.bug_report_failed
                        }), color = MaterialTheme.colorScheme.error)
                    }
                }
            }
        },
        confirmButton = {
            if (state.bugSent) TextButton(onClick = { onAction(RoomAction.BugReportDismissed) }) { Text(stringResource(Res.string.done)) }
            else Button(onClick = { onAction(RoomAction.BugReportSend) }, enabled = online && !busy && state.bugDescription.isNotBlank()) {
                Text(stringResource(if (state.bugSending) Res.string.bug_report_sending else Res.string.bug_report_send))
            }
        },
        dismissButton = {
            if (!state.bugSent) TextButton(onClick = { onAction(RoomAction.BugReportDismissed) }, enabled = !busy) { Text(stringResource(Res.string.cancel)) }
        },
    )
}
