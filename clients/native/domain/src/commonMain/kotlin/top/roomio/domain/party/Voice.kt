package top.roomio.domain.party

import kotlinx.coroutines.flow.Flow

/**
 * Opens room-scoped voice sessions using tokens issued by the backend. Voice
 * is opt-in, starts muted, and is independent of room and playback state.
 */
interface VoiceClient {
    /** Connects to the voice room with an authenticated mesh descriptor. */
    suspend fun connect(configuration: VoiceConfiguration): VoiceSession
}

/** A live voice connection. Disconnect it when leaving the room. */
interface VoiceSession {
    /** Voice events such as active-speaker changes and connection state. */
    val events: Flow<VoiceEvent>

    /** Enables or disables the local microphone. */
    fun setMicrophoneEnabled(enabled: Boolean)

    /** Retries only unavailable links while preserving healthy audio. */
    fun retryFailedConnections() = Unit

    /** Leaves the voice room. */
    suspend fun disconnect()
}

enum class VoiceSessionState { JOINING, CONNECTED, DEGRADED, RECONNECTING, FAILED, OFF }
enum class VoicePeerStatus { CONNECTING, CONNECTED, RECONNECTING, UNAVAILABLE }

sealed interface VoiceEvent {
    data class StatusChanged(val state: VoiceSessionState, val peers: Map<String, VoicePeerStatus>) : VoiceEvent
    data class AudioDeviceFailure(val capture: Boolean) : VoiceEvent
    data class MicrophoneChanged(val enabled: Boolean) : VoiceEvent

    /** The room connection is established. */
    data object Connected : VoiceEvent

    /** The room connection was closed. */
    data object Disconnected : VoiceEvent

    /** The connection could not be established. */
    data class Failed(val reason: String?) : VoiceEvent

    /** The membership IDs that are currently speaking, loudest first. */
    data class SpeakersChanged(val speakingMembershipIds: Set<String>) : VoiceEvent
}
