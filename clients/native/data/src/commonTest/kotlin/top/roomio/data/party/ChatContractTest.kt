package top.roomio.data.party

import com.russhwolf.settings.MapSettings
import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.headersOf
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.*
import top.roomio.data.party.dto.SnapshotDto
import top.roomio.data.party.dto.toDomain
import top.roomio.domain.party.*
import kotlin.test.*

class ChatContractTest {
    private val json = Json { ignoreUnknownKeys = true }
    private val message = """{"id":"id","roomId":"room","identityId":"guest","membershipId":"member","displayName":"Nika","avatar":"comet","text":"سلام 🍿","createdAt":"2026-11-12T06:00:00Z","sequence":8}"""
    private val snapshot = """{"room":{"id":"room","code":"ABCD2345","title":"Movie night","ownerIdentityId":"guest"},"members":[],"stream":{"sessionId":"","revision":0,"state":"EMPTY","url":""},"sequence":8,"chat":{"messages":[$message],"hasMore":true}}"""

    @Test fun unicodeValidationMatchesTheBrowserAndServerLimit() {
        assertEquals("سلام 🍿\nHi", normalizeChatText("  سلام 🍿\r\nHi  "))
        assertTrue(validChatText("🍿".repeat(250)))
        for (text in listOf("", " \n", "🍿".repeat(251), "x\u0000y", "x\u001by", "\uD800", "\uDCFF")) assertFalse(validChatText(text))
        assertTrue(validChatText("<script>plain text</script>"))
    }
    @Test fun snapshotsAndRoomEventsMapChatWithoutChangingStream() {
        val value = json.decodeFromString<SnapshotDto>(snapshot).toDomain()
        assertEquals("سلام 🍿", value.chat.messages.single().text)
        assertTrue(value.chat.hasMore)
        assertEquals(StreamState.EMPTY, value.stream.state)
        val gate = SnapshotEventGate(json)
        val socketSnapshot = SocketIoEvent("snapshot", json.parseToJsonElement(snapshot))
        assertIs<RealtimeEvent.Snapshot>(gate.accept(socketSnapshot).single())
        val next = message.replace("\"sequence\":8", "\"sequence\":9")
        val event = SocketIoEvent("event", json.parseToJsonElement("""{"eventId":"e9","sequence":9,"topic":"chat.message","payload":{"message":$next}}"""))
        assertIs<RealtimeEvent.ChatMessageReceived>(gate.accept(event).single())
        assertTrue(gate.accept(event).isEmpty())
    }
    @Test fun maximumUnicodeBootstrapFitsBoundedSocketFrames() {
        val largeMessage = message.replace("سلام 🍿", "\u0800".repeat(500))
        val page = (1..50).joinToString(",") { largeMessage.replace("\"id\":\"id\"", "\"id\":\"m$it\"") }
        val payload = snapshot.replace(message, page)
        val frame = "42/watchparty/rooms/room,[\"snapshot\",$payload]"
        assertTrue(frame.encodeToByteArray().size > 64 * 1024)
        val packet = parseEnginePackets(frame).single()
        assertEquals(SOCKET_EVENT,parseSocketIoPacket(packet.data).type)
        assertEquals(50,json.decodeFromString<SnapshotDto>(payload).chat.messages.size)
    }

    @Test fun repositoryRetriesUseTheSameUuidAndHistoryUsesExclusiveCursor() = runTest { withContext(Dispatchers.Default) {
        val bodies = mutableListOf<String>()
        var fail = true
        var cursor: String? = null
        val client = HttpClient(MockEngine { request ->
            if (request.method.value == "POST") {
                bodies += (request.body as io.ktor.http.content.TextContent).text
                if (fail) { fail = false; respond("""{"code":"UNAVAILABLE"}""", HttpStatusCode.ServiceUnavailable, headersOf(HttpHeaders.ContentType, "application/json")) }
                else respond("""{"message":$message}""", HttpStatusCode.Created, headersOf(HttpHeaders.ContentType, "application/json"))
            } else {
                cursor = request.url.parameters["before"]
                respond("""{"messages":[$message],"hasMore":false}""", HttpStatusCode.OK, headersOf(HttpHeaders.ContentType, "application/json"))
            }
        }) { install(ContentNegotiation) { json(json) } }
        val sessions = object : SessionRepository {
            override suspend fun currentSession() = GuestSession(GuestIdentity("guest","Nika","comet","en"),"access","refresh")
            override suspend fun ensureSession(name: String, avatar: String, language: String) = currentSession()
            override suspend fun refresh() = currentSession()
            override suspend fun reset() = Unit
            override suspend fun updateProfile(name: String, avatar: String, language: String) = currentSession().identity
        }
        try {
            val repository = KtorRoomRepository(client, BackendConfig("https://backend.test"), sessions, LastRoomStore(MapSettings(),json), top.roomio.data.observability.ProductAnalytics {})
            assertFailsWith<PartyException> { repository.sendChatMessage("room","stable-uuid","سلام 🍿") }
            assertEquals("سلام 🍿", repository.sendChatMessage("room","stable-uuid","سلام 🍿").text)
            assertEquals(bodies[0],bodies[1])
            assertEquals("stable-uuid",json.parseToJsonElement(bodies[0]).jsonObject["messageId"]!!.jsonPrimitive.content)
            assertEquals(8L,repository.chatHistory("room",9).messages.single().sequence)
            assertEquals("9",cursor)
        } finally { client.close() }
    } }
}
