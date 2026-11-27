package top.roomio.data.party

import top.roomio.data.diagnostics.loggedRunCatching

import dev.zacsweers.metro.AppScope
import dev.zacsweers.metro.Inject
import dev.zacsweers.metro.SingleIn
import io.ktor.client.HttpClient
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import kotlin.time.Instant
import top.roomio.data.party.dto.GuestSessionRequest
import top.roomio.data.party.dto.RefreshRequest
import top.roomio.data.party.dto.SessionDto
import top.roomio.domain.party.PartyException

/** First-party guest credential adapter shared by every native target. */
@SingleIn(AppScope::class)
@Inject
class BackendSessionClient(private val http: HttpClient, private val config: BackendConfig) {
    suspend fun create(name: String, avatar: String, language: String): BackendCredentials =
        http.post("${config.baseUrl.trimEnd('/')}/v1/guest-sessions") {
            contentType(ContentType.Application.Json)
            setBody(GuestSessionRequest(name, avatar, language))
        }.bodyOrThrow<SessionDto>().credentials()

    suspend fun refresh(current: BackendCredentials): BackendCredentials {
        val fresh = http.post("${config.baseUrl.trimEnd('/')}/v1/guest-sessions/refresh") {
            contentType(ContentType.Application.Json)
            setBody(RefreshRequest(current.refreshToken))
        }.bodyOrThrow<SessionDto>().credentials()
        if (fresh.identityId != current.identityId) {
            throw PartyException("INVALID_TOKEN", "Session refresh changed identity")
        }
        return fresh
    }

    private fun SessionDto.credentials(): BackendCredentials {
        val accessExpiry = loggedRunCatching("BackendSessionClient.run1") { Instant.parse(accessExpiresAt).toEpochMilliseconds() }.getOrNull()
        val refreshExpiry = loggedRunCatching("BackendSessionClient.run2") { Instant.parse(refreshExpiresAt).toEpochMilliseconds() }.getOrNull()
        if (identity.id.isBlank() || accessToken.isBlank() || refreshToken.isBlank() ||
            accessExpiry == null || refreshExpiry == null || refreshExpiry < accessExpiry) {
            throw PartyException("INVALID_TOKEN", "The server returned an incomplete guest session")
        }
        return BackendCredentials(identity.id, accessToken, refreshToken, accessExpiry, refreshExpiry,
            config.baseUrl.trimEnd('/'), identity.name, identity.avatar, identity.language)
    }
}
