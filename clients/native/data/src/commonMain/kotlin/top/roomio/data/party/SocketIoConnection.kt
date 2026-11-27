package top.roomio.data.party

import top.roomio.data.diagnostics.logHandledException
import top.roomio.data.diagnostics.loggedRunCatching

import io.ktor.client.plugins.websocket.DefaultClientWebSocketSession
import io.ktor.websocket.CloseReason
import io.ktor.websocket.Frame
import io.ktor.websocket.close
import io.ktor.websocket.send
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withTimeout
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.contentOrNull
import top.roomio.domain.party.PartyException

internal data class SocketIoEvent(val name: String, val payload: JsonElement)

/** One WebSocket receiver demultiplexes all Socket.IO namespaces on this Engine.IO connection. */
internal class SocketIoConnection(
    private val socket: DefaultClientWebSocketSession,
    private val json: Json,
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val sendMutex = Mutex()
    private val namespaces = mutableMapOf<String, SocketIoNamespace>()
    private val engineOpened = CompletableDeferred<Unit>()
    private val closed = CompletableDeferred<Throwable?>()
    internal val isClosed: Boolean get() = closed.isCompleted
    private var nextAckId = 0
    private var heartbeatMs = DEFAULT_PING_INTERVAL_MS
    private var timeoutMs = DEFAULT_PING_TIMEOUT_MS
    private var lastPacketAt = nowMs()

    init {
        scope.launch { receiveLoop() }
        scope.launch { heartbeatLoop() }
    }

    suspend fun awaitOpen() = withTimeout(OPEN_TIMEOUT_MS) { engineOpened.await() }

    suspend fun connectNamespace(namespace: String, ticket: String, protocolVersion: Int = 3): SocketIoNamespace {
        require(namespace.startsWith('/') && namespace.length <= 256)
        val client = SocketIoNamespace(this, namespace)
        synchronized(namespaces) {
            check(!closed.isCompleted) { "Connection is closed" }
            check(namespace !in namespaces) { "Namespace already connected" }
            namespaces[namespace] = client
        }
        val auth = json.encodeToString(JsonObject.serializer(), JsonObject(mapOf(
            "ticket" to json.parseToJsonElement(json.encodeToString(ticket)),
            "protocolVersion" to JsonPrimitive(protocolVersion),
        )))
        sendRaw(encodeNamespaceConnect(namespace, auth))
        withTimeout(NAMESPACE_CONNECT_TIMEOUT_MS) { client.connected.await() }
        return client
    }

    internal suspend fun sendEvent(namespace: String, name: String, payload: JsonElement): JsonElement {
        require(name.length in 1..64)
        val ack = CompletableDeferred<JsonElement>()
        val ackId = sendMutex.withLock {
            val client = synchronized(namespaces) { namespaces[namespace] } ?: error("Namespace is closed")
            synchronized(client.pendingAcks) {
                client.failure?.let { throw it }
                check(client.pendingAcks.size < MAX_PENDING_ACKS) { "Too many pending Socket.IO acknowledgements" }
            }
            val id = nextAckId++
            synchronized(client.pendingAcks) {
                client.failure?.let { throw it }
                client.pendingAcks[id] = ack
            }
            val event = json.encodeToString(JsonArray.serializer(), JsonArray(listOf(
                json.parseToJsonElement(json.encodeToString(name)),
                payload,
            )))
            try {
                socket.send(Frame.Text(encodeNamespaceEvent(namespace, id, event)))
            } catch (error: Throwable) {
                logHandledException("SocketIoConnection.catch1", error)
                terminate(error)
                throw error
            }
            id
        }
        try {
            return withTimeout(ACK_TIMEOUT_MS) { ack.await() }
        } finally {
            val client = synchronized(namespaces) { namespaces[namespace] }
            if (client != null) synchronized(client.pendingAcks) { client.pendingAcks.remove(ackId) }
        }
    }

    internal suspend fun sendEventWithoutAck(namespace: String, name: String, payload: JsonElement) {
        require(name.length in 1..64)
        val event = json.encodeToString(JsonArray.serializer(), JsonArray(listOf(
            json.parseToJsonElement(json.encodeToString(name)), payload,
        )))
        sendRaw("42$namespace,$event")
    }

    internal suspend fun unregister(namespace: String) {
        val remove = synchronized(namespaces) { namespaces.remove(namespace) }
        remove?.fail(PartyException("SOCKET_CLOSED", "Socket.IO namespace closed"))
        if (remove != null && !closed.isCompleted) loggedRunCatching("SocketIoConnection.run3") { sendRaw("41$namespace,") }
        if (synchronized(namespaces) { namespaces.isEmpty() }) close()
    }

    suspend fun close() {
        terminate(PartyException("SOCKET_CLOSED", "Socket.IO connection closed"))
        loggedRunCatching("SocketIoConnection.run4") { socket.close(CloseReason(CloseReason.Codes.NORMAL, "client closing")) }
        scope.cancel()
    }

    private suspend fun sendRaw(text: String) = sendMutex.withLock { socket.send(Frame.Text(text)) }

    private suspend fun receiveLoop() {
        var failure: Throwable? = null
        try {
            for (frame in socket.incoming) {
                if (frame !is Frame.Text) throw IllegalArgumentException("Only JSON text frames are supported")
                val text = frame.data.decodeToString()
                lastPacketAt = nowMs()
                for (packet in parseEnginePackets(text)) handleEnginePacket(packet)
            }
        } catch (error: Throwable) {
            logHandledException("SocketIoConnection.catch2", error)
            failure = error
        } finally {
            terminate(failure ?: PartyException("SOCKET_CLOSED", "Socket.IO connection ended"))
            scope.cancel()
        }
    }

    private suspend fun handleEnginePacket(packet: EnginePacket) {
        when (packet.type) {
            0 -> {
                require(!engineOpened.isCompleted) { "Unexpected Engine.IO open packet" }
                val open = json.parseToJsonElement(packet.data).jsonObject
                heartbeatMs = open.longOrDefault("pingInterval", DEFAULT_PING_INTERVAL_MS)
                timeoutMs = open.longOrDefault("pingTimeout", DEFAULT_PING_TIMEOUT_MS)
                require(heartbeatMs in 1_000L..120_000L && timeoutMs in 1_000L..120_000L)
                engineOpened.complete(Unit)
            }
            1 -> throw IllegalStateException("Engine.IO server closed the connection")
            2 -> sendRaw(enginePongFrame(packet) ?: error("Invalid Engine.IO ping"))
            3 -> Unit // Server-driven pings are answered with a pong; client pings need no action.
            4 -> handleSocketPacket(parseSocketIoPacket(packet.data))
            5 -> Unit // Engine.IO noop.
            else -> throw IllegalArgumentException("Unsupported Engine.IO packet type ${packet.type}")
        }
    }

    private suspend fun handleSocketPacket(packet: SocketIoPacket) {
        val client = synchronized(namespaces) { namespaces[packet.namespace] } ?: return
        when (packet.type) {
            SOCKET_CONNECT -> client.connected.complete(Unit)
            SOCKET_CONNECT_ERROR -> {
                val data = loggedRunCatching("SocketIoConnection.run5") { json.parseToJsonElement(packet.data).jsonObject }.getOrNull()
                val details = data?.get("data") as? JsonObject
                val code = details?.get("code")?.jsonPrimitive?.contentOrNull
                    ?: data?.get("code")?.jsonPrimitive?.contentOrNull ?: "INVALID_TICKET"
                client.fail(PartyException(code, "Socket.IO namespace rejected the ticket"))
            }
            SOCKET_EVENT -> {
                val values = json.parseToJsonElement(packet.data).jsonArray
                val name = values.firstOrNull()?.jsonPrimitive?.contentOrNull ?: return
                val payload = values.getOrNull(1) ?: JsonNull
                if (client.events.trySend(SocketIoEvent(name, payload)).isFailure) {
                    scope.launch { close() }
                }
            }
            SOCKET_ACK -> {
                val id = packet.acknowledgementId?.toIntOrNull() ?: return
                val payload = json.parseToJsonElement(packet.data).jsonArray.firstOrNull() ?: JsonNull
                synchronized(client.pendingAcks) { client.pendingAcks.remove(id) }?.complete(payload)
            }
            SOCKET_DISCONNECT -> client.fail(IllegalStateException("Socket.IO namespace disconnected"))
            else -> client.fail(IllegalArgumentException("Unsupported Socket.IO packet type ${packet.type}"))
        }
    }

    private suspend fun heartbeatLoop() {
        while (scope.isActive) {
            delay(HEARTBEAT_CHECK_MS)
            if (engineOpened.isCompleted && nowMs() - lastPacketAt > heartbeatMs + timeoutMs) {
                terminate(PartyException("SOCKET_HEARTBEAT_TIMEOUT", "Socket.IO heartbeat timed out"))
                close()
                return
            }
        }
    }

    private fun terminate(error: Throwable) {
        // Cancellation of this transport is a disconnect to independent namespace
        // consumers. Forwarding its CancellationException would silently cancel
        // their recovery loops even when their own jobs are still active.
        val failure = if (error is CancellationException)
            PartyException("SOCKET_CLOSED", "Socket.IO transport cancelled") else error
        if (!closed.complete(failure)) return
        engineOpened.completeExceptionally(failure)
        val active = synchronized(namespaces) { namespaces.values.toList().also { namespaces.clear() } }
        active.forEach { it.fail(failure) }
    }

    private fun JsonObject.longOrDefault(key: String, fallback: Long): Long =
        this[key]?.jsonPrimitive?.contentOrNull?.toLongOrNull() ?: fallback

    private companion object {
        const val OPEN_TIMEOUT_MS = 10_000L
        const val NAMESPACE_CONNECT_TIMEOUT_MS = 10_000L
        const val ACK_TIMEOUT_MS = 5_000L
        const val DEFAULT_PING_INTERVAL_MS = 25_000L
        const val DEFAULT_PING_TIMEOUT_MS = 20_000L
        const val HEARTBEAT_CHECK_MS = 2_000L
        const val MAX_PENDING_ACKS = 64
    }
}

internal class SocketIoNamespace internal constructor(
    private val connection: SocketIoConnection,
    val name: String,
) {
    internal val connected = CompletableDeferred<Unit>()
    internal val pendingAcks = mutableMapOf<Int, CompletableDeferred<JsonElement>>()
    internal var failure: Throwable? = null
    private val mutableEvents = Channel<SocketIoEvent>(capacity = 64)
    val events: Channel<SocketIoEvent> get() = mutableEvents
    /** Includes transport termination before the namespace event consumer runs. */
    internal val isConnected: Boolean get() = !connection.isClosed && synchronized(pendingAcks) {
        connected.isCompleted && !connected.isCancelled && failure == null
    }

    suspend fun emit(name: String, payload: JsonElement): JsonElement = connection.sendEvent(this.name, name, payload)
    suspend fun emitWithoutAck(name: String, payload: JsonElement) = connection.sendEventWithoutAck(this.name, name, payload)
    suspend fun close() = connection.unregister(name)

    internal fun fail(error: Throwable) {
        synchronized(pendingAcks) {
            if (failure != null) return
            failure = error
            pendingAcks.values.forEach { it.completeExceptionally(error) }
            pendingAcks.clear()
        }
        connected.completeExceptionally(error)
        mutableEvents.close(error)
    }
}

private fun nowMs(): Long = kotlin.time.Clock.System.now().toEpochMilliseconds()
