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
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue
import top.roomio.domain.party.GuestIdentity
import top.roomio.domain.party.GuestSession
import top.roomio.domain.party.Room
import top.roomio.domain.party.SessionRepository

class LastRoomRepositoryTest {
    private class Sessions(var identity: String = "guest") : SessionRepository {
        override suspend fun currentSession() = GuestSession(GuestIdentity(identity, "Mira", "COMET", "en"), "access", "refresh")
        override suspend fun ensureSession(name: String, avatar: String, language: String) = currentSession()
        override suspend fun refresh() = currentSession()
        override suspend fun reset() = Unit
        override suspend fun updateProfile(name: String, avatar: String, language: String) = currentSession().identity
    }
    private val json = Json { ignoreUnknownKeys = true }
    private val headers = headersOf(HttpHeaders.ContentType, "application/json")

    @Test
    fun lastAdmissionSurvivesRestartForOwnersAndGuestsAndFailedJoinKeepsIt() = runTest {
        for (identity in listOf("owner", "guest")) {
            val sessions = Sessions(identity)
            val settings = MapSettings()
            var rejected = false
            val client = HttpClient(MockEngine {
                if (rejected) respond("""{"code":"ROOM_FULL"}""", HttpStatusCode.Conflict, headers)
                else respond("""{"room":{"id":"room","code":"ABCD2345","title":"Movie night","ownerIdentityId":"owner","endedAt":null},"membership":{"id":"member","roomId":"room","displayName":"Mira","avatar":"COMET","identityId":"$identity","isOwner":${identity == "owner"}}}""", HttpStatusCode.OK, headers)
            }) { install(ContentNegotiation) { json(json) } }
            val config = BackendConfig("https://backend.test")
            fun repository() = KtorRoomRepository(client, config, sessions, LastRoomStore(settings, json), top.roomio.data.observability.ProductAnalytics {})
            assertNull(repository().lastRoom())
            val room = if (identity == "owner") repository().createRoom("Movie night") else repository().join("ABCD2345")
            assertEquals(room, repository().lastRoom())
            rejected = true
            assertTrue(runCatching { repository().join("OTHER123") }.isFailure)
            assertEquals(room, repository().lastRoom())
            sessions.identity = "new-identity"
            assertNull(repository().lastRoom())
            client.close()
        }
    }

    @Test
    fun transientPreviewKeepsCardButConfirmedUnavailabilityAndLastLeaveClearIt() = runTest {
        val sessions = Sessions()
        val settings = MapSettings()
        val store = LastRoomStore(settings, json)
        val backend = "https://backend.test"
        val room = Room("room", "ABCD2345", "Movie night", "owner", false)
        var status = HttpStatusCode.ServiceUnavailable
        var body = """{"code":"UNAVAILABLE"}"""
        val client = HttpClient(MockEngine { respond(body, status, headers) }) {
            install(ContentNegotiation) { json(json) }
        }
        val repository = KtorRoomRepository(client, BackendConfig(backend), sessions, store, top.roomio.data.observability.ProductAnalytics {})
        store.remember(backend, "guest", room)
        assertTrue(runCatching { repository.preview(room.code) }.isFailure)
        assertEquals(room, repository.lastRoom())
        for (code in listOf("ROOM_NOT_FOUND", "ROOM_ENDED")) {
            store.remember(backend, "guest", room)
            status = HttpStatusCode.NotFound
            body = """{"code":"$code"}"""
            assertTrue(runCatching { repository.preview(room.code) }.isFailure)
            assertNull(repository.lastRoom())
        }
        store.remember(backend, "guest", room)
        status = HttpStatusCode.OK
        body = """{"code":"ABCD2345","title":"Movie night","ownerName":"Nika","ownerPresent":false,"participantCount":0,"availability":"ENDED","streamState":"EMPTY"}"""
        repository.preview(room.code)
        assertNull(repository.lastRoom())
        store.remember(backend, "guest", room)
        body = """{"roomClosed":false}"""
        repository.leave(room.id)
        assertEquals(room, repository.lastRoom())
        body = """{"roomClosed":true}"""
        repository.leave(room.id)
        assertNull(repository.lastRoom())
        client.close()
    }

    @Test
    fun storeScopesByBackendAndOnlyForgetsMatchingRoom() {
        val store = LastRoomStore(MapSettings(), json)
        val room = Room("new", "NEW23456", "New room", "owner", false)
        store.remember("backend", "guest", room)
        assertNull(store.read("other-backend", "guest"))
        assertNull(store.read("backend", "other-guest"))
        store.forget("backend", "guest", "OLD23456")
        assertEquals(room, store.read("backend", "guest"))
    }
}
