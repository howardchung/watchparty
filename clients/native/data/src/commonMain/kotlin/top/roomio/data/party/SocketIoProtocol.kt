package top.roomio.data.party

/** Minimal bounded Engine.IO v4 / Socket.IO v5 JSON WebSocket framing. */
// A room bootstrap can include fifty 500-character Unicode chat messages plus metadata.
internal const val MAX_SOCKET_FRAME_BYTES = 256 * 1024

internal data class EnginePacket(val type: Int, val data: String)

internal data class SocketIoPacket(
    val type: Int,
    val namespace: String,
    val acknowledgementId: String?,
    val data: String,
)

internal fun parseEnginePackets(frame: String): List<EnginePacket> {
    require(frame.encodeToByteArray().size <= MAX_SOCKET_FRAME_BYTES) { "Engine.IO frame exceeds limit" }
    return frame.split('\u001e').map { packet ->
        require(packet.isNotEmpty() && packet[0] in '0'..'6') { "Invalid Engine.IO packet" }
        EnginePacket(packet[0].digitToInt(), packet.drop(1))
    }
}

/** Parses a Socket.IO packet body, after Engine.IO's leading `4` message type. */
internal fun parseSocketIoPacket(message: String): SocketIoPacket {
    require(message.encodeToByteArray().size <= MAX_SOCKET_FRAME_BYTES) { "Socket.IO packet exceeds limit" }
    require(message.isNotEmpty() && message[0] in '0'..'6') { "Invalid Socket.IO packet" }
    val type = message[0].digitToInt()
    var rest = message.drop(1)
    var namespace = "/"
    if (rest.startsWith('/')) {
        val comma = rest.indexOf(',')
        if (comma >= 0) {
            namespace = rest.substring(0, comma)
            rest = rest.drop(comma + 1)
        } else if (type == SOCKET_CONNECT) {
            namespace = rest
            rest = ""
        } else {
            throw IllegalArgumentException("Namespaced Socket.IO packet has no separator")
        }
    }
    var ackId: String? = null
    if (type == SOCKET_EVENT || type == SOCKET_ACK) {
        val count = rest.takeWhile(Char::isDigit).length
        if (count > 0) {
            ackId = rest.take(count)
            rest = rest.drop(count)
        }
    }
    return SocketIoPacket(type, namespace, ackId, rest)
}

/** Engine.IO v4 server pings are answered with a matching pong payload. */
internal fun enginePongFrame(packet: EnginePacket): String? = if (packet.type == 2) "3${packet.data}" else null

internal fun encodeNamespaceConnect(namespace: String, authJson: String): String =
    "40$namespace,$authJson"

internal fun encodeNamespaceEvent(namespace: String, acknowledgementId: Int, eventJson: String): String =
    "42$namespace,$acknowledgementId$eventJson"

internal const val SOCKET_CONNECT = 0
internal const val SOCKET_DISCONNECT = 1
internal const val SOCKET_EVENT = 2
internal const val SOCKET_ACK = 3
internal const val SOCKET_CONNECT_ERROR = 4
