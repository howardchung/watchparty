package top.roomio.app

import androidx.lifecycle.ViewModelStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.awaitCancellation
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.emptyFlow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import top.roomio.app.room.RoomAction
import top.roomio.app.room.RoomEffect
import top.roomio.app.room.RoomPlaybackState
import top.roomio.app.room.RoomViewModel
import top.roomio.app.room.VoiceConnectionState
import top.roomio.app.room.player.AudioTrack
import top.roomio.app.room.player.SubtitleTrack
import top.roomio.app.room.player.VideoPlayerState
import top.roomio.app.room.player.VideoPlayerStatus
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
import top.roomio.domain.party.SessionAction
import top.roomio.domain.party.SessionKeeper
import top.roomio.domain.party.StreamInfo
import top.roomio.domain.party.StreamState
import top.roomio.domain.party.SyncStatus
import top.roomio.domain.party.VoiceClient
import top.roomio.domain.party.VoiceEvent
import top.roomio.domain.party.VoiceSession
import top.roomio.domain.party.IceServer
import top.roomio.domain.party.VoiceConfiguration

@OptIn(ExperimentalCoroutinesApi::class)
class RoomViewModelPresenceTest {

    private val room = Room("room", "MOON-42", "Friday night screening", "owner-1", false)
    private val owner = Member("m1", "owner-1", "Mira", "MINT", isOwner = true, present = true)
    private val guest = Member("m2", "guest-1", "Ellis", "SUNNY", isOwner = false, present = true)

    @Test
    fun ownerDeviceAlwaysReportsOwnerPresent() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val repository = snapshotRepository(RoomSnapshot(room, emptyList(), emptyStream()))
            val viewModel = testRoomViewModel("room", asOwner = true, testSessionRepository, repository, testRealtimeClient, testVoiceClient, testSessionKeeper)

            assertTrue(viewModel.state.value.model.ownerPresent)
            assertTrue(viewModel.state.value.isOwner)
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun guestSeesOwnerAwayWhenSnapshotReportsAbsent() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val repository = snapshotRepository(RoomSnapshot(room, listOf(owner.copy(present = false), guest), emptyStream()))
            val viewModel = testRoomViewModel("room", asOwner = false, testSessionRepository, repository, testRealtimeClient, testVoiceClient, testSessionKeeper)

            assertFalse(viewModel.state.value.model.ownerPresent)
            assertFalse(viewModel.state.value.isOwner)
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun reconnectSnapshotForSameStreamPreservesViewerLocalPlayerState() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val stream = StreamInfo("same-session", 4, StreamState.ACTIVE, "https://example/video.mp4")
            val snapshot = RoomSnapshot(room, listOf(owner, guest), stream)
            val events = MutableSharedFlow<RealtimeEvent>()
            val viewModel = testRoomViewModel(
                "room", asOwner = false, testSessionRepository, snapshotRepository(snapshot),
                emittingRealtimeClient(events), testVoiceClient, testSessionKeeper,
            )
            viewModel.onAction(RoomAction.PlayerStateChanged(
                VideoPlayerState(
                    status = VideoPlayerStatus.PAUSED,
                    positionMs = 42_000,
                    subtitles = listOf(SubtitleTrack("sub-1", "English", selected = true)),
                    audioTracks = listOf(AudioTrack("audio-1", "Director commentary")),
                    audioTrackSelectionId = "audio-1",
                ),
            ))
            viewModel.onAction(RoomAction.VolumeChanged(0.35f))

            events.emit(RealtimeEvent.Snapshot(snapshot))
            testScheduler.runCurrent()

            assertEquals(RoomPlaybackState.PAUSED, viewModel.state.value.playback)
            assertEquals("https://example/video.mp4", viewModel.state.value.videoUrl)
            assertEquals(42_000, viewModel.state.value.positionMs)
            assertEquals(0.35f, viewModel.state.value.volume)
            assertEquals("sub-1", viewModel.state.value.subtitleTracks.single().id)
            assertEquals("audio-1", viewModel.state.value.audioTrackSelectionId)
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun absentOwnerRemainsInRoomMarkedAway() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val events = MutableSharedFlow<RealtimeEvent>()
            val repository = snapshotRepository(RoomSnapshot(room, listOf(owner, guest), emptyStream()))
            val viewModel = testRoomViewModel("room", asOwner = false, testSessionRepository, repository, emittingRealtimeClient(events), testVoiceClient, testSessionKeeper)

            assertTrue(viewModel.state.value.model.ownerPresent)

            events.emit(RealtimeEvent.MemberAbsent(owner.copy(present = false)))
            testScheduler.runCurrent()

            assertFalse(viewModel.state.value.model.ownerPresent)
            val host = viewModel.state.value.model.participants.first { it.isHost }
            assertFalse(host.isPresent)

            events.emit(RealtimeEvent.MemberReturned(owner))
            testScheduler.runCurrent()

            assertTrue(viewModel.state.value.model.ownerPresent)
            assertTrue(viewModel.state.value.model.participants.first { it.isHost }.isPresent)
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun leavingOwnerIsRemovedAndShownAway() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val events = MutableSharedFlow<RealtimeEvent>()
            val repository = snapshotRepository(RoomSnapshot(room, listOf(owner, guest), emptyStream()))
            val viewModel = testRoomViewModel("room", asOwner = false, testSessionRepository, repository, emittingRealtimeClient(events), testVoiceClient, testSessionKeeper)

            assertTrue(viewModel.state.value.model.participants.any { it.isHost })

            // The owner closed the app: the backend releases the membership.
            events.emit(RealtimeEvent.MemberLeft(owner.membershipId))
            testScheduler.runCurrent()

            assertFalse(viewModel.state.value.model.ownerPresent)
            assertFalse(viewModel.state.value.model.participants.any { it.isHost })
            assertTrue(viewModel.state.value.model.participants.any { it.name == guest.displayName })
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun closingTheRoomViewReportsLeaveToKeeper() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val keeper = RecordingSessionKeeper()
            val repository = snapshotRepository(RoomSnapshot(room, listOf(owner, guest), emptyStream()))
            val viewModel = testRoomViewModel("room", asOwner = false, testSessionRepository, repository, testRealtimeClient, testVoiceClient, keeper)
            val store = ViewModelStore()
            store.put("room", viewModel)

            // Destroying the screen (closing the app) must release the membership.
            store.clear()
            testScheduler.runCurrent()

            assertEquals(1, keeper.stops)
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun voiceReconnectsAfterSessionDrop() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val voice = RecordingVoiceClient()
            val repository = snapshotRepository(RoomSnapshot(room, listOf(owner, guest), emptyStream()))
            val viewModel = testRoomViewModel("room", asOwner = true, testSessionRepository, repository, testRealtimeClient, voice, testSessionKeeper)

            viewModel.onAction(RoomAction.JoinVoiceClicked)
            testScheduler.runCurrent()

            assertEquals(1, voice.connects)
            // Voice is opt-in and starts muted.
            assertEquals(listOf(false), voice.micStates)

            // The first session drops; the loop must fetch a fresh token and reconnect.
            testScheduler.advanceTimeBy(2_000L)
            testScheduler.runCurrent()

            assertEquals(2, voice.connects)
            assertEquals(listOf(false, false), voice.micStates)
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun sessionKeeperTracksRoomAndVoice() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val keeper = RecordingSessionKeeper()
            val voice = RecordingVoiceClient()
            val repository = snapshotRepository(RoomSnapshot(room, listOf(owner, guest), emptyStream()))
            val viewModel = testRoomViewModel("room", asOwner = true, testSessionRepository, repository, testRealtimeClient, voice, keeper)
            testScheduler.runCurrent()

            // Entering the room starts the background session without voice.
            assertEquals(listOf(false), keeper.started.map { it.voiceActive })
            assertEquals("room", keeper.started.first().roomId)
            assertTrue(keeper.started.first().asOwner)

            viewModel.onAction(RoomAction.JoinVoiceClicked)
            testScheduler.runCurrent()

            // Joining voice upgrades the session so the microphone stays alive.
            assertEquals(listOf(false, true), keeper.started.map { it.voiceActive }.take(2))
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun notificationUnmuteEnablesMicrophone() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val keeper = RecordingSessionKeeper()
            val voice = RecordingVoiceClient()
            val repository = snapshotRepository(RoomSnapshot(room, listOf(owner, guest), emptyStream()))
            val viewModel = testRoomViewModel("room", asOwner = true, testSessionRepository, repository, testRealtimeClient, voice, keeper)

            viewModel.onAction(RoomAction.JoinVoiceClicked)
            testScheduler.runCurrent()
            // The first session drops instantly; advance to the reconnected one.
            testScheduler.advanceTimeBy(2_000L)
            testScheduler.runCurrent()
            assertTrue(viewModel.state.value.micMuted)

            viewModel.onAction(RoomAction.ToggleMicClicked)
            testScheduler.runCurrent()
            assertFalse(viewModel.state.value.micMuted)
            assertEquals(true, voice.micStates.last())

            keeper.emit(SessionAction.MuteVoice)
            testScheduler.runCurrent()

            assertTrue(viewModel.state.value.micMuted)
            assertEquals(false, voice.micStates.last())
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun notificationLeaveEndsVoiceAndRoom() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val keeper = RecordingSessionKeeper()
            val voice = RecordingVoiceClient()
            val repository = snapshotRepository(RoomSnapshot(room, listOf(owner, guest), emptyStream()))
            val viewModel = testRoomViewModel("room", asOwner = true, testSessionRepository, repository, testRealtimeClient, voice, keeper)
            val effects = mutableListOf<RoomEffect>()
            backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) {
                viewModel.effects.collect { effects += it }
            }

            viewModel.onAction(RoomAction.JoinVoiceClicked)
            testScheduler.runCurrent()
            testScheduler.advanceTimeBy(2_000L)
            testScheduler.runCurrent()

            keeper.emit(SessionAction.Leave)
            testScheduler.runCurrent()

            assertEquals(VoiceConnectionState.IDLE, viewModel.state.value.voiceState)
            assertEquals(1, keeper.stops)
            assertTrue(effects.contains(RoomEffect.Left))
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun syncResultWithUnknownCorrelationIsIgnored() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val client = RecordingRealtimeClient()
            val repository = snapshotRepository(
                RoomSnapshot(room, listOf(owner, guest), StreamInfo("s", 1, StreamState.ACTIVE, "https://example/video")),
            )
            val viewModel = testRoomViewModel("room", asOwner = false, testSessionRepository, repository, client, testVoiceClient, testSessionKeeper)
            val effects = mutableListOf<RoomEffect>()
            backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) {
                viewModel.effects.collect { effects += it }
            }

            viewModel.onAction(RoomAction.SyncClicked)
            testScheduler.runCurrent()
            assertEquals(1, client.syncRequests.size)
            val requestId = client.syncRequests.single().second
            assertTrue(requestId.isNotEmpty(), "sync request must carry a correlation id")

            // A late reply for a different request must not move the player.
            client.emit(RealtimeEvent.SyncResult(SyncStatus.APPLIED, 9_999, "someone-else"))
            testScheduler.runCurrent()
            assertFalse(effects.any { it is RoomEffect.SeekTo }, "stale sync result must not seek")
            assertEquals(0L, viewModel.state.value.positionMs)

            client.emit(RealtimeEvent.SyncResult(SyncStatus.APPLIED, 4_321, requestId))
            testScheduler.runCurrent()
            assertTrue(effects.contains(RoomEffect.SeekTo(4_321)))
            assertTrue(effects.contains(RoomEffect.SyncCompleted))
            assertEquals(4_321L, viewModel.state.value.positionMs)
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun syncWithoutActiveStreamReportsUnavailable() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val repository = snapshotRepository(RoomSnapshot(room, listOf(owner, guest), emptyStream()))
            val viewModel = testRoomViewModel("room", asOwner = false, testSessionRepository, repository, testRealtimeClient, testVoiceClient, testSessionKeeper)
            val effects = mutableListOf<RoomEffect>()
            backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) {
                viewModel.effects.collect { effects += it }
            }

            viewModel.onAction(RoomAction.SyncClicked)
            testScheduler.runCurrent()

            assertTrue(effects.contains(RoomEffect.SyncUnavailable))
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun staleStreamEventsAreIgnoredByRevision() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val events = MutableSharedFlow<RealtimeEvent>()
            val repository = snapshotRepository(
                RoomSnapshot(room, listOf(owner, guest), StreamInfo("s1", 1, StreamState.ACTIVE, "https://example/video")),
            )
            val viewModel = testRoomViewModel("room", asOwner = false, testSessionRepository, repository, emittingRealtimeClient(events), testVoiceClient, testSessionKeeper)

            events.emit(RealtimeEvent.StreamAborted("s1", 2))
            testScheduler.runCurrent()
            assertEquals(RoomPlaybackState.ABORTED, viewModel.state.value.playback)

            // A redelivered older started event must not resurrect playback.
            events.emit(RealtimeEvent.StreamStarted("s1", 1, "https://example/video"))
            testScheduler.runCurrent()
            assertEquals(RoomPlaybackState.ABORTED, viewModel.state.value.playback)

            // A newer start still applies.
            events.emit(RealtimeEvent.StreamStarted("s2", 3, "https://example/video"))
            testScheduler.runCurrent()
            assertEquals(RoomPlaybackState.PLAYING, viewModel.state.value.playback)
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun voiceDisconnectClearsStaleSpeakingIndicator() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val voice = EmittingVoiceClient()
            val repository = snapshotRepository(RoomSnapshot(room, listOf(owner, guest), emptyStream()))
            val viewModel = testRoomViewModel("room", asOwner = true, testSessionRepository, repository, testRealtimeClient, voice, testSessionKeeper)

            viewModel.onAction(RoomAction.JoinVoiceClicked)
            testScheduler.runCurrent()

            voice.emit(VoiceEvent.SpeakersChanged(setOf(owner.membershipId)))
            testScheduler.runCurrent()
            assertTrue(viewModel.state.value.model.participants.first { it.isHost }.isSpeaking)

            voice.emit(VoiceEvent.Disconnected)
            testScheduler.runCurrent()
            assertFalse(
                viewModel.state.value.model.participants.first { it.isHost }.isSpeaking,
                "a dropped voice session must not leave the speaking indicator stuck",
            )
        } finally {
            Dispatchers.resetMain()
        }
    }

    @Test
    fun voiceFailureClearsStaleSpeakingIndicator() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val voice = EmittingVoiceClient()
            val repository = snapshotRepository(RoomSnapshot(room, listOf(owner, guest), emptyStream()))
            val viewModel = testRoomViewModel("room", asOwner = true, testSessionRepository, repository, testRealtimeClient, voice, testSessionKeeper)

            viewModel.onAction(RoomAction.JoinVoiceClicked)
            testScheduler.runCurrent()

            voice.emit(VoiceEvent.SpeakersChanged(setOf(owner.membershipId)))
            testScheduler.runCurrent()
            assertTrue(viewModel.state.value.model.participants.first { it.isHost }.isSpeaking)

            voice.emit(VoiceEvent.Failed("boom"))
            testScheduler.runCurrent()
            assertFalse(viewModel.state.value.model.participants.first { it.isHost }.isSpeaking)
        } finally {
            Dispatchers.resetMain()
        }
    }

    private fun emptyStream() = StreamInfo("", 0, StreamState.EMPTY, "")

    private fun snapshotRepository(snapshot: RoomSnapshot): RoomRepository = object : RoomRepository {
        override suspend fun createRoom(title: String) = room
        override suspend fun preview(code: String) = RoomPreview(code, "Title", "Mira", true, 1, RoomAvailability.OPEN, StreamState.EMPTY)
        override suspend fun join(code: String) = room
        override suspend fun snapshot(roomId: String) = snapshot
        override suspend fun leave(roomId: String) = false
        override suspend fun startSource(roomId: String, url: String, fileName: String, replaceRevision: Long?): top.roomio.domain.party.StreamInfo =
            if(fileName.isEmpty()) startStream(roomId,url) else top.roomio.domain.party.StreamInfo("local-session", (replaceRevision ?: 0)+1, top.roomio.domain.party.StreamState.ACTIVE, "", top.roomio.domain.party.MediaSourceKind.LOCAL_FILE, fileName)
        override suspend fun startStream(roomId: String, url: String) = StreamInfo("s", 1, StreamState.ACTIVE, url)
        override suspend fun abortStream(roomId: String) = StreamInfo("s", 2, StreamState.ABORTED, "")
        override suspend fun voiceConfiguration(roomId: String, voiceSessionId: String?) = VoiceConfiguration(
            "MESH", roomId, "membership", "session", "/watchparty/voice/$roomId", "ticket",
            listOf(IceServer(listOf("stun:x.invalid:3478"))), "",
        )
    }

    private fun emittingRealtimeClient(events: MutableSharedFlow<RealtimeEvent>): RealtimeClient = object : RealtimeClient {
        override suspend fun connect(roomId: String): RealtimeSession = object : RealtimeSession {
            override val events: Flow<RealtimeEvent> = events
            override suspend fun reportPlayback(streamSessionId: String, positionMs: Long, playing: Boolean) = Unit
            override suspend fun requestSync(streamSessionId: String, positionMs: Long, requestId: String) = Unit
            override suspend fun close() = Unit
        }
    }

    /** A voice client whose events are driven directly by the test. */
    private class EmittingVoiceClient : VoiceClient {
        private val mutableEvents = MutableSharedFlow<VoiceEvent>(extraBufferCapacity = 8)

        override suspend fun connect(configuration: VoiceConfiguration): VoiceSession = object : VoiceSession {
            override val events: Flow<VoiceEvent> = mutableEvents
            override fun setMicrophoneEnabled(enabled: Boolean) = Unit
            override suspend fun disconnect() = Unit
        }

        suspend fun emit(event: VoiceEvent) = mutableEvents.emit(event)
    }

    /** Emits events on demand and records sync requests so correlation can be asserted. */
    private class RecordingRealtimeClient : RealtimeClient {
        private val mutableEvents = MutableSharedFlow<RealtimeEvent>(extraBufferCapacity = 16)
        val syncRequests = mutableListOf<Pair<Long, String>>()

        override suspend fun connect(roomId: String): RealtimeSession = object : RealtimeSession {
            override val events: Flow<RealtimeEvent> = mutableEvents
            override suspend fun reportPlayback(streamSessionId: String, positionMs: Long, playing: Boolean) = Unit
            override suspend fun requestSync(streamSessionId: String, positionMs: Long, requestId: String) {
                syncRequests += positionMs to requestId
            }
            override suspend fun close() = Unit
        }

        suspend fun emit(event: RealtimeEvent) = mutableEvents.emit(event)
    }

    private class RecordingSessionKeeper : SessionKeeper {
        val started = mutableListOf<RoomSession>()
        var stops = 0
        var stopAndLeaves = 0
        private val mutableActions = MutableSharedFlow<SessionAction>(extraBufferCapacity = 8)
        override val actions: Flow<SessionAction> = mutableActions

        override fun start(room: RoomSession) {
            started += room
        }

        override fun stop() {
            stops++
        }

        override fun stopAndLeave() {
            stopAndLeaves++
        }

        suspend fun emit(action: SessionAction) {
            mutableActions.emit(action)
        }
    }

    private class RecordingVoiceClient : VoiceClient {
        private val events = MutableSharedFlow<VoiceEvent>(extraBufferCapacity = 8)
        var connects = 0
        val micStates = mutableListOf<Boolean>()

        override suspend fun connect(configuration: VoiceConfiguration): VoiceSession {
            connects++
            val index = connects
            return object : VoiceSession {
                // The first session ends immediately (a dropped call); later
                // sessions stay open so the reconnect loop does not spin.
                override val events: Flow<VoiceEvent> =
                    if (index == 1) emptyFlow() else this@RecordingVoiceClient.events

                override fun setMicrophoneEnabled(enabled: Boolean) {
                    micStates += enabled
                    this@RecordingVoiceClient.events.tryEmit(VoiceEvent.MicrophoneChanged(enabled))
                }

                override suspend fun disconnect() = Unit
            }
        }
    }
}
