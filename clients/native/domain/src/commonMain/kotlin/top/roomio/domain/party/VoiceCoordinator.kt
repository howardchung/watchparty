package top.roomio.domain.party

import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*

data class CoordinatedVoiceState(
    val roomId: String? = null,
    val state: VoiceSessionState = VoiceSessionState.OFF,
    val peers: Map<String, VoicePeerStatus> = emptyMap(),
    val microphoneEnabled: Boolean = false,
    val speakers: Set<String> = emptySet(),
    val failureCode: String? = null,
)

/** Application-owned voice commands; presentation only observes this state. */
interface VoiceCoordinator {
    val state: StateFlow<CoordinatedVoiceState>
    val leaveRequests: Flow<String>
    fun enter(room: RoomSession)
    fun join(roomId: String)
    fun microphone(roomId: String, enabled: Boolean)
    fun toggleMicrophone(roomId: String)
    fun retryFailedConnections(roomId: String)
    fun leave(roomId: String)
}

/**
 * A single mailbox owns session lifetime, including notification commands.
 * The application supplies its lifetime scope; tests supply a virtual-time scope.
 */
class DefaultVoiceCoordinator(
    private val rooms: RoomRepository,
    private val client: VoiceClient,
    private val keeper: SessionKeeper,
    private val scope: CoroutineScope,
    private val reportException: (String, Throwable) -> Unit,
) : VoiceCoordinator {
    private val mutableState = MutableStateFlow(CoordinatedVoiceState())
    override val state = mutableState.asStateFlow()
    private val leaves = MutableSharedFlow<String>(extraBufferCapacity = 4)
    override val leaveRequests = leaves.asSharedFlow()
    private val commands = Channel<Command>(Channel.UNLIMITED)
    private var room: RoomSession? = null
    private var session: VoiceSession? = null
    private var connection: Job? = null
    private var generation = 0L
    private var wanted = false
    private var microphoneIntent = false

    init {
        scope.launch { for (command in commands) handle(command) }
        scope.launch { keeper.actions.collect { action -> commands.send(Command.Notification(action)) } }
    }

    override fun enter(room: RoomSession) { commands.trySend(Command.Enter(room)) }
    override fun join(roomId: String) { commands.trySend(Command.Join(roomId)) }
    override fun microphone(roomId: String, enabled: Boolean) {
        // Capture stops synchronously, even while an unmute acknowledgement is pending.
        if (!enabled && state.value.roomId == roomId) session?.setMicrophoneEnabled(false)
        commands.trySend(Command.Microphone(roomId, enabled))
    }
    override fun toggleMicrophone(roomId: String) {
        if (state.value.roomId == roomId && state.value.microphoneEnabled) session?.setMicrophoneEnabled(false)
        commands.trySend(Command.Toggle(roomId))
    }
    override fun retryFailedConnections(roomId: String) { commands.trySend(Command.Retry(roomId)) }
    override fun leave(roomId: String) { commands.trySend(Command.Leave(roomId)) }

    private suspend fun handle(command: Command) {
        when (command) {
            is Command.Enter -> {
                if (room?.roomId == command.room.roomId) return
                stopVoice()
                room = command.room.copy(voiceActive = false, micMuted = true)
                mutableState.value = CoordinatedVoiceState(roomId = command.room.roomId)
                keeper.start(room!!)
            }
            is Command.Join -> if (room?.roomId == command.roomId && !wanted) {
                wanted = true
                microphoneIntent = false
                startConnection()
            }
            is Command.Microphone -> if (room?.roomId == command.roomId) applyMicrophone(command.enabled)
            is Command.Toggle -> if (room?.roomId == command.roomId) applyMicrophone(!microphoneIntent)
            is Command.Retry -> if (room?.roomId == command.roomId) session?.retryFailedConnections()
            is Command.Leave -> if (room?.roomId == command.roomId) leaveRoom()
            is Command.Opened -> {
                if (command.generation != generation || !wanted) {
                    release(command.session)
                    return
                }
                session = command.session
                command.session.setMicrophoneEnabled(false)
                mutableState.update { it.copy(state = VoiceSessionState.CONNECTED, failureCode = null) }
                updateNotification()
            }
            is Command.Event -> if (command.generation == generation && wanted) {
                when (val event = command.event) {
                    is VoiceEvent.StatusChanged -> mutableState.update { it.copy(state = event.state, peers = event.peers) }
                    is VoiceEvent.MicrophoneChanged -> {
                        mutableState.update { it.copy(microphoneEnabled = event.enabled && microphoneIntent) }
                        updateNotification()
                    }
                    is VoiceEvent.SpeakersChanged -> mutableState.update { it.copy(speakers = event.speakingMembershipIds) }
                    is VoiceEvent.AudioDeviceFailure -> {
                        if (event.capture) applyMicrophone(false)
                        mutableState.update { it.copy(state = VoiceSessionState.DEGRADED, failureCode = "VOICE_AUDIO_DEVICE_FAILED") }
                    }
                    VoiceEvent.Connected -> mutableState.update { it.copy(state = VoiceSessionState.CONNECTED) }
                    VoiceEvent.Disconnected -> mutableState.update { it.copy(state = VoiceSessionState.RECONNECTING, speakers = emptySet()) }
                    is VoiceEvent.Failed -> mutableState.update { it.copy(state = VoiceSessionState.DEGRADED, failureCode = event.reason, speakers = emptySet()) }
                }
            }
            is Command.Ended -> if (command.generation == generation && wanted) {
                val hadSession = session != null
                release(session)
                session = null
                microphoneIntent = false
                mutableState.update { it.copy(microphoneEnabled = false, speakers = emptySet(), peers = emptyMap(), state = if (hadSession) VoiceSessionState.RECONNECTING else VoiceSessionState.FAILED, failureCode = command.code) }
                updateNotification()
                if (hadSession) {
                    connection = scope.launch { delay(2_000); commands.send(Command.Reconnect(generation)) }
                } else {
                    wanted = false
                    updateNotification()
                }
            }
            is Command.Reconnect -> if (command.generation == generation && wanted) startConnection()
            is Command.Notification -> when (command.action) {
                SessionAction.MuteVoice -> applyMicrophone(false)
                SessionAction.UnmuteVoice -> applyMicrophone(true)
                SessionAction.Leave -> leaveRoom()
                SessionAction.MicrophoneServiceLost -> {
                    stopVoice()
                    mutableState.update { it.copy(state = VoiceSessionState.FAILED, microphoneEnabled = false,
                        speakers = emptySet(), peers = emptyMap(), failureCode = "VOICE_SERVICE_UNAVAILABLE") }
                }
            }
        }
    }

    private fun startConnection() {
        val activeRoom = room ?: return
        val currentGeneration = ++generation
        mutableState.update { it.copy(state = VoiceSessionState.JOINING, microphoneEnabled = false, failureCode = null) }
        connection = scope.launch {
            var openedSession: VoiceSession? = null
            var published = false
            try {
                val opened = withTimeout(30_000) {
                    // Android's bound service confirms microphone FGS before WebRTC capture.
                    keeper.ensureMicrophone(activeRoom.copy(voiceActive = true, micMuted = true))
                    client.connect(rooms.voiceConfiguration(activeRoom.roomId))
                }
                openedSession = opened
                commands.send(Command.Opened(currentGeneration, opened))
                published = true
                opened.events.collect { commands.send(Command.Event(currentGeneration, it)) }
                commands.send(Command.Ended(currentGeneration, "VOICE_CONNECTION_CLOSED"))
            } catch (error: Throwable) {
                reportException("VoiceCoordinator.startConnection", error)
                currentCoroutineContext().ensureActive()
                commands.send(Command.Ended(currentGeneration, (error as? PartyException)?.code ?: "VOICE_CONNECTION_FAILED"))
            } finally {
                if (!published) release(openedSession)
            }
        }
    }

    private fun applyMicrophone(enabled: Boolean) {
        val active = session ?: return
        microphoneIntent = enabled
        if (!enabled) mutableState.update { it.copy(microphoneEnabled = false) }
        active.setMicrophoneEnabled(enabled)
        if (!enabled) updateNotification()
    }

    private fun updateNotification() {
        room?.let { keeper.start(it.copy(voiceActive = session != null || wanted, micMuted = !state.value.microphoneEnabled)) }
    }

    private suspend fun stopVoice() {
        wanted = false
        generation++
        connection?.cancel()
        connection = null
        microphoneIntent = false
        session?.setMicrophoneEnabled(false)
        release(session)
        session = null
    }

    private suspend fun leaveRoom() {
        val oldRoom = room ?: return
        stopVoice()
        room = null
        mutableState.value = CoordinatedVoiceState()
        leaves.tryEmit(oldRoom.roomId)
        // The application owner releases membership on every platform before
        // relinquishing foreground protection; cancellation cannot skip cleanup.
        withContext(NonCancellable) {
            withTimeoutOrNull(5_000) { runCatching { rooms.leave(oldRoom.roomId) }.onFailure { reportException("VoiceCoordinator.leaveRoom", it) } }
            keeper.stop()
        }
    }

    private suspend fun release(old: VoiceSession?) {
        if (old != null) withContext(NonCancellable) { withTimeoutOrNull(3_000) { runCatching { old.disconnect() }.onFailure { reportException("VoiceCoordinator.release", it) } } }
    }

    private sealed interface Command {
        data class Enter(val room: RoomSession) : Command
        data class Join(val roomId: String) : Command
        data class Microphone(val roomId: String, val enabled: Boolean) : Command
        data class Toggle(val roomId: String) : Command
        data class Retry(val roomId: String) : Command
        data class Leave(val roomId: String) : Command
        data class Opened(val generation: Long, val session: VoiceSession) : Command
        data class Event(val generation: Long, val event: VoiceEvent) : Command
        data class Ended(val generation: Long, val code: String) : Command
        data class Reconnect(val generation: Long) : Command
        data class Notification(val action: SessionAction) : Command
    }
}
