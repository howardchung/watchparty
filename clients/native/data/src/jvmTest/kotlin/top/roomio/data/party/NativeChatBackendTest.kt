package top.roomio.data.party

import com.russhwolf.settings.MapSettings
import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.websocket.WebSockets
import io.ktor.serialization.kotlinx.json.json
import java.util.UUID
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.collect
import kotlinx.serialization.json.Json
import org.junit.Assume
import top.roomio.domain.party.*
import kotlin.test.*

/** Opt-in against an isolated local Node/PostgreSQL runtime, never the public service. */
class NativeChatBackendTest {
    private data class Client(val http: HttpClient, val rooms: KtorRoomRepository, val realtime: KtorRealtimeClient)
    private suspend fun client(base: String, name: String): Client {
        val config = BackendConfig(base)
        val json = Json { ignoreUnknownKeys = true }
        val tokens = TokenStore(MapSettings(),json,MemorySecureCredentialStorage(),config)
        val http = HttpClient(OkHttp) {
            install(ContentNegotiation) { json(json) }
            install(WebSockets)
            install(backendAuthorizationPlugin(tokens,config))
        }
        val sessions = KtorSessionRepository(http,config,BackendSessionClient(http,config),tokens)
        sessions.ensureSession(name,"comet","en")
        return Client(http,KtorRoomRepository(http,config,sessions,LastRoomStore(MapSettings(),json), top.roomio.data.observability.ProductAnalytics {}),KtorRealtimeClient(http,config,json,sessions,tokens))
    }
    @Test fun nativeHttpAndSocketIoUseTheRealChatContract() = runBlocking {
        val base = System.getenv("CHAT_BACKEND_URL")
        Assume.assumeTrue("Set CHAT_BACKEND_URL to an isolated local runtime", base != null)
        require(base!!.startsWith("http://127.0.0.1:"))
        val owner = client(base,"Native owner")
        val guest = client(base,"Native guest")
        var room: Room? = null
        var session: RealtimeSession? = null
        var collector: Job? = null
        try {
            val created = owner.rooms.createRoom("Native chat acceptance")
            room = created
            guest.rooms.join(created.code)
            val connection = guest.realtime.connect(created.id)
            session = connection
            val events = Channel<RealtimeEvent>(Channel.UNLIMITED)
            collector = launch { connection.events.collect { events.send(it) } }
            withTimeout(10000) { while (events.receive() !is RealtimeEvent.Snapshot) Unit }
            val id=UUID.randomUUID().toString()
            val sent=owner.rooms.sendChatMessage(created.id,id,"سلام from native 🍿")
            val received=withTimeout(10000) {
                var result: ChatMessage? = null
                while (result == null) { val event=events.receive(); if (event is RealtimeEvent.ChatMessageReceived) result=event.message }
                result
            }
            assertEquals(sent,received)
            assertEquals(sent,owner.rooms.sendChatMessage(created.id,id,"سلام from native 🍿"))
            assertEquals(listOf(sent),guest.rooms.chatHistory(created.id).messages)
            assertEquals(listOf(sent),guest.rooms.snapshot(created.id).chat.messages)
            guest.rooms.sendChatMessage(created.id,UUID.randomUUID().toString(),"Reply from the shared native repository")
            assertEquals(2,owner.rooms.chatHistory(created.id).messages.size)
        } finally {
            session?.close();collector?.cancelAndJoin()
            room?.let { runCatching { guest.rooms.leave(it.id) };runCatching { owner.rooms.leave(it.id) } }
            owner.http.close();guest.http.close()
        }
    }
}
