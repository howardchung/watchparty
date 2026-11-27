package top.roomio.data.party

import top.roomio.domain.party.VoiceClient

internal actual fun createVoiceClient(
    http: io.ktor.client.HttpClient,
    config: BackendConfig,
    json: kotlinx.serialization.json.Json,
    sessions: top.roomio.domain.party.SessionRepository,
    tokens: TokenStore,
): VoiceClient = DisabledVoiceClient()
