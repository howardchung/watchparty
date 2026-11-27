package top.roomio.data.party.dto

import top.roomio.domain.party.GuestIdentity
import top.roomio.domain.party.GuestSession
import top.roomio.domain.party.Member
import top.roomio.domain.party.Room
import top.roomio.domain.party.RoomAvailability
import top.roomio.domain.party.RoomPreview
import top.roomio.domain.party.RoomSnapshot
import top.roomio.domain.party.StreamInfo
import top.roomio.domain.party.StreamState

internal fun IdentityDto.toDomain() = GuestIdentity(
    id = id,
    name = name,
    avatar = avatar,
    language = language,
)

internal fun SessionDto.toDomain() = GuestSession(
    identity = identity.toDomain(),
    accessToken = accessToken,
    refreshToken = refreshToken,
)

internal fun RoomDto.toDomain() = Room(
    id = id,
    code = code,
    title = title,
    ownerIdentityId = ownerIdentityId,
    ended = endedAt != null,
)

internal fun MemberSummaryDto.toDomain() = Member(
    membershipId = membershipId,
    identityId = identityId,
    displayName = displayName,
    avatar = avatar,
    isOwner = isOwner,
    present = present,
)

internal fun StreamDto.toDomain() = StreamInfo(
    sessionId = sessionId,
    revision = revision,
    state = state.toStreamState(),
    url = url,
    sourceKind = if(sourceKind == "LOCAL_FILE") top.roomio.domain.party.MediaSourceKind.LOCAL_FILE else top.roomio.domain.party.MediaSourceKind.URL,
    fileName = fileName,
)

internal fun SnapshotDto.toDomain() = RoomSnapshot(
    room = room.toDomain(),
    members = members.map { it.toDomain() },
    stream = stream.toDomain(),
    chat = chat.toDomain(),
)

internal fun SnapshotMessageDto.toDomain() = RoomSnapshot(
    room = room.toDomain(),
    members = members.map { it.toDomain() },
    stream = stream.toDomain(),
    chat = chat.toDomain(),
)

internal fun RoomPreviewDto.toDomain() = RoomPreview(
    code = code,
    title = title,
    ownerName = ownerName,
    ownerPresent = ownerPresent,
    participantCount = participantCount,
    availability = when (availability.uppercase()) {
        "FULL" -> RoomAvailability.FULL
        "ENDED" -> RoomAvailability.ENDED
        else -> RoomAvailability.OPEN
    },
    streamState = streamState.toStreamState(),
)

internal fun String.toStreamState(): StreamState = when (uppercase()) {
    "ACTIVE" -> StreamState.ACTIVE
    "ABORTED" -> StreamState.ABORTED
    else -> StreamState.EMPTY
}

internal fun ChatMessageDto.toDomain() = top.roomio.domain.party.ChatMessage(
    id, roomId, identityId, membershipId, displayName, avatar, text, createdAt, sequence,
)
internal fun ChatPageDto.toDomain() = top.roomio.domain.party.ChatPage(messages.map { it.toDomain() }, hasMore)
