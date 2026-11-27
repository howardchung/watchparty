package top.roomio.domain.party

/** Result of an explicit sync-to-leader request. */
enum class SyncStatus { APPLIED, UNAVAILABLE }

/**
 * A typed realtime event from the room WebSocket. Delivery is at-least-once, so
 * consumers must tolerate duplicates.
 */
sealed interface RealtimeEvent {
    data class GroupSyncChanged(val value: GroupSyncAttempt?, val serverTimeMs: Long) : RealtimeEvent
    /** Full room state, sent on connect or recovery. Replaces local state. */
    data class Snapshot(val value: RoomSnapshot) : RealtimeEvent

    data class MemberJoined(val member: Member) : RealtimeEvent

    data class MemberLeft(val membershipId: String) : RealtimeEvent

    data class MemberAbsent(val member: Member) : RealtimeEvent

    data class MemberReturned(val member: Member) : RealtimeEvent

    data class OwnerPresence(val present: Boolean) : RealtimeEvent

    data class StreamStarted(
        val sessionId: String,
        val revision: Long,
        val url: String,
        val sourceKind: MediaSourceKind = MediaSourceKind.URL,
        val fileName: String = "",
    ) : RealtimeEvent

    data class StreamAborted(
        val sessionId: String,
        val revision: Long,
    ) : RealtimeEvent

    data class ChatMessageReceived(val message: ChatMessage) : RealtimeEvent

    data object RoomClosed : RealtimeEvent

    data class SyncResult(
        val status: SyncStatus,
        val targetPositionMs: Long,
        /** Echoes the [RealtimeSession.requestSync] correlation id when the server supports it. */
        val requestId: String = "",
        val playing: Boolean = true,
        val serverTimeMs: Long = 0,
    ) : RealtimeEvent

    data class Failure(
        val code: String,
        val message: String,
    ) : RealtimeEvent

    /** A message this client does not handle (for example `pong`). */
    data object Ignored : RealtimeEvent
}
