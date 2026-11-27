package top.roomio.data.party

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.contentOrNull
import top.roomio.domain.party.RealtimeEvent

/** Enforces snapshot-first bootstrap and bounded sequence/event-ID deduplication. */
internal class SnapshotEventGate(private val json: Json) {
    private var snapshotInstalled = false
    private var lastSequence = 0L
    private val pending = mutableListOf<SocketIoEvent>()
    private val eventIds = linkedSetOf<String>()

    fun accept(event: SocketIoEvent): List<RealtimeEvent> {
        if (event.name == "snapshot") {
            val sequence = event.payload.jsonObject.number("sequence") ?: 0L
            val result = mutableListOf(decode(event))
            snapshotInstalled = true
            lastSequence = sequence
            val buffered = pending.sortedBy { it.payload.jsonObject.number("sequence") ?: Long.MAX_VALUE }
            pending.clear()
            buffered.forEach { acceptDurable(it, result) }
            return result
        }
        if (event.name == "event" && !snapshotInstalled) {
            if (pending.size >= MAX_PENDING_BEFORE_SNAPSHOT) throw IllegalStateException("Snapshot did not arrive before room events")
            pending += event
            return emptyList()
        }
        if (event.name == "event") {
            val result = mutableListOf<RealtimeEvent>()
            acceptDurable(event, result)
            return result
        }
        return listOf(decode(event))
    }

    private fun acceptDurable(event: SocketIoEvent, into: MutableList<RealtimeEvent>) {
        val body = event.payload.jsonObject
        val sequence = body.number("sequence") ?: throw IllegalArgumentException("Durable event has no sequence")
        val eventId = body.string("eventId")
        if (sequence <= lastSequence || (eventId != null && eventId in eventIds)) return
        if (lastSequence > 0 && sequence != lastSequence + 1) {
            throw IllegalStateException("Room event sequence gap requires a fresh snapshot")
        }
        lastSequence = sequence
        if (eventId != null) {
            eventIds += eventId
            while (eventIds.size > MAX_DEDUP_EVENT_IDS) eventIds.remove(eventIds.first())
        }
        into += decode(event)
    }

    private fun decode(event: SocketIoEvent): RealtimeEvent {
        val value = event.payload as? JsonObject ?: return RealtimeEvent.Ignored
        val normalized = JsonObject(value + ("type" to JsonPrimitive(event.name)))
        return parseRealtimeFrame(json, json.encodeToString(JsonObject.serializer(), normalized))
    }

    private fun JsonObject.number(key: String): Long? = this[key]?.jsonPrimitive?.contentOrNull?.toLongOrNull()
    private fun JsonObject.string(key: String): String? = this[key]?.jsonPrimitive?.contentOrNull

    private companion object {
        const val MAX_PENDING_BEFORE_SNAPSHOT = 64
        const val MAX_DEDUP_EVENT_IDS = 256
    }
}
