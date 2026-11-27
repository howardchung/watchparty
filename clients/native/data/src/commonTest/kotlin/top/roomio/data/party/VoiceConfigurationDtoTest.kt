package top.roomio.data.party

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import top.roomio.data.party.dto.VoiceConfigurationDto
import top.roomio.data.party.dto.VoiceConfigurationRequest
import top.roomio.data.party.dto.toDomain
import top.roomio.domain.party.IceServer
import top.roomio.domain.party.VoiceConfiguration

class VoiceConfigurationDtoTest {
    private val json = Json { ignoreUnknownKeys = false }

    @Test
    fun meshConfigurationMatchesBackendContractAndMapsCredentials() {
        val response = json.decodeFromString<VoiceConfigurationDto>(
            """{"mode":"MESH","roomId":"room-1","membershipId":"member-1","voiceSessionId":"generation-1","namespace":"/watchparty/voice/room-1","ticket":"single-use","iceServers":[{"urls":["stun:turn.test:3478"]},{"urls":["turn:turn.test:3478?transport=udp"],"username":"expires:member","credential":"temporary"}],"iceExpiresAt":"2026-10-09T10:00:00Z"}""",
        )

        assertEquals(
            VoiceConfiguration(
                mode = "MESH",
                roomId = "room-1",
                membershipId = "member-1",
                voiceSessionId = "generation-1",
                namespace = "/watchparty/voice/room-1",
                ticket = "single-use",
                iceServers = listOf(
                    IceServer(listOf("stun:turn.test:3478")),
                    IceServer(listOf("turn:turn.test:3478?transport=udp"), "expires:member", "temporary"),
                ),
                iceExpiresAt = "2026-10-09T10:00:00Z",
            ),
            response.toDomain(),
        )
    }

    @Test
    fun credentialRefreshSendsTheExistingVoiceGeneration() {
        assertEquals(
            """{"voiceSessionId":"generation-1","operation":"refresh"}""",
            json.encodeToString(VoiceConfigurationRequest("generation-1", "refresh")),
        )
    }
}
