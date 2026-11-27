package top.roomio.data.party.dto

import kotlinx.serialization.EncodeDefault
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject
import top.roomio.domain.party.IceServer
import top.roomio.domain.party.VoiceConfiguration

@Serializable
data class GuestSessionRequest(
    val name: String,
    val avatar: String,
    val language: String,
)

@Serializable
data class ProfileResponseDto(
    val identity: IdentityDto,
)

@Serializable
data class CreateRoomRequest(
    val title: String,
)

@Serializable
data class StartStreamRequest(
    val url: String = "",
    val sourceKind: String = "URL",
    val fileName: String = "",
    val replace: Boolean = false,
    val revision: Long? = null,
)

@Serializable
data class LeaveResponseDto(
    val roomClosed: Boolean,
)

@Serializable
data class PlaybackReportMessage(
    @EncodeDefault(EncodeDefault.Mode.ALWAYS)
    val type: String = "playback.report",
    val streamSessionId: String,
    val positionMs: Long,
    val playing: Boolean,
)

@Serializable
data class SyncRequestMessage(
    @EncodeDefault(EncodeDefault.Mode.ALWAYS)
    val type: String = "sync.request",
    @EncodeDefault(EncodeDefault.Mode.ALWAYS)
    val requestId: String = "",
    val streamSessionId: String,
    val positionMs: Long,
)

@Serializable
data class RefreshRequest(
    val refreshToken: String,
)

@Serializable
data class IdentityDto(
    val id: String,
    val name: String,
    val avatar: String,
    val language: String,
)

@Serializable
data class SessionDto(
    val identity: IdentityDto,
    val accessToken: String,
    val accessExpiresAt: String,
    val refreshToken: String,
    val refreshExpiresAt: String,
)

@Serializable
data class RoomDto(
    val id: String,
    val code: String,
    val title: String,
    val ownerIdentityId: String,
    val endedAt: String? = null,
)

@Serializable
data class MembershipDto(
    val id: String,
    val roomId: String,
    val identityId: String,
    val displayName: String,
    val avatar: String,
    val isOwner: Boolean,
    val leftAt: String? = null,
)

@Serializable
data class RoomAndMembershipDto(
    val room: RoomDto,
    val membership: MembershipDto,
)

@Serializable
data class RoomPreviewDto(
    val code: String,
    val title: String,
    val ownerName: String,
    val ownerPresent: Boolean,
    val participantCount: Int,
    val availability: String,
    val streamState: String,
)

@Serializable
data class MemberSummaryDto(
    val membershipId: String,
    val identityId: String,
    val displayName: String,
    val avatar: String,
    val isOwner: Boolean,
    val present: Boolean,
)

@Serializable
data class StreamDto(
    val sourceKind: String = "URL",
    val fileName: String = "",
    val sessionId: String,
    val revision: Long,
    val state: String,
    val url: String,
)

@Serializable
data class StreamResponseDto(
    val stream: StreamDto,
    val chat: ChatPageDto = ChatPageDto(),
)

@Serializable
data class SnapshotDto(
    val room: RoomDto,
    val members: List<MemberSummaryDto>,
    val stream: StreamDto,
    val chat: ChatPageDto = ChatPageDto(),
)

@Serializable
data class VoiceConfigurationDto(
    val mode: String,
    val roomId: String,
    val membershipId: String,
    val voiceSessionId: String,
    val namespace: String,
    val ticket: String = "",
    val iceServers: List<IceServerDto>,
    val iceExpiresAt: String,
)

@Serializable
data class VoiceConfigurationRequest(val voiceSessionId: String, val operation: String)

@Serializable
data class IceServerDto(
    val urls: List<String>,
    val username: String? = null,
    val credential: String? = null,
)

fun IceServerDto.toDomain() = IceServer(urls, username, credential)

fun VoiceConfigurationDto.toDomain() = VoiceConfiguration(
    mode = mode,
    roomId = roomId,
    membershipId = membershipId,
    voiceSessionId = voiceSessionId,
    namespace = namespace,
    ticket = ticket,
    iceServers = iceServers.map(IceServerDto::toDomain),
    iceExpiresAt = iceExpiresAt,
)

@Serializable
data class RealtimeTicketDto(
    val ticket: String,
    val namespace: String,
    val expiresAt: String,
)

@Serializable
data class ErrorDto(
    val code: String,
    val message: String = "",
)

@Serializable
data class SnapshotMessageDto(
    val type: String,
    val room: RoomDto,
    val members: List<MemberSummaryDto>,
    val stream: StreamDto,
    val chat: ChatPageDto = ChatPageDto(),
)

@Serializable
data class EventMessageDto(
    val type: String,
    val topic: String,
    val sequence: Long = 0,
    val payload: JsonObject? = null,
)

@Serializable
data class SyncResultMessageDto(
    val playing: Boolean = true,
    val serverTimeMs: Long = 0,
    val type: String,
    val status: String,
    val targetPositionMs: Long,
    val requestId: String = "",
)

@Serializable
data class ErrorMessageDto(
    val type: String,
    val code: String,
    val message: String,
)

@Serializable
data class TypeOnlyDto(
    val type: String,
)

// Durable event payloads.

@Serializable
data class MemberEventPayload(
    val member: MemberSummaryDto? = null,
)

@Serializable
data class OwnerPresencePayload(
    val present: Boolean = false,
)

@Serializable
data class StreamEventPayload(
    val sourceKind: String = "URL",
    val fileName: String = "",
    val streamSessionId: String = "",
    val revision: Long = 0,
    val url: String = "",
)

@Serializable
data class ChatMessageDto(
    val id: String, val roomId: String, val identityId: String, val membershipId: String,
    val displayName: String, val avatar: String, val text: String, val createdAt: String, val sequence: Long,
)

@Serializable
data class ChatPageDto(val messages: List<ChatMessageDto> = emptyList(), val hasMore: Boolean = false)

@Serializable
internal data class SendChatRequest(val messageId: String, val text: String)

@Serializable
internal data class ChatResponseDto(val message: ChatMessageDto)
