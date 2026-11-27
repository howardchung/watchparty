package top.roomio.data.party

import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import top.roomio.domain.party.RealtimeEvent

class SnapshotEventGateTest {
    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun snapshotPrecedesBufferedEventsAndDurableEventsAreDeduplicated() {
        val gate = SnapshotEventGate(json)
        val started = SocketIoEvent("event", json.parseToJsonElement(
            """{"eventId":"event-1","sequence":1,"topic":"stream.started","payload":{"streamSessionId":"session-1","revision":1,"url":"https://example.test/movie.mp4"}}""",
        ))
        assertEquals(emptyList(), gate.accept(started))

        val snapshot = SocketIoEvent("snapshot", json.parseToJsonElement(
            """{"room":{"id":"room-1","code":"ABCD1234","title":"Friday","ownerIdentityId":"identity-1","endedAt":null},"members":[],"stream":{"sessionId":"","revision":0,"state":"EMPTY","url":""},"sequence":0}""",
        ))
        val restored = gate.accept(snapshot)
        assertEquals(2, restored.size)
        assertEquals(true, restored[0] is RealtimeEvent.Snapshot)
        assertEquals(RealtimeEvent.StreamStarted("session-1", 1, "https://example.test/movie.mp4"), restored[1])
        assertEquals(emptyList(), gate.accept(started))
    }

    @Test
    fun eventSequenceGapRequestsFreshSnapshot() {
        val gate = SnapshotEventGate(json)
        gate.accept(SocketIoEvent("snapshot", json.parseToJsonElement(
            """{"room":{"id":"r","code":"ABCD1234","title":"Friday","ownerIdentityId":"owner","endedAt":null},"members":[],"stream":{"sessionId":"","revision":0,"state":"EMPTY","url":""},"sequence":2}""",
        )))
        val gap = SocketIoEvent("event", json.parseToJsonElement(
            """{"eventId":"event-4","sequence":4,"topic":"room.closed","payload":{}}""",
        ))
        assertFailsWith<IllegalStateException> { gate.accept(gap) }
    }
}
