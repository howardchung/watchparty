package top.roomio.data.party

import top.roomio.data.diagnostics.logHandledException

import com.russhwolf.settings.Settings
import dev.zacsweers.metro.AppScope
import dev.zacsweers.metro.Inject
import dev.zacsweers.metro.SingleIn
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import top.roomio.domain.party.GuestIdentity
import top.roomio.domain.party.GuestSession
import top.roomio.domain.party.PartyException

/** A single secure record atomically stores credentials and their matching identity. */
@SingleIn(AppScope::class)
@Inject
class TokenStore(
    private val settings: Settings,
    private val json: Json,
    private val secureStorage: SecureCredentialStorage,
    private val config: BackendConfig,
) {
    private var loadFailure: Throwable? = null
    private var pendingCredentials: BackendCredentials? = null
    private var credentialsRecord: BackendCredentials? = try { readCredentials() } catch (error: Throwable) {
        logHandledException("TokenStore.catch1", error)
        loadFailure = error
        null
    }
    private val mutableSession = MutableStateFlow(toSession())
    val session: StateFlow<GuestSession?> = mutableSession.asStateFlow()

    init {
        settings.remove("party.firebaseSession.v1")
        settings.remove("party.profile.v2")
    }

    fun current(): GuestSession? { checkStorage(); return toSession() }
    fun credentials(): BackendCredentials? { checkStorage(); return credentialsRecord }

    fun saveCredentials(credentials: BackendCredentials) {
        // Publish only after the durable secure write succeeds.
        try {
            secureStorage.write(json.encodeToString(credentials))
        } catch (error: Throwable) {
            logHandledException("TokenStore.catch2", error)
            pendingCredentials = credentials
            loadFailure = error
            throw error
        }
        credentialsRecord = credentials
        pendingCredentials = null
        loadFailure = null
        mutableSession.value = toSession()
    }

    fun saveIdentity(identity: GuestIdentity) {
        val current = credentials() ?: return
        require(current.identityId == identity.id) { "Profile identity changed" }
        saveCredentials(current.copy(name = identity.name, avatar = identity.avatar, language = identity.language))
    }

    /** Explicit user recovery only; outages and unreadable credentials never call this. */
    fun clear() {
        secureStorage.clear()
        credentialsRecord = null
        pendingCredentials = null
        loadFailure = null
        mutableSession.value = null
    }

    private fun readCredentials(): BackendCredentials? {
        val serialized = secureStorage.read() ?: return null
        val objectValue = try { json.parseToJsonElement(serialized).jsonObject } catch (handledError: Exception) {
            logHandledException("TokenStore.catch3", handledError)
            throw PartyException("INVALID_TOKEN", "Saved guest credentials need explicit reset")
        }
        // The accepted one-time cutover discards only recognizable old provider records.
        if ("projectId" in objectValue && "uid" in objectValue && "idToken" in objectValue) {
            secureStorage.clear()
            return null
        }
        val record = try { json.decodeFromString<BackendCredentials>(serialized) } catch (handledError: Exception) {
            logHandledException("TokenStore.catch4", handledError)
            throw PartyException("INVALID_TOKEN", "Saved guest credentials need explicit reset")
        }
        if (record.version != 1 || record.baseUrl != config.baseUrl.trimEnd('/') ||
            record.identityId.isBlank() || record.accessToken.isBlank() || record.refreshToken.isBlank()) {
            throw PartyException("INVALID_TOKEN", "Saved guest credentials need explicit reset")
        }
        return record
    }

    private fun checkStorage() {
        if (loadFailure == null) return
        if (loadFailure is PartyException) throw loadFailure as PartyException
        try {
            val pending = pendingCredentials
            if (pending != null) saveCredentials(pending)
            else {
                credentialsRecord = readCredentials()
                loadFailure = null
                mutableSession.value = toSession()
            }
        } catch (error: PartyException) {
            logHandledException("TokenStore.catch5", error)
            loadFailure = error
            throw error
        } catch (handledError: Exception) {
            logHandledException("TokenStore.catch6", handledError)
            throw PartyException("NETWORK", "Secure guest storage is temporarily unavailable; retry")
        }
    }

    private fun toSession(): GuestSession? = credentialsRecord?.let {
        GuestSession(GuestIdentity(it.identityId, it.name, it.avatar, it.language), it.accessToken, it.refreshToken)
    }
}

/** Data-layer credential record; never crosses into presentation. */
@Serializable
data class BackendCredentials(
    val identityId: String,
    val accessToken: String,
    val refreshToken: String,
    val expiresAtEpochMs: Long,
    val refreshExpiresAtEpochMs: Long,
    val baseUrl: String,
    val name: String,
    val avatar: String,
    val language: String,
    val version: Int = 1,
)
