package top.roomio.domain.party

/** A durable anonymous identity created by the backend. */
data class GuestIdentity(
    val id: String,
    val name: String,
    val avatar: String,
    val language: String,
)

/** A guest identity together with its rotated credential pair. */
data class GuestSession(
    val identity: GuestIdentity,
    val accessToken: String,
    val refreshToken: String,
)

/** A watch party room. */
data class Room(
    val id: String,
    val code: String,
    val title: String,
    val ownerIdentityId: String,
    val ended: Boolean,
)

/** Availability of a room before joining. */
enum class RoomAvailability { OPEN, FULL, ENDED }

enum class MediaSourceKind { URL, LOCAL_FILE }

/** Authoritative shared stream state. */
enum class StreamState { EMPTY, ACTIVE, ABORTED }

/** The pre-join room summary. */
data class RoomPreview(
    val code: String,
    val title: String,
    val ownerName: String,
    val ownerPresent: Boolean,
    val participantCount: Int,
    val availability: RoomAvailability,
    val streamState: StreamState,
)

/** A member currently seated in a room. */
data class Member(
    val membershipId: String,
    val identityId: String,
    val displayName: String,
    val avatar: String,
    val isOwner: Boolean,
    val present: Boolean,
)

/** Shared stream metadata. Video bytes are never proxied by the backend. */
data class StreamInfo(
    val sessionId: String,
    val revision: Long,
    val state: StreamState,
    val url: String,
    val sourceKind: MediaSourceKind = MediaSourceKind.URL,
    val fileName: String = "",
)

/** A room's full state: the room, its members, and the shared stream. */
data class RoomSnapshot(
    val room: Room,
    val members: List<Member>,
    val stream: StreamInfo,
    val chat: ChatPage = ChatPage(),
)

/** Short-lived, room-scoped descriptor for one authenticated WebRTC mesh role. */
data class VoiceConfiguration(
    val mode: String,
    val roomId: String,
    val membershipId: String,
    val voiceSessionId: String,
    val namespace: String,
    val ticket: String,
    val iceServers: List<IceServer>,
    val iceExpiresAt: String,
)

/** WebRTC ICE server credentials. TURN credentials are temporary secrets. */
data class IceServer(
    val urls: List<String>,
    val username: String? = null,
    val credential: String? = null,
)
