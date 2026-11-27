package top.roomio.data.party

import top.roomio.data.diagnostics.logHandledException

import dev.zacsweers.metro.AppScope
import dev.zacsweers.metro.Binds
import dev.zacsweers.metro.BindingContainer
import dev.zacsweers.metro.Provides
import dev.zacsweers.metro.SingleIn
import io.ktor.client.HttpClient
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.api.createClientPlugin
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.plugins.websocket.WebSockets
import io.ktor.client.request.accept
import io.ktor.http.URLBuilder
import io.ktor.http.Url
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import top.roomio.domain.party.RealtimeClient
import top.roomio.domain.party.RoomRepository
import top.roomio.domain.party.SessionKeeper
import top.roomio.domain.party.SessionRepository
import top.roomio.domain.party.VoiceClient
import top.roomio.domain.party.VoiceCoordinator
import top.roomio.domain.party.DefaultVoiceCoordinator
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.Dispatchers

@BindingContainer
interface PartyDataBindings {
    @Binds
    fun bindProductAnalytics(impl: top.roomio.data.observability.AppObservability): top.roomio.data.observability.ProductAnalytics
    @Binds
    fun bindSessionRepository(impl: KtorSessionRepository): SessionRepository

    @Binds
    fun bindRoomRepository(impl: KtorRoomRepository): RoomRepository

    @Binds
    fun bindRealtimeClient(impl: KtorRealtimeClient): RealtimeClient

    companion object {
        /** The deployed backend. Override here to point at another environment. */
        const val DEFAULT_BASE_URL = "https://watchparty.top"

        @Provides
        @SingleIn(AppScope::class)
        fun provideSecureCredentialStorage(): SecureCredentialStorage = createSecureCredentialStorage()

        @Provides
        @SingleIn(AppScope::class)
        fun provideBackendConfig(): BackendConfig {
            val overrides = platformBackendOverrides()
            return BackendConfig(
                baseUrl = overrides.backendUrl ?: DEFAULT_BASE_URL,
            )
        }

        @Provides
        @SingleIn(AppScope::class)
        fun provideVoiceClient(
            http: HttpClient,
            config: BackendConfig,
            json: Json,
            sessions: SessionRepository,
            tokens: TokenStore,
        ): VoiceClient = createVoiceClient(http, config, json, sessions, tokens)

        @Provides
        @SingleIn(AppScope::class)
        fun provideSessionKeeper(roomRepository: RoomRepository): SessionKeeper = createSessionKeeper(roomRepository)

        @Provides
        @SingleIn(AppScope::class)
        fun provideVoiceCoordinator(rooms: RoomRepository, voice: VoiceClient, keeper: SessionKeeper): VoiceCoordinator =
            DefaultVoiceCoordinator(rooms, voice, keeper, CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate), ::logHandledException)

        @Provides
        @SingleIn(AppScope::class)
        fun provideJson(): Json = Json {
            ignoreUnknownKeys = true
            explicitNulls = false
        }

        @Provides
        @SingleIn(AppScope::class)
        fun provideHttpClient(tokens: TokenStore, json: Json, config: BackendConfig): HttpClient = HttpClient {
            expectSuccess = false
            install(ContentNegotiation) { json(json) }
            install(WebSockets)
            install(httpDiagnosticsPlugin(config))
            install(backendAuthorizationPlugin(tokens, config))
            defaultRequest {
                accept(ContentType.Application.Json)
            }
        }

    }
}

/** Applies credentials after Ktor has resolved each request's final URL. */
internal fun backendAuthorizationPlugin(tokens: TokenStore, config: BackendConfig) =
    createClientPlugin("BackendAuthorization") {

        onRequest { request, _ ->
            val requestUrl = request.url.build()
            val path = requestUrl.encodedPath
            val isRealtimeHandshake = path.endsWith("/socket.io/") || path.endsWith("/socket.io")
            val isSessionExchange = path == "/v1/guest-sessions" || path == "/v1/guest-sessions/refresh"
            val isBackendRequest = !isRealtimeHandshake && !isSessionExchange && hasBackendOrigin(requestUrl, config.baseUrl)
            if (isBackendRequest) {
                tokens.credentials()?.let { credentials ->
                    request.headers[HttpHeaders.Authorization] = "Bearer ${credentials.accessToken}"
                }
            } else {
                request.headers.remove(HttpHeaders.Authorization)
            }

        }
    }

internal fun hasBackendOrigin(request: Url, baseUrl: String): Boolean {
    val backend = URLBuilder(baseUrl).build()
    return request.host.equals(backend.host, ignoreCase = true) &&
        request.port == backend.port && request.protocol == backend.protocol
}
