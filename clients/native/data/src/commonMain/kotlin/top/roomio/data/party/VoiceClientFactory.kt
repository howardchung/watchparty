package top.roomio.data.party

import io.ktor.client.HttpClient
import kotlinx.serialization.json.Json
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import top.roomio.domain.party.VoiceClient
import top.roomio.domain.party.VoiceEvent
import top.roomio.domain.party.VoiceSession
import top.roomio.domain.party.VoiceConfiguration

/** Builds the platform voice client. Android provides the peer mesh; other targets remain disabled. */
internal expect fun createVoiceClient(
    http: HttpClient,
    config: BackendConfig,
    json: Json,
    sessions: top.roomio.domain.party.SessionRepository,
    tokens: TokenStore,
): VoiceClient

/**
 * A voice client for platforms without a voice implementation. Joining fails
 * immediately so the UI can show that voice is unavailable.
 */
internal class DisabledVoiceClient : VoiceClient {
    override suspend fun connect(configuration: VoiceConfiguration): VoiceSession = DisabledVoiceSession
}

private object DisabledVoiceSession : VoiceSession {
    override val events: Flow<VoiceEvent> = flowOf(VoiceEvent.Failed("Voice is unavailable on this device"))
    override fun setMicrophoneEnabled(enabled: Boolean) = Unit
    override suspend fun disconnect() = Unit
}
