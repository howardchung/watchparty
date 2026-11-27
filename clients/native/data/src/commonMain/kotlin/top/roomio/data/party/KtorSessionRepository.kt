package top.roomio.data.party

import top.roomio.data.diagnostics.logHandledException

import co.touchlab.kermit.Logger
import dev.zacsweers.metro.AppScope
import dev.zacsweers.metro.Inject
import dev.zacsweers.metro.SingleIn
import io.ktor.client.HttpClient
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlin.time.Clock
import top.roomio.data.party.dto.GuestSessionRequest
import top.roomio.data.party.dto.ProfileResponseDto
import top.roomio.data.party.dto.toDomain
import top.roomio.domain.party.GuestIdentity
import top.roomio.domain.party.GuestSession
import top.roomio.domain.party.PARTY_CODE_NETWORK
import top.roomio.domain.party.PartyException
import top.roomio.domain.party.SessionRepository

@SingleIn(AppScope::class)
@Inject
class KtorSessionRepository(
    private val http: HttpClient,
    private val config: BackendConfig,
    private val auth: BackendSessionClient,
    private val tokens: TokenStore,
) : SessionRepository {
    private val log = Logger.withTag("Auth")
    private val sessionMutex = Mutex()

    override suspend fun ensureSession(name: String, avatar: String, language: String): GuestSession = normalized {
        sessionMutex.withLock {
            val current = tokens.credentials()
            if (current == null) {
                log.i("auth.create requested")
                tokens.saveCredentials(auth.create(name, avatar, language))
            } else {
                refreshIfNeeded(current)
                val identity = tokens.current()!!.identity
                if (identity.name != name || !identity.avatar.equals(avatar, ignoreCase = true) || identity.language != language) {
                    updateProfileLocked(name, avatar, language)
                }
            }
            tokens.current() ?: throw PartyException("INVALID_TOKEN", "Guest session was not saved")
        }
    }

    override suspend fun currentSession(): GuestSession? = tokens.current()

    override suspend fun refresh(): GuestSession? = normalized {
        sessionMutex.withLock {
            val credentials = tokens.credentials() ?: return@withLock null
            log.i("auth.refresh requested")
            tokens.saveCredentials(auth.refresh(credentials))
            log.i("auth.refresh accepted")
            tokens.current()
        }
    }

    override suspend fun reset() = normalized {
        sessionMutex.withLock {
            // Expired/revoked credentials still permit an explicit local recovery.
            // Successful remote revocation also disconnects any existing room roles.
            try {
                if (tokens.credentials() != null) {
                    try {
                        refreshIfNeeded(tokens.credentials()!!)
                        http.post("${config.baseUrl.trimEnd('/')}/v1/guest-sessions/revoke").let {
                            if (it.status.value != 204) throw it.toPartyException()
                        }
                    } catch (error: PartyException) {
                        logHandledException("KtorSessionRepository.catch1", error)
                        if (error.code !in setOf("SESSION_REVOKED", "SESSION_EXPIRED", "INVALID_TOKEN", "UNAUTHENTICATED")) throw error
                    }
                }
            } catch (error: PartyException) {
                logHandledException("KtorSessionRepository.catch2", error)
                if (error.code != "INVALID_TOKEN") throw error
            }
            tokens.clear()
            log.i("auth.reset completed")
        }
    }

    override suspend fun updateProfile(name: String, avatar: String, language: String): GuestIdentity = normalized {
        sessionMutex.withLock { updateProfileLocked(name, avatar, language) }
    }

    private suspend fun updateProfileLocked(name: String, avatar: String, language: String): GuestIdentity {
        val current = tokens.credentials() ?: throw PartyException("INVALID_TOKEN", "Guest identity is not initialized")
        refreshIfNeeded(current)
        val identity = try {
            patchProfile(name, avatar, language)
        } catch (error: PartyException) {
            logHandledException("KtorSessionRepository.catch3", error)
            if (!error.isAuthFailure()) throw error
            tokens.saveCredentials(auth.refresh(tokens.credentials()!!))
            patchProfile(name, avatar, language)
        }
        tokens.saveIdentity(identity)
        log.i("auth.profile updated")
        return identity
    }

    private suspend fun patchProfile(name: String, avatar: String, language: String): GuestIdentity = http.patch(
        "${config.baseUrl.trimEnd('/')}/v1/guest-sessions/profile",
    ) {
        contentType(ContentType.Application.Json)
        setBody(GuestSessionRequest(name, avatar, language))
    }.bodyOrThrow<ProfileResponseDto>().identity.toDomain()

    private suspend fun refreshIfNeeded(current: BackendCredentials) {
        if (current.expiresAtEpochMs - Clock.System.now().toEpochMilliseconds() <= REFRESH_EARLY_MS) {
            log.i("auth.refresh expiring credential")
            tokens.saveCredentials(auth.refresh(current))
        }
    }

    private suspend fun <T> normalized(block: suspend () -> T): T = try { block() }
    catch (cancellation: CancellationException) { logHandledException("KtorSessionRepository.catch4", cancellation);  throw cancellation }
    catch (error: PartyException) { logHandledException("KtorSessionRepository.catch5", error);  log.w("auth.failure code=${error.code}"); throw error }
    catch (handledError: Throwable) { logHandledException("KtorSessionRepository.catch6", handledError);  log.w("auth.failure code=NETWORK"); throw PartyException(PARTY_CODE_NETWORK, "Guest session request failed; please retry") }

    private companion object { const val REFRESH_EARLY_MS = 60 * 1000L }
}
