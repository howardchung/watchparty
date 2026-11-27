package top.roomio.app

import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import top.roomio.app.manager.ManagerMode
import top.roomio.app.manager.PartyManagerAction
import top.roomio.app.manager.PartyManagerViewModel
import top.roomio.app.preview.RoomPreviewAction
import top.roomio.app.preview.RoomPreviewViewModel
import top.roomio.app.profile.ProfileAvatar
import top.roomio.app.profile.SettingsAction
import top.roomio.app.profile.SettingsViewModel
import top.roomio.app.room.InviteCopyState
import top.roomio.app.room.InviteCopyTarget
import top.roomio.app.room.RoomAction
import top.roomio.app.room.RoomPlaybackState
import top.roomio.app.room.RoomViewModel
import top.roomio.app.room.ownerRoomModel
import top.roomio.app.room.player.VideoPlayerState
import top.roomio.app.room.player.VideoPlayerStatus
import top.roomio.domain.profile.ProfileAvatarId
import top.roomio.domain.profile.ProfileRepository
import top.roomio.domain.profile.UserProfile

@OptIn(ExperimentalCoroutinesApi::class)
class PresentationViewModelTest {
    @BeforeTest
    fun setUp() {
        // RoomViewModel drives its session from viewModelScope; run it on the
        // test thread so initial snapshot application is deterministic.
        Dispatchers.setMain(UnconfinedTestDispatcher())
    }

    @AfterTest
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun avatarSelectionDerivesNameAndSaveCommitsThePair() {
        val repository = TestProfileRepository()
        val viewModel = SettingsViewModel(repository, TestThemePreferencesRepository())
        assertEquals("Ice Queen", viewModel.state.value.displayName)
        viewModel.onAction(SettingsAction.AvatarSelected(ProfileAvatar.BERRY))
        assertEquals("Captain Octopus", viewModel.state.value.displayName)
        assertEquals(ProfileAvatarId.COMET, repository.currentProfile().avatar)
        viewModel.onAction(SettingsAction.SaveClicked)
        assertEquals("Captain Octopus", repository.currentProfile().name)
        assertEquals(ProfileAvatarId.BERRY, repository.currentProfile().avatar)
        viewModel.onAction(SettingsAction.LanguageSelected(top.roomio.domain.profile.AppLanguage.PERSIAN))
        assertEquals("کاپیتان اختاپوس", viewModel.state.value.displayName)
        assertEquals("Captain Octopus", repository.currentProfile().name)
        viewModel.onAction(SettingsAction.SaveClicked)
        assertEquals("کاپیتان اختاپوس", repository.currentProfile().name)
        viewModel.onAction(SettingsAction.LanguageSelected(top.roomio.domain.profile.AppLanguage.ENGLISH))
        assertEquals("Captain Octopus", viewModel.state.value.displayName)
    }

    @Test
    fun partyManagerStateNormalizesCodeAndRepresentsRejectedPreview() {
        val viewModel = PartyManagerViewModel(
            initialMode = ManagerMode.JOIN,
            roomRepository = testRoomRepository,
            profileRepository = TestProfileRepository(),
            sessionRepository = testSessionRepository,
        )

        viewModel.onAction(PartyManagerAction.CodeChanged(" moon-42 "))

        assertEquals(" MOON-42 ", viewModel.state.value.code)
        assertEquals("MOON-42", viewModel.state.value.normalizedCode)
        assertTrue(viewModel.state.value.canPreview)

        viewModel.onAction(PartyManagerAction.PreviewRejected)

        assertTrue(viewModel.state.value.hasCodeError)
    }

    @Test
    fun roomActionsReducePlayerAndDialogState() {
        val viewModel = testRoomViewModel(
            roomId = "room",
            asOwner = true,
            sessionRepository = testSessionRepository,
            roomRepository = testRoomRepository,
            realtimeClient = testRealtimeClient,
            voiceClient = testVoiceClient,
            sessionKeeper = testSessionKeeper,
        )

        viewModel.onAction(RoomAction.VideoUrlPasted("https://example.com/movie.mp4"))
        viewModel.onAction(RoomAction.InviteClicked)
        viewModel.onAction(RoomAction.InviteCopySucceeded(InviteCopyTarget.CODE))
        viewModel.onAction(RoomAction.ToggleMicClicked)

        with(viewModel.state.value) {
            assertEquals("https://example.com/movie.mp4", videoUrl)
            assertTrue(inviteOpen)
            assertEquals(InviteCopyState.CODE, inviteCopyState)
            assertTrue(micMuted)
        }
    }

    @Test
    fun roomPlayerStateChangesReducePlaybackAndTimeline() {
        val viewModel = testRoomViewModel(
            roomId = "room",
            asOwner = true,
            sessionRepository = testSessionRepository,
            roomRepository = testRoomRepository,
            realtimeClient = testRealtimeClient,
            voiceClient = testVoiceClient,
            sessionKeeper = testSessionKeeper,
        )

        viewModel.onAction(
            RoomAction.PlayerStateChanged(
                VideoPlayerState(
                    status = VideoPlayerStatus.PLAYING,
                    positionMs = 60_000L,
                    durationMs = 120_000L,
                    bufferedMs = 90_000L,
                    isLive = false,
                    videoAspectRatio = 16f / 9f,
                ),
            ),
        )

        with(viewModel.state.value) {
            assertEquals(RoomPlaybackState.PLAYING, playback)
            assertEquals(60_000L, positionMs)
            assertEquals(120_000L, durationMs)
            assertEquals(90_000L, bufferedMs)
            assertFalse(isLive)
            assertEquals(16f / 9f, videoAspectRatio)
        }

        viewModel.onAction(RoomAction.PlaybackPositionChanged(150_000L))
        viewModel.onAction(RoomAction.PlaybackSkipped(direction = 1f))

        with(viewModel.state.value) {
            assertEquals(120_000L, positionMs)
        }
    }

    @Test
    fun roomLiveStreamMapsToLiveWithoutDuration() {
        val viewModel = testRoomViewModel(
            roomId = "room",
            asOwner = true,
            sessionRepository = testSessionRepository,
            roomRepository = testRoomRepository,
            realtimeClient = testRealtimeClient,
            voiceClient = testVoiceClient,
            sessionKeeper = testSessionKeeper,
        )

        viewModel.onAction(
            RoomAction.PlayerStateChanged(
                VideoPlayerState(
                    status = VideoPlayerStatus.PLAYING,
                    positionMs = 30_000L,
                    durationMs = 0L,
                    bufferedMs = 30_000L,
                    isLive = true,
                ),
            ),
        )

        viewModel.onAction(RoomAction.PlaybackPositionChanged(9_999L))

        with(viewModel.state.value) {
            assertEquals(RoomPlaybackState.PLAYING, playback)
            assertTrue(isLive)
            assertEquals(9_999L, positionMs)
        }
    }

    @Test
    fun roomFullscreenTogglesAndResetsOnLeaveOrEnd() {
        val viewModel = testRoomViewModel(
            roomId = "room",
            asOwner = true,
            sessionRepository = testSessionRepository,
            roomRepository = testRoomRepository,
            realtimeClient = testRealtimeClient,
            voiceClient = testVoiceClient,
            sessionKeeper = testSessionKeeper,
        )

        assertFalse(viewModel.state.value.fullscreenMode)

        viewModel.onAction(RoomAction.ToggleFullscreenClicked)
        assertTrue(viewModel.state.value.fullscreenMode)

        viewModel.onAction(RoomAction.ToggleFullscreenClicked)
        assertFalse(viewModel.state.value.fullscreenMode)

        viewModel.onAction(RoomAction.ToggleFullscreenClicked)
        viewModel.onAction(RoomAction.LeaveConfirmed)
        assertFalse(viewModel.state.value.fullscreenMode)

        viewModel.onAction(RoomAction.ToggleFullscreenClicked)
        viewModel.onAction(RoomAction.EndStreamConfirmed)
        assertFalse(viewModel.state.value.fullscreenMode)
    }

    @Test
    fun roomPlayerErrorMapsToErrorState() {
        val viewModel = testRoomViewModel(
            roomId = "room",
            asOwner = true,
            sessionRepository = testSessionRepository,
            roomRepository = testRoomRepository,
            realtimeClient = testRealtimeClient,
            voiceClient = testVoiceClient,
            sessionKeeper = testSessionKeeper,
        )

        viewModel.onAction(
            RoomAction.PlayerStateChanged(
                VideoPlayerState(
                    status = VideoPlayerStatus.ERROR,
                    positionMs = 0L,
                    durationMs = 0L,
                    bufferedMs = 0L,
                    error = "ERROR_CODE_IO",
                ),
            ),
        )

        viewModel.onAction(RoomAction.RetryPlaybackClicked)

        with(viewModel.state.value) {
            assertEquals(RoomPlaybackState.OWNER_EMPTY, playback)
        }
    }

    @Test
    fun joiningRoomSyncsGuestIdentityFromSavedProfile() {
        val sessionRepository = RecordingSessionRepository()
        val viewModel = RoomPreviewViewModel(
            partyCode = "MOON-42",
            roomRepository = testRoomRepository,
            profileRepository = TestProfileRepository(UserProfile("Mira", ProfileAvatarId.ECHO)),
            sessionRepository = sessionRepository,
        )

        viewModel.onAction(RoomPreviewAction.JoinClicked)

        assertEquals("Mira" to "ECHO", sessionRepository.ensureCalls.lastOrNull())
    }

    @Test
    fun creatingRoomSyncsGuestIdentityFromSavedProfile() {
        val sessionRepository = RecordingSessionRepository()
        val viewModel = PartyManagerViewModel(
            initialMode = ManagerMode.CREATE,
            roomRepository = testRoomRepository,
            profileRepository = TestProfileRepository(UserProfile("Mira", ProfileAvatarId.BLOOM)),
            sessionRepository = sessionRepository,
        )

        viewModel.onAction(PartyManagerAction.CreateClicked)

        assertEquals("Mira" to "BLOOM", sessionRepository.ensureCalls.lastOrNull())
    }

    @Test
    fun settingsStateRepresentsPreferenceWriteFailure() {
        val profile = UserProfile("Nika", ProfileAvatarId.COMET)
        val failingRepository = object : ProfileRepository {
            override fun observeProfile(): Flow<UserProfile> = flowOf(profile)

            override fun currentProfile(): UserProfile = profile

            override fun saveProfile(profile: UserProfile): Result<Unit> =
                Result.failure(IllegalStateException("Test write failure"))
        }
        val viewModel = SettingsViewModel(failingRepository, TestThemePreferencesRepository())

        viewModel.onAction(SettingsAction.SaveClicked)

        assertTrue(viewModel.state.value.saveFailed)
    }
}
