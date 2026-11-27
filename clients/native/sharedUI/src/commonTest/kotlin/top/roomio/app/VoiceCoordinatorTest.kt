package top.roomio.app

import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.test.*
import kotlin.test.*
import top.roomio.domain.party.*

@OptIn(ExperimentalCoroutinesApi::class)
class VoiceCoordinatorTest {
    private val room = RoomSession("room", true, false, true)

    @Test
    fun serviceConfirmationPrecedesCaptureAndFailureOffersRetry() = runTest {
        val order = mutableListOf<String>()
        val failures = mutableListOf<Pair<String, Throwable>>()
        var fail = true
        val keeper = object : SessionKeeper {
            override fun start(room: RoomSession) = Unit
            override fun stop() = Unit
            override suspend fun ensureMicrophone(room: RoomSession) {
                order += "service"
                if (fail) throw PartyException("VOICE_SERVICE_UNAVAILABLE", "blocked")
            }
        }
        val session = RecordingSession()
        val client = object : VoiceClient {
            override suspend fun connect(configuration: VoiceConfiguration): VoiceSession {
                order += "capture"
                return session
            }
        }
        val coordinator = DefaultVoiceCoordinator(testRoomRepository, client, keeper, backgroundScope) { operation, error -> failures.add(operation to error) }
        coordinator.enter(room)
        coordinator.join("room")
        runCurrent()
        assertEquals(listOf("service"), order)
        assertEquals(VoiceSessionState.FAILED, coordinator.state.value.state)
        assertEquals("VOICE_SERVICE_UNAVAILABLE", coordinator.state.value.failureCode)
        assertEquals("VoiceCoordinator.startConnection", failures.single().first)
        assertEquals("blocked", failures.single().second.message)
        fail = false
        coordinator.join("room")
        runCurrent()
        assertEquals(listOf("service", "service", "capture"), order)
        assertEquals(listOf(false), session.microphone)
        assertFalse(coordinator.state.value.microphoneEnabled)
    }

    @Test
    fun leaveCancelsPendingJoinAndNeverReopensCapture() = runTest {
        var cancelled = false
        var connects = 0
        val client = object : VoiceClient {
            override suspend fun connect(configuration: VoiceConfiguration): VoiceSession {
                connects++
                try { awaitCancellation() } finally { cancelled = true }
            }
        }
        val keeper = RecordingKeeper()
        val coordinator = DefaultVoiceCoordinator(testRoomRepository, client, keeper, backgroundScope, { _, _ -> })
        coordinator.enter(room)
        coordinator.join("room")
        runCurrent()
        coordinator.leave("room")
        runCurrent()
        advanceTimeBy(60_000)
        runCurrent()
        assertTrue(cancelled)
        assertEquals(1, connects)
        assertEquals(1, keeper.leaves)
        assertEquals(VoiceSessionState.OFF, coordinator.state.value.state)
    }

    @Test
    fun muteWaitsForAuthorizationAndDelayedUnmuteCannotOverrideMute() = runTest {
        val session = RecordingSession()
        val coordinator = coordinator(session)
        coordinator.enter(room)
        coordinator.join("room")
        runCurrent()
        coordinator.toggleMicrophone("room")
        coordinator.toggleMicrophone("room")
        coordinator.toggleMicrophone("room")
        runCurrent()
        assertEquals(listOf(false, true, false, true), session.microphone)
        assertFalse(coordinator.state.value.microphoneEnabled)
        session.events.emit(VoiceEvent.MicrophoneChanged(true))
        runCurrent()
        assertTrue(coordinator.state.value.microphoneEnabled)
        coordinator.microphone("room", false)
        runCurrent()
        session.events.emit(VoiceEvent.MicrophoneChanged(true))
        runCurrent()
        assertFalse(coordinator.state.value.microphoneEnabled)
        assertEquals(false, session.microphone.last())
    }

    @Test
    fun notificationCommandsAndFailedPeerRetryWorkWithoutViewModel() = runTest {
        val keeper = RecordingKeeper()
        val session = RecordingSession()
        val coordinator = coordinator(session, keeper)
        coordinator.enter(room)
        coordinator.join("room")
        runCurrent()
        val peers = mapOf("healthy" to VoicePeerStatus.CONNECTED, "failed" to VoicePeerStatus.UNAVAILABLE)
        session.events.emit(VoiceEvent.StatusChanged(VoiceSessionState.DEGRADED, peers))
        runCurrent()
        assertEquals(peers, coordinator.state.value.peers)
        coordinator.retryFailedConnections("room")
        runCurrent()
        assertEquals(1, session.retries)
        assertEquals(0, session.disconnects)
        keeper.commands.emit(SessionAction.UnmuteVoice)
        runCurrent()
        assertTrue(session.microphone.last())
        keeper.commands.emit(SessionAction.Leave)
        runCurrent()
        assertEquals(1, session.disconnects)
        assertEquals(1, keeper.leaves)
        assertEquals(VoiceSessionState.OFF, coordinator.state.value.state)
    }

    @Test
    fun lostMicrophoneServiceStopsCaptureAndRequiresNewServiceConfirmation() = runTest {
        val keeper = RecordingKeeper()
        val session = RecordingSession()
        val coordinator = coordinator(session, keeper)
        coordinator.enter(room)
        coordinator.join("room")
        runCurrent()
        assertEquals(1, keeper.confirmations)
        coordinator.microphone("room", true)
        runCurrent()
        session.events.emit(VoiceEvent.MicrophoneChanged(true))
        runCurrent()
        assertTrue(coordinator.state.value.microphoneEnabled)
        keeper.commands.emit(SessionAction.MicrophoneServiceLost)
        runCurrent()
        assertFalse(coordinator.state.value.microphoneEnabled)
        assertEquals(VoiceSessionState.FAILED, coordinator.state.value.state)
        assertEquals(1, session.disconnects)
        val requestsAfterLoss = session.microphone.size
        coordinator.microphone("room", true)
        runCurrent()
        assertEquals(requestsAfterLoss, session.microphone.size)
        coordinator.join("room")
        runCurrent()
        assertEquals(2, keeper.confirmations)
        assertFalse(coordinator.state.value.microphoneEnabled)
        assertEquals(false, session.microphone.last())
    }

    private fun TestScope.coordinator(session: RecordingSession, keeper: SessionKeeper = RecordingKeeper()) =
        DefaultVoiceCoordinator(testRoomRepository, object : VoiceClient {
            override suspend fun connect(configuration: VoiceConfiguration) = session
        }, keeper, backgroundScope, { _, _ -> })

    private class RecordingKeeper : SessionKeeper {
        val commands = MutableSharedFlow<SessionAction>(extraBufferCapacity = 8)
        override val actions = commands.asSharedFlow()
        var leaves = 0
        var confirmations = 0
        override suspend fun ensureMicrophone(room: RoomSession) { confirmations++ }
        override fun start(room: RoomSession) = Unit
        override fun stop() { leaves++ }
    }

    private class RecordingSession : VoiceSession {
        override val events = MutableSharedFlow<VoiceEvent>(extraBufferCapacity = 8)
        val microphone = mutableListOf<Boolean>()
        var retries = 0
        var disconnects = 0
        override fun setMicrophoneEnabled(enabled: Boolean) { microphone += enabled }
        override fun retryFailedConnections() { retries++ }
        override suspend fun disconnect() { disconnects++ }
    }
}
