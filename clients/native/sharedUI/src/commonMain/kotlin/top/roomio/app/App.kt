package top.roomio.app.ui

import watchparty.sharedui.generated.resources.roomio
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import top.roomio.domain.profile.ThemePreferencesRepository
import top.roomio.domain.profile.ThemeColor
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import top.roomio.domain.launcher.LauncherIconController
import top.roomio.app.theme.ThemeLauncherIcon
import androidx.compose.ui.tooling.preview.Preview
import dev.zacsweers.metro.DependencyGraph
import dev.zacsweers.metro.Provides
import dev.zacsweers.metro.createGraphFactory
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import top.roomio.app.locale.AppLanguageEnvironment
import top.roomio.app.home.HomeViewModel
import top.roomio.app.manager.PartyManagerViewModel
import top.roomio.app.navigation.WatchPartyNavigation
import top.roomio.app.preview.RoomPreviewViewModel
import top.roomio.app.profile.SettingsViewModel
import top.roomio.app.room.RoomViewModel
import top.roomio.app.theme.AppTheme
import top.roomio.domain.party.GuestIdentity
import top.roomio.domain.party.GuestSession
import top.roomio.domain.party.Member
import top.roomio.domain.party.RealtimeClient
import top.roomio.domain.party.RealtimeEvent
import top.roomio.domain.party.RealtimeSession
import top.roomio.domain.party.Room
import top.roomio.domain.party.RoomAvailability
import top.roomio.domain.party.RoomPreview
import top.roomio.domain.party.RoomRepository
import top.roomio.domain.party.RoomSnapshot
import top.roomio.domain.party.RoomSession
import top.roomio.domain.party.SessionKeeper
import top.roomio.domain.party.SessionRepository
import top.roomio.domain.party.StreamInfo
import top.roomio.domain.party.StreamState
import top.roomio.domain.party.VoiceClient
import top.roomio.domain.party.VoiceCoordinator
import top.roomio.domain.party.CoordinatedVoiceState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.emptyFlow
import top.roomio.domain.party.VoiceEvent
import top.roomio.domain.party.VoiceSession
import top.roomio.domain.party.IceServer
import top.roomio.domain.party.VoiceConfiguration
import top.roomio.domain.profile.ProfileAvatarId
import top.roomio.domain.profile.ProfileRepository
import top.roomio.domain.profile.UserProfile

@DependencyGraph
internal interface PresentationGraph {
    val homeViewModel: HomeViewModel
    val settingsViewModel: SettingsViewModel
    val partyManagerViewModelFactory: PartyManagerViewModel.Factory
    val roomPreviewViewModelFactory: RoomPreviewViewModel.Factory
    val roomViewModelFactory: RoomViewModel.Factory

    @DependencyGraph.Factory
    fun interface Factory {
        fun create(
            @Provides profileRepository: ProfileRepository,
            @Provides themePreferencesRepository: ThemePreferencesRepository,
            @Provides sessionRepository: SessionRepository,
            @Provides roomRepository: RoomRepository,
            @Provides realtimeClient: RealtimeClient,
            @Provides voiceCoordinator: VoiceCoordinator,
            @Provides sessionKeeper: SessionKeeper,
        ): PresentationGraph
    }
}

@Preview
@Composable
private fun AppPreview() = WatchPartyUi(
    profileRepository = PreviewProfileRepository,
    sessionRepository = PreviewSessionRepository,
    roomRepository = PreviewRoomRepository,
    realtimeClient = PreviewRealtimeClient,
    voiceCoordinator = PreviewVoiceCoordinator,
    sessionKeeper = PreviewSessionKeeper,
)

@Composable
fun WatchPartyUi(
    profileRepository: ProfileRepository,
    themePreferencesRepository: ThemePreferencesRepository = PreviewThemePreferencesRepository,
    sessionRepository: SessionRepository = PreviewSessionRepository,
    roomRepository: RoomRepository = PreviewRoomRepository,
    realtimeClient: RealtimeClient = PreviewRealtimeClient,
    voiceCoordinator: VoiceCoordinator = PreviewVoiceCoordinator,
    sessionKeeper: SessionKeeper = PreviewSessionKeeper,
    onThemeChanged: @Composable (isDark: Boolean) -> Unit = {},
    launcherIconController: LauncherIconController? = null,
    onAppNameChanged: (String) -> Unit = {},
) {
    val presentationGraph = remember(themePreferencesRepository, profileRepository, sessionRepository, roomRepository, realtimeClient, voiceCoordinator, sessionKeeper) {
        createGraphFactory<PresentationGraph.Factory>().create(
            profileRepository,
            themePreferencesRepository,
            sessionRepository,
            roomRepository,
            realtimeClient,
            voiceCoordinator,
            sessionKeeper,
        )
    }

    val themeColor by themePreferencesRepository.color.collectAsState()
    val profile by profileRepository.observeProfile().collectAsState(profileRepository.currentProfile())
    AppLanguageEnvironment(profile.language) {
        val appName = org.jetbrains.compose.resources.stringResource(watchparty.sharedui.generated.resources.Res.string.roomio)
        androidx.compose.runtime.LaunchedEffect(appName) { onAppNameChanged(appName) }
        AppTheme(onThemeChanged, themeColor = themeColor) {
            Box(Modifier.fillMaxSize()) {
                WatchPartyNavigation(
                    presentationGraph = presentationGraph,
                    modifier = Modifier,
                )
                if (launcherIconController != null && launcherIconController.isSupported) {
                    ThemeLauncherIcon(themeColor, launcherIconController)
                }
            }
        }
    }
}

private object PreviewThemePreferencesRepository : ThemePreferencesRepository {
    override val color = MutableStateFlow(ThemeColor.ROOMIO)
    override fun selectColor(color: ThemeColor): Result<Unit> { this.color.value = color; return Result.success(Unit) }
}

private val previewProfile = UserProfile("Nika", ProfileAvatarId.COMET)

private object PreviewProfileRepository : ProfileRepository {
    override fun observeProfile() = flowOf(previewProfile)
    override fun currentProfile() = previewProfile
    override fun saveProfile(profile: UserProfile) = Result.success(Unit)
}

private object PreviewSessionRepository : SessionRepository {
    private val session = GuestSession(
        identity = GuestIdentity("preview", "Nika", "COMET", "en"),
        accessToken = "preview",
        refreshToken = "preview",
    )

    override suspend fun ensureSession(name: String, avatar: String, language: String) = session
    override suspend fun currentSession() = session
    override suspend fun reset() = Unit
    override suspend fun refresh() = session
    override suspend fun updateProfile(name: String, avatar: String, language: String) = session.identity
}

private object PreviewRoomRepository : RoomRepository {
    private val room = Room("preview", "MOON-42", "Friday night screening", "preview", false)
    override suspend fun createRoom(title: String) = room
    override suspend fun preview(code: String) = RoomPreview(
        code = code,
        title = "Mira's late show",
        ownerName = "Mira",
        ownerPresent = true,
        participantCount = 3,
        availability = RoomAvailability.OPEN,
        streamState = StreamState.EMPTY,
    )
    override suspend fun join(code: String) = room
    override suspend fun snapshot(roomId: String) = RoomSnapshot(
        room = room,
        members = previewMembers,
        stream = StreamInfo("preview", 0, StreamState.EMPTY, ""),
    )
    override suspend fun leave(roomId: String) = false
    override suspend fun startSource(roomId: String, url: String, fileName: String, replaceRevision: Long?): top.roomio.domain.party.StreamInfo =
        if(fileName.isEmpty()) startStream(roomId,url) else top.roomio.domain.party.StreamInfo("local-session", (replaceRevision ?: 0)+1, top.roomio.domain.party.StreamState.ACTIVE, "", top.roomio.domain.party.MediaSourceKind.LOCAL_FILE, fileName)
    override suspend fun startStream(roomId: String, url: String) = StreamInfo("preview", 1, StreamState.ACTIVE, url)
    override suspend fun abortStream(roomId: String) = StreamInfo("preview", 2, StreamState.ABORTED, "")
    override suspend fun voiceConfiguration(roomId: String, voiceSessionId: String?) = VoiceConfiguration(
        mode = "MESH", roomId = roomId, membershipId = "preview-membership",
        voiceSessionId = "preview-session", namespace = "/watchparty/voice/$roomId",
        ticket = "preview", iceServers = listOf(IceServer(listOf("stun:preview.invalid:3478"))),
        iceExpiresAt = "",
    )
}

private object PreviewRealtimeClient : RealtimeClient {
    override suspend fun connect(roomId: String): RealtimeSession = object : RealtimeSession {
        override val events: Flow<RealtimeEvent> = flowOf(RealtimeEvent.Ignored)
        override suspend fun reportPlayback(streamSessionId: String, positionMs: Long, playing: Boolean) = Unit
        override suspend fun requestSync(streamSessionId: String, positionMs: Long, requestId: String) = Unit
        override suspend fun close() = Unit
    }
}

private object PreviewVoiceClient : VoiceClient {
    override suspend fun connect(configuration: VoiceConfiguration): VoiceSession = object : VoiceSession {
        override val events: Flow<VoiceEvent> = flowOf(VoiceEvent.Connected)
        override fun setMicrophoneEnabled(enabled: Boolean) = Unit
        override suspend fun disconnect() = Unit
    }
}

private object PreviewSessionKeeper : SessionKeeper {
    override fun start(room: RoomSession) = Unit
    override fun stop() = Unit
}

private val previewMembers = listOf(
    Member("m1", "preview", "Mira", "MINT", isOwner = true, present = true),
)

private object PreviewVoiceCoordinator : VoiceCoordinator {
    override val state = MutableStateFlow(CoordinatedVoiceState())
    override val leaveRequests = emptyFlow<String>()
    override fun enter(room: RoomSession) = Unit
    override fun join(roomId: String) = Unit
    override fun microphone(roomId: String, enabled: Boolean) = Unit
    override fun toggleMicrophone(roomId: String) = Unit
    override fun retryFailedConnections(roomId: String) = Unit
    override fun leave(roomId: String) = Unit
}
