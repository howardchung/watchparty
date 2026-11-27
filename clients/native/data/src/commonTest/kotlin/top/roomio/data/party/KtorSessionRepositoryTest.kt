package top.roomio.data.party

import com.russhwolf.settings.MapSettings
import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.TextContent
import io.ktor.http.headersOf
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue
import top.roomio.domain.party.GuestIdentity
import top.roomio.domain.party.PartyException

class KtorSessionRepositoryTest {
    private val json = Json { ignoreUnknownKeys = true; explicitNulls = false }
    private val responseHeaders = headersOf(HttpHeaders.ContentType, "application/json")
    private val config = BackendConfig("http://backend.test:8081")

    @Test
    fun secureRecordIsAtomicAndSurvivesRestartWithoutSecretsInPreferences() {
        val settings = MapSettings()
        val secure = MemorySecureCredentialStorage()
        val tokens = store(settings, secure)
        tokens.saveCredentials(fixtureCredentials())
        assertTrue(settings.keys.none { settings.getStringOrNull(it).orEmpty().contains("refresh-secret") })
        assertEquals(tokens.current(), store(settings, secure).current())
        tokens.clear()
        assertNull(secure.read())
        assertNull(tokens.credentials())
    }

    @Test
    fun recognizedOldCredentialsAreDiscardedButCorruptionFailsClosed() {
        val secure = MemorySecureCredentialStorage()
        secure.write("""{"uid":"old","projectId":"old-project","idToken":"old-token"}""")
        assertNull(store(secure = secure).credentials())
        assertNull(secure.read())
        secure.write("{broken")
        val corrupt = store(secure = secure)
        assertEquals("INVALID_TOKEN", (runCatching { corrupt.credentials() }.exceptionOrNull() as PartyException).code)
        assertEquals("{broken", secure.read())
        corrupt.clear()
        assertNull(corrupt.credentials())
    }

    @Test
    fun backendOriginMismatchRetainsCredentialsForExplicitRecovery() {
        val secure = MemorySecureCredentialStorage()
        store(secure = secure).saveCredentials(fixtureCredentials())
        val other = TokenStore(MapSettings(), json, secure, BackendConfig("https://another.test"))
        assertEquals("INVALID_TOKEN", (runCatching { other.credentials() }.exceptionOrNull() as PartyException).code)
        assertTrue(secure.read()!!.contains("refresh-secret"))
    }

    @Test
    fun simultaneousFirstUseCreatesOneIdentityAndUsesBackendOnly() = runTest {
        val tokens = store()
        var creates = 0
        val client = http(MockEngine { request ->
            assertEquals("backend.test", request.url.host)
            assertEquals("/v1/guest-sessions", request.url.encodedPath)
            creates++
            assertTrue((request.body as TextContent).text.contains("Nika"))
            respond(sessionJson(), HttpStatusCode.Created, responseHeaders)
        }, tokens)
        val repository = repository(client, tokens)
        val sessions = List(8) { async { repository.ensureSession("Nika", "COMET", "en") } }.awaitAll()
        assertEquals(1, creates)
        assertTrue(sessions.all { it.identity.id == "identity-1" })
        client.close()
    }

    @Test
    fun simultaneousExpiredEnsureRefreshesOnceAndKeepsSameIdentity() = runTest {
        val tokens = store().apply { saveCredentials(fixtureCredentials().copy(expiresAtEpochMs = 0)) }
        var refreshes = 0
        val client = http(MockEngine { request ->
            assertEquals("/v1/guest-sessions/refresh", request.url.encodedPath)
            assertNull(request.headers[HttpHeaders.Authorization])
            assertEquals("""{"refreshToken":"refresh-secret"}""", (request.body as TextContent).text)
            refreshes++
            respond(sessionJson("fresh-access"), HttpStatusCode.OK, responseHeaders)
        }, tokens)
        val repository = repository(client, tokens)
        List(8) { async { repository.ensureSession("Nika", "COMET", "en") } }.awaitAll()
        assertEquals(1, refreshes)
        assertEquals("identity-1", tokens.current()!!.identity.id)
        assertEquals("fresh-access", tokens.current()!!.accessToken)
        client.close()
    }

    @Test
    fun outageAndRevocationKeepIdentityAndNeverCreateReplacement() = runTest {
        for ((status, code) in listOf(HttpStatusCode.ServiceUnavailable to "AUTH_UNAVAILABLE", HttpStatusCode.Unauthorized to "SESSION_REVOKED")) {
            val tokens = store().apply { saveCredentials(fixtureCredentials().copy(expiresAtEpochMs = 0)) }
            var calls = 0
            val client = http(MockEngine { request ->
                assertEquals("/v1/guest-sessions/refresh", request.url.encodedPath)
                calls++
                respond("""{"code":"$code"}""", status, responseHeaders)
            }, tokens)
            val repository = repository(client, tokens)
            repeat(2) {
                val error = runCatching { repository.ensureSession("Nika", "COMET", "en") }.exceptionOrNull() as PartyException
                assertEquals(if (code == "AUTH_UNAVAILABLE") "NETWORK" else code, error.code)
            }
            assertEquals(2, calls)
            assertEquals("identity-1", tokens.credentials()!!.identityId)
            assertEquals("refresh-secret", tokens.credentials()!!.refreshToken)
            client.close()
        }
    }

    @Test
    fun refreshCannotReplaceIdentityAndSavedProfileUsesSameRecord() = runTest {
        val tokens = store().apply { saveCredentials(fixtureCredentials()) }
        val client = http(MockEngine {
            respond(sessionJson().replace("identity-1", "identity-attacker"), HttpStatusCode.OK, responseHeaders)
        }, tokens)
        assertEquals("INVALID_TOKEN", (runCatching { repository(client, tokens).refresh() }.exceptionOrNull() as PartyException).code)
        assertEquals("identity-1", tokens.credentials()!!.identityId)
        tokens.saveIdentity(GuestIdentity("identity-1", "Arman", "MOON", "fa"))
        assertEquals("Arman", tokens.current()!!.identity.name)
        client.close()
    }

    @Test
    fun bearerNeverGoesToOtherOriginsSocketHandshakeOrSessionExchanges() = runTest {
        val tokens = store().apply { saveCredentials(fixtureCredentials()) }
        val seen = mutableListOf<String?>()
        val client = http(MockEngine { request ->
            seen += request.headers[HttpHeaders.Authorization]
            respond("{}", HttpStatusCode.OK, responseHeaders)
        }, tokens)
        for (url in listOf("${config.baseUrl}/v1/probe", "https://attacker.test/v1/probe", "${config.baseUrl}/socket.io/", "${config.baseUrl}/v1/guest-sessions", "${config.baseUrl}/v1/guest-sessions/refresh")) {
            client.get(url) { header(HttpHeaders.Authorization, "Bearer injected") }
        }
        assertEquals(listOf("Bearer access-secret", null, null, null, null), seen)
        client.close()
    }

    @Test
    fun secureWriteFailureDoesNotPublishOrCreateAgain() = runTest {
        val secure = object : SecureCredentialStorage {
            override fun read(): String? = null
            override fun write(value: String) { error("secure storage unavailable") }
            override fun clear() = Unit
        }
        val tokens = store(secure = secure)
        var creates = 0
        val client = http(MockEngine { creates++; respond(sessionJson(), HttpStatusCode.Created, responseHeaders) }, tokens)
        val repository = repository(client, tokens)
        repeat(2) { assertTrue(runCatching { repository.ensureSession("Nika", "COMET", "en") }.isFailure) }
        assertEquals(1, creates)
        assertNull(tokens.session.value)
        client.close()
    }

    @Test
    fun transientStorageReadRetriesSameSavedIdentity() {
        val durable = MemorySecureCredentialStorage()
        store(secure = durable).saveCredentials(fixtureCredentials())
        var firstRead = true
        val flaky = object : SecureCredentialStorage {
            override fun read(): String? {
                if (firstRead) { firstRead = false; error("temporarily locked") }
                return durable.read()
            }
            override fun write(value: String) = durable.write(value)
            override fun clear() = durable.clear()
        }
        val tokens = store(secure = flaky)
        assertEquals("identity-1", tokens.current()!!.identity.id)
        assertEquals("refresh-secret", tokens.credentials()!!.refreshToken)
    }

    @Test
    fun platformReportedCorruptionRemainsPermanentAndResetDoesNotCreate() = runTest {
        var cleared = false
        val secure = object : SecureCredentialStorage {
            override fun read(): String? {
                if (cleared) return null
                throw PartyException("INVALID_TOKEN", "Encrypted credential is corrupt")
            }
            override fun write(value: String) { error("No credential write expected") }
            override fun clear() { cleared = true }
        }
        val tokens = store(secure = secure)
        val client = http(MockEngine { error("Corrupt local identity must not create or refresh remotely") }, tokens)
        val repository = repository(client, tokens)
        assertEquals("INVALID_TOKEN", (runCatching { repository.ensureSession("Nika", "COMET", "en") }.exceptionOrNull() as PartyException).code)
        repository.reset()
        assertTrue(cleared)
        assertNull(tokens.current())
        client.close()
    }

    @Test
    fun explicitResetRecoversUnreadableCredentialsWithoutNewAccount() = runTest {
        val secure = MemorySecureCredentialStorage().apply { write("unreadable") }
        val tokens = store(secure = secure)
        val client = http(MockEngine { error("Reset of unreadable local credentials needs no network") }, tokens)
        repository(client, tokens).reset()
        assertNull(tokens.credentials())
        client.close()
    }

    private fun store(settings: MapSettings = MapSettings(), secure: SecureCredentialStorage = MemorySecureCredentialStorage()) = TokenStore(settings, json, secure, config)
    private fun fixtureCredentials() = BackendCredentials("identity-1", "access-secret", "refresh-secret", Long.MAX_VALUE, Long.MAX_VALUE, config.baseUrl, "Nika", "COMET", "en")
    private fun http(engine: MockEngine, tokens: TokenStore) = HttpClient(engine) {
        expectSuccess = false
        install(ContentNegotiation) { json(json) }
        install(backendAuthorizationPlugin(tokens, config))
    }
    private fun repository(http: HttpClient, tokens: TokenStore) = KtorSessionRepository(http, config, BackendSessionClient(http, config), tokens)
    private fun sessionJson(access: String = "access-secret") = """{"identity":{"id":"identity-1","name":"Nika","avatar":"COMET","language":"en"},"accessToken":"$access","accessExpiresAt":"2099-01-01T00:00:00.000Z","refreshToken":"refresh-secret","refreshExpiresAt":"2099-06-01T00:00:00.000Z"}"""
}
