package top.roomio.domain.party

import kotlinx.coroutines.flow.Flow

/**
 * A stable, machine-readable backend error (for example `ROOM_FULL`). Presentation
 * maps this to user-facing copy.
 */
class PartyException(
    val code: String,
    message: String,
) : Exception(message)

/** Machine code used when a request failed before reaching the backend (DNS, connection, timeout). */
const val PARTY_CODE_NETWORK = "NETWORK"

/** True when the failure happened before the backend could answer, for example while offline. */
fun PartyException.isConnectivity(): Boolean = code == PARTY_CODE_NETWORK

/** Creates and maintains the guest identity and its credentials. */
interface SessionRepository {
    /**
     * Returns the stored session, creating a guest identity if none exists.
     * [name] and [avatar] seed the identity on first creation and update the
     * stored identity when they no longer match. Callers pass the current local
     * profile so room membership always uses the latest name and avatar.
     */
    suspend fun ensureSession(name: String, avatar: String, language: String = "en"): GuestSession

    /** The stored session, or null when this device has never registered. */
    suspend fun currentSession(): GuestSession?

    /** Refreshes the access token. Returns null when there is no session. */
    suspend fun refresh(): GuestSession?

    /** Explicitly revokes and clears this device identity after user confirmation. */
    suspend fun reset()

    /** Updates the backend profile and the locally cached identity. */
    suspend fun updateProfile(name: String, avatar: String, language: String): GuestIdentity
}

/** Room lifecycle, shared stream control, and voice credentials. */
interface RoomRepository {
    /** Durable room-scoped UUID; unchanged retries return the original accepted message. */
    suspend fun sendChatMessage(roomId: String, messageId: String, text: String): ChatMessage =
        throw PartyException("UNAVAILABLE", "Chat unavailable")

    /** Latest 50 messages, or an exclusive earlier sequence page. Active members only. */
    suspend fun chatHistory(roomId: String, before: Long? = null): ChatPage =
        throw PartyException("UNAVAILABLE", "Chat unavailable")

    /** Submit diagnostics captured through this action; retry unchanged descriptions idempotently. */
    suspend fun reportBug(roomId: String?, description: String, screenshots: List<ReportScreenshot> = emptyList()) { throw PartyException("UNAVAILABLE", "Reports unavailable") }

    /** Last successful admission for the current identity on this device. */
    suspend fun lastRoom(): Room? = null

    suspend fun createRoom(title: String): Room

    suspend fun preview(code: String): RoomPreview

    suspend fun join(code: String): Room

    suspend fun snapshot(roomId: String): RoomSnapshot

    /** Returns true when leaving closed the room (last seat released). */
    suspend fun leave(roomId: String): Boolean

    suspend fun startStream(roomId: String, url: String): StreamInfo

    /** Only public source metadata; never device paths. */
    suspend fun startSource(roomId: String, url: String = "", fileName: String = "", replaceRevision: Long? = null): StreamInfo

    suspend fun abortStream(roomId: String): StreamInfo

    suspend fun voiceConfiguration(roomId: String, voiceSessionId: String? = null): VoiceConfiguration
}

/** Opens authenticated room WebSockets using single-use tickets. */
interface RealtimeClient {
    suspend fun connect(roomId: String): RealtimeSession
}

/** A live room connection. Close it when leaving the room. */
interface RealtimeSession {
    val events: Flow<RealtimeEvent>

    suspend fun reportPlayback(streamSessionId: String, positionMs: Long, playing: Boolean)

    /**
     * Requests a sync-to-leader. [requestId] correlates the eventual
     * [RealtimeEvent.SyncResult] with this call so stale replies can be ignored.
     */
    suspend fun requestSync(streamSessionId: String, positionMs: Long, requestId: String)

    suspend fun groupSync(action: String, streamSessionId: String, requestId: String, positionMs: Long? = null, response: String? = null, ready: Boolean? = null, reason: String? = null): GroupSyncAttempt? = throw PartyException("UNAVAILABLE", "Sync unavailable")

    suspend fun syncClock(): Long = throw PartyException("UNAVAILABLE", "Clock unavailable")

    suspend fun close()
}
