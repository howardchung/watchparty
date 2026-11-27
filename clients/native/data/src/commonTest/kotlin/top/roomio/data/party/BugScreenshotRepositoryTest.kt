package top.roomio.data.party

import com.russhwolf.settings.MapSettings
import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.TextContent
import io.ktor.http.headersOf
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue
import top.roomio.domain.party.*

class BugScreenshotRepositoryTest {
    @Test fun retryFreezesImagesAndLogWhileImageChangesCreateNewPayload() = runTest { withContext(Dispatchers.Default) {
        val paths = mutableListOf<String>()
        val payloads = mutableListOf<String>()
        var success = false
        val json = Json { ignoreUnknownKeys = true }
        val client = HttpClient(MockEngine { request ->
            paths.add(request.url.encodedPath)
            payloads.add((request.body as TextContent).text)
            respond(if (success) "{}" else """{"code":"UNAVAILABLE"}""", if (success) HttpStatusCode.Created else HttpStatusCode.ServiceUnavailable, headersOf(HttpHeaders.ContentType, "application/json"))
        }) { install(ContentNegotiation) { json(json) } }
        val sessions = object : SessionRepository {
            override suspend fun currentSession(): GuestSession? = null
            override suspend fun ensureSession(name: String, avatar: String, language: String): GuestSession = error("unused")
            override suspend fun refresh(): GuestSession = error("unused")
            override suspend fun reset() = Unit
            override suspend fun updateProfile(name: String, avatar: String, language: String): GuestIdentity = error("unused")
        }
        val repository = KtorRoomRepository(client, BackendConfig("https://backend.test"), sessions, LastRoomStore(MapSettings(), json), top.roomio.data.observability.ProductAnalytics {})
        val image = ReportScreenshot("image/png", "aGVsbG8=")
        try {
            assertTrue(runCatching { repository.reportBug("room", "Broken playback", listOf(image)) }.isFailure)
            assertTrue(runCatching { repository.reportBug("room", "Broken playback", listOf(image)) }.isFailure)
            assertEquals(payloads[0], payloads[1])
            assertTrue(payloads[0].contains(image.data))
            success = true
            repository.reportBug("room", "Broken playback", emptyList())
            fun id(payload: String) = json.parseToJsonElement(payload).jsonObject.getValue("reportId").jsonPrimitive.content
            assertNotEquals(id(payloads[0]), id(payloads[2]))
            repository.reportBug("room", "Broken playback", listOf(image))
            assertNotEquals(id(payloads[0]), id(payloads[3]))
            repository.reportBug(null, "Home screen bug", emptyList())
            assertEquals("/v1/bug-reports", paths.last())
            assertEquals("/v1/rooms/room/bug-reports", paths.first())
        } finally { client.close() }
    } }
}
