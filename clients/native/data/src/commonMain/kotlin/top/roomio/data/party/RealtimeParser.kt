package top.roomio.data.party

import top.roomio.data.diagnostics.loggedRunCatching

import co.touchlab.kermit.Logger
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import top.roomio.data.party.dto.ErrorMessageDto
import top.roomio.data.party.dto.EventMessageDto
import top.roomio.data.party.dto.MemberEventPayload
import top.roomio.data.party.dto.MemberSummaryDto
import top.roomio.data.party.dto.OwnerPresencePayload
import top.roomio.data.party.dto.SnapshotMessageDto
import top.roomio.data.party.dto.StreamEventPayload
import top.roomio.data.party.dto.SyncResultMessageDto
import top.roomio.data.party.dto.toDomain
import top.roomio.domain.party.Member
import top.roomio.domain.party.RealtimeEvent
import top.roomio.domain.party.SyncStatus

private val log = Logger.withTag("RealtimeParser")

internal fun parseRealtimeFrame(json: Json, text: String): RealtimeEvent {
    val element = loggedRunCatching("RealtimeParser.run1") { json.parseToJsonElement(text).jsonObject }.getOrNull()
    if (element == null) {
        log.w("unparseable frame (${text.length} chars)")
        return RealtimeEvent.Ignored
    }
    val type = element["type"]?.jsonPrimitive?.contentOrNull
    if (type == null) {
        log.w("frame without type (${text.length} chars)")
        return RealtimeEvent.Ignored
    }
    return when (type) {
        "snapshot" -> {
            log.i("snapshot frame (${text.length} chars)")
            RealtimeEvent.Snapshot(
                json.decodeFromJsonElement(SnapshotMessageDto.serializer(), element).toDomain(),
            )
        }
        "event" -> parseEvent(json, element, text)
        "sync.state" -> {
            val serverTime = element["serverTimeMs"]?.jsonPrimitive?.contentOrNull?.toLongOrNull() ?: error("Missing sync clock")
            RealtimeEvent.GroupSyncChanged(parseGroupSync(element["state"]), serverTime)
        }
        "sync.result" -> {
            val dto = json.decodeFromJsonElement(SyncResultMessageDto.serializer(), element)
            log.i("sync.result status=${dto.status} target=${dto.targetPositionMs}ms")
            RealtimeEvent.SyncResult(dto.status.toSyncStatus(), dto.targetPositionMs, dto.requestId, dto.playing, dto.serverTimeMs)
        }
        "error" -> {
            val dto = json.decodeFromJsonElement(ErrorMessageDto.serializer(), element)
            log.e("server error code=${dto.code}")
            RealtimeEvent.Failure(dto.code, dto.message)
        }
        else -> {
            log.d("ignored frame type=$type")
            RealtimeEvent.Ignored
        }
    }
}

private fun parseEvent(json: Json, element: JsonObject, text: String): RealtimeEvent {
    val dto = loggedRunCatching("RealtimeParser.run2") {
        json.decodeFromJsonElement(EventMessageDto.serializer(), element)
    }.getOrNull()
    if (dto == null) {
        log.w("unparseable event frame (${text.length} chars)")
        return RealtimeEvent.Ignored
    }
    val payload = dto.payload
    return when (dto.topic) {
        "member.joined" -> memberEvent(json, payload) { RealtimeEvent.MemberJoined(it) }
        "member.returned" -> memberEvent(json, payload) { RealtimeEvent.MemberReturned(it) }
        "member.left" -> RealtimeEvent.MemberLeft(memberEventPayload(json, payload)?.membershipId.orEmpty())
        "member.absent" -> memberEvent(json, payload) { RealtimeEvent.MemberAbsent(it) }
        "owner.presence" -> RealtimeEvent.OwnerPresence(ownerPresence(json, payload))
        "stream.started" -> streamEvent(json, payload) {
            RealtimeEvent.StreamStarted(it.streamSessionId, it.revision, it.url, if(it.sourceKind=="LOCAL_FILE") top.roomio.domain.party.MediaSourceKind.LOCAL_FILE else top.roomio.domain.party.MediaSourceKind.URL, it.fileName)
        }
        "stream.aborted" -> streamEvent(json, payload) {
            RealtimeEvent.StreamAborted(it.streamSessionId, it.revision)
        }
        "chat.message" -> {
            val message = json.decodeFromJsonElement(top.roomio.data.party.dto.ChatMessageDto.serializer(),
                requireNotNull(payload?.get("message")))
            require(message.sequence > 0 && message.sequence == dto.sequence) { "Invalid chat event sequence" }
            RealtimeEvent.ChatMessageReceived(message.toDomain())
        }
        "room.closed" -> RealtimeEvent.RoomClosed
        else -> RealtimeEvent.Ignored
    }
}

private fun memberEvent(
    json: Json,
    payload: JsonObject?,
    factory: (Member) -> RealtimeEvent,
): RealtimeEvent {
    val member = memberEventPayload(json, payload)?.toDomain() ?: return RealtimeEvent.Ignored
    return factory(member)
}

private fun memberEventPayload(json: Json, payload: JsonObject?): MemberSummaryDto? {
    if (payload == null) return null
    return loggedRunCatching("RealtimeParser.run3") {
        json.decodeFromJsonElement(MemberEventPayload.serializer(), payload).member
    }.getOrNull()
}

private fun ownerPresence(json: Json, payload: JsonObject?): Boolean {
    if (payload == null) return false
    return loggedRunCatching("RealtimeParser.run4") {
        json.decodeFromJsonElement(OwnerPresencePayload.serializer(), payload).present
    }.getOrDefault(false)
}

private fun streamEvent(
    json: Json,
    payload: JsonObject?,
    factory: (StreamEventPayload) -> RealtimeEvent,
): RealtimeEvent {
    if (payload == null) return RealtimeEvent.Ignored
    return loggedRunCatching("RealtimeParser.run5") {
        factory(json.decodeFromJsonElement(StreamEventPayload.serializer(), payload))
    }.getOrElse { RealtimeEvent.Ignored }
}

private fun String.toSyncStatus(): SyncStatus = when (uppercase()) {
    "APPLIED" -> SyncStatus.APPLIED
    else -> SyncStatus.UNAVAILABLE
}
