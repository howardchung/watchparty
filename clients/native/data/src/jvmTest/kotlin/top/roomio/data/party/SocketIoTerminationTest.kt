package top.roomio.data.party

import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.websocket.WebSockets
import io.ktor.client.plugins.websocket.webSocketSession
import java.net.ServerSocket
import java.net.Socket
import java.security.MessageDigest
import java.util.Base64
import kotlin.concurrent.thread
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue
import kotlin.test.assertFalse
import kotlinx.coroutines.async
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.supervisorScope
import kotlinx.coroutines.withTimeout
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import top.roomio.domain.party.PartyException

/** Real WebSocket transport: pending ACKs and namespace receivers must both terminate. */
class SocketIoTerminationTest {
    @Test fun cleanServerCloseTerminatesAckAndEvents() = exercise { socket, _ -> socket.frame(8, byteArrayOf(3, -24)) }
    @Test fun cleanEofTerminatesAckAndEvents() = exercise { socket, _ -> socket.close() }
    @Test fun explicitClientCloseTerminatesAckAndEvents() = exercise { _, connection -> connection.close() }
    @Test fun heartbeatExpiryTerminatesAckAndEvents() = exercise(heartbeat = true) { _, _ -> Unit }
    @Test fun transportCancellationFailsConsumersWithoutCancellingTheirOwner() = exercise(cancelTransport = true) { _, _ -> Unit }
    @Test fun namespaceCloseImmediatelyRevokesLivenessWithoutWaitingForItsEventConsumer() = exercise(namespaceOnly = true) { socket, _ -> socket.text("41/test,") }

    @Test fun namespaceErrorPreservesBackendCode() = runBlocking {
        fixture(reject = true) { port ->
            val http = HttpClient(OkHttp) { install(WebSockets) }
            try {
                val connection = SocketIoConnection(http.webSocketSession("ws://127.0.0.1:$port/"), Json)
                connection.awaitOpen()
                val error = assertFailsWith<PartyException> { connection.connectNamespace("/test", "ticket", 4) }
                assertEquals("VOICE_SESSION_EXPIRED", error.code)
                connection.close()
            } finally { http.close() }
        }
    }

    private fun exercise(heartbeat: Boolean = false, cancelTransport: Boolean = false, namespaceOnly: Boolean = false, terminate: suspend (Socket, SocketIoConnection) -> Unit) = runBlocking {
        fixture { port ->
            val http = HttpClient(OkHttp) { install(WebSockets) }
            try {
                withTimeout(9_000) {
                    val transport = http.webSocketSession("ws://127.0.0.1:$port/")
                    val connection = SocketIoConnection(transport, Json)
                    connection.awaitOpen()
                    val namespace = connection.connectNamespace("/test", "ticket", 4)
                    assertTrue(namespace.isConnected)
                    supervisorScope {
                        val ack = async { namespace.emit("signal", JsonObject(emptyMap())) }
                        while (!eventReceived) kotlinx.coroutines.delay(5)
                        terminate(serverSocket!!, connection)
                        if (cancelTransport) transport.incoming.cancel(CancellationException("Test transport cancellation"))
                        val failure = runCatching { ack.await() }.exceptionOrNull()
                        assertTrue(failure != null)
                        // The event consumer has not read its close yet; the
                        // transport/namespace state already forbids new unmute.
                        assertFalse(namespace.isConnected)
                        if (namespaceOnly) assertFalse(connection.isClosed)
                        if (heartbeat) assertEquals("SOCKET_HEARTBEAT_TIMEOUT", (failure as PartyException).code)
                        val events = namespace.events.receiveCatching()
                        assertTrue(events.isClosed)
                        if (cancelTransport) {
                            assertEquals("SOCKET_CLOSED", (failure as PartyException).code)
                            assertEquals("SOCKET_CLOSED", (events.exceptionOrNull() as PartyException).code)
                            currentCoroutineContext().ensureActive()
                        }
                    }
                    connection.close()
                }
            } finally { http.close() }
        }
    }

    @Volatile private var serverSocket: Socket? = null
    @Volatile private var eventReceived = false

    private suspend fun fixture(reject: Boolean = false, body: suspend (Int) -> Unit) {
        val listener = ServerSocket(0)
        val worker = thread(isDaemon = true) {
            runCatching {
                listener.accept().use { socket ->
                    serverSocket = socket
                    val input = socket.getInputStream()
                    val request = StringBuilder()
                    while (!request.endsWith("\r\n\r\n")) request.append(input.read().toChar())
                    val key = request.lines().first { it.startsWith("Sec-WebSocket-Key:", true) }.substringAfter(':').trim()
                    val digest = MessageDigest.getInstance("SHA-1").digest((key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").toByteArray())
                    socket.getOutputStream().write(("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + Base64.getEncoder().encodeToString(digest) + "\r\n\r\n").toByteArray())
                    socket.text("0{\"sid\":\"test\",\"pingInterval\":1000,\"pingTimeout\":1000}")
                    socket.readFrame()
                    if (reject) socket.text("44/test,{\"message\":\"expired\",\"data\":{\"code\":\"VOICE_SESSION_EXPIRED\"}}")
                    else {
                        socket.text("40/test,{\"sid\":\"test\"}")
                        socket.readFrame()
                        eventReceived = true
                    }
                    while (input.read() >= 0) Unit
                }
            }
        }
        try { body(listener.localPort) } finally {
            serverSocket?.close()
            listener.close()
            worker.join(1000)
        }
    }

    private fun Socket.text(value: String) = frame(1, value.toByteArray())
    private fun Socket.frame(opcode: Int, bytes: ByteArray) {
        val out = getOutputStream()
        out.write(0x80 or opcode)
        if (bytes.size < 126) out.write(bytes.size) else { out.write(126); out.write(bytes.size shr 8); out.write(bytes.size and 255) }
        out.write(bytes); out.flush()
    }
    private fun Socket.readFrame() {
        val input = getInputStream()
        check(input.read() >= 0)
        val header = input.read()
        var length = header and 127
        if (length == 126) length = (input.read() shl 8) or input.read()
        if (header and 128 != 0) repeat(4) { input.read() }
        repeat(length) { check(input.read() >= 0) }
    }
}
