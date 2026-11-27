package top.roomio.data.party

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class SocketIoProtocolTest {
    @Test
    fun encodesSocketIoPacketsWithOneEngineIoMessagePrefix() {
        assertEquals(
            "40/watchparty/rooms/room-1,{\"ticket\":\"one-use\"}",
            encodeNamespaceConnect("/watchparty/rooms/room-1", "{\"ticket\":\"one-use\"}"),
        )
        assertEquals(
            "42/watchparty/rooms/room-1,7[\"sync.request\",{}]",
            encodeNamespaceEvent("/watchparty/rooms/room-1", 7, "[\"sync.request\",{}]"),
        )
    }

    @Test
    fun parsesNamespacedConnectEventAndAckIds() {
        val connect = parseSocketIoPacket("0/watchparty/rooms/room-1,{\"ticket\":\"one-use\"}")
        assertEquals(SOCKET_CONNECT, connect.type)
        assertEquals("/watchparty/rooms/room-1", connect.namespace)
        assertEquals("{\"ticket\":\"one-use\"}", connect.data)

        val event = parseSocketIoPacket("2/watchparty/rooms/room-1,7[\"sync.request\",{}]")
        assertEquals(SOCKET_EVENT, event.type)
        assertEquals("/watchparty/rooms/room-1", event.namespace)
        assertEquals("7", event.acknowledgementId)
        assertEquals("[\"sync.request\",{}]", event.data)

        val ack = parseSocketIoPacket("3/watchparty/voice/room-1,12[{\"accepted\":true}]")
        assertEquals(SOCKET_ACK, ack.type)
        assertEquals("/watchparty/voice/room-1", ack.namespace)
        assertEquals("12", ack.acknowledgementId)
    }

    @Test
    fun enginePingPongEchoesPayloadAndBoundsFrames() {
        val packets = parseEnginePackets("2probe\u001e3ready")
        assertEquals(listOf(2, 3), packets.map { it.type })
        assertEquals("3probe", enginePongFrame(packets.first()))
        assertEquals(null, enginePongFrame(packets.last()))
        assertFailsWith<IllegalArgumentException> { parseEnginePackets("7unsupported") }
        assertFailsWith<IllegalArgumentException> { parseEnginePackets("4" + "x".repeat(MAX_SOCKET_FRAME_BYTES)) }
    }
}
