package top.roomio.data.party

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlinx.serialization.json.Json
import top.roomio.domain.party.PartyException

class VoiceAcknowledgementTest {
    private fun ack(name: String, body: String) = validateVoiceAcknowledgement(name, Json.parseToJsonElement(body))

    @Test
    fun malformedOrNegativeMuteAcknowledgementsNeverAuthorizeCapture() {
        for (body in listOf("null", "{}", "[]", "true", "{\"ok\":false}", "{\"ok\":\"true\"}", "{\"ok\":null}", "{\"accepted\":true}")) {
            val intent = MicrophoneIntent()
            var capture = false
            val request = intent.request(true) { capture = it }
            val failure = assertFailsWith<PartyException> {
                ack("voice.mute", body)
                intent.authorized(request, true) { capture = it }
            }
            assertEquals("VOICE_INVALID_ACK", failure.code, body)
            assertFalse(capture, body)
        }
    }

    @Test
    fun signalAndLeaveRequireExplicitBooleanSuccess() {
        for (name in listOf("voice.mute", "signal", "voice.leave")) {
            ack(name, "{\"ok\":true}")
            for (body in listOf("null", "{}", "{\"ok\":false}", "{\"ok\":1}", "{\"ok\":\"true\"}"))
                assertEquals("VOICE_INVALID_ACK", assertFailsWith<PartyException> { ack(name, body) }.code)
        }
    }

    @Test
    fun authenticationRefreshUsesItsOwnExpirySchema() {
        ack("auth.refresh", "{\"expiresAt\":\"2026-11-05T15:00:00.000Z\"}")
        for (body in listOf("null", "{}", "{\"ok\":true}", "{\"expiresAt\":42}", "{\"expiresAt\":null}", "{\"expiresAt\":\"\"}", "{\"expiresAt\":\"not-a-date\"}"))
            assertEquals("VOICE_INVALID_ACK", assertFailsWith<PartyException> { ack("auth.refresh", body) }.code)
    }

    @Test
    fun backendErrorCodesTakePrecedenceOverSuccessFields() {
        for (name in listOf("voice.mute", "signal", "voice.leave", "auth.refresh")) {
            val failure = assertFailsWith<PartyException> {
                ack(name, "{\"code\":\"RATE_LIMITED\",\"ok\":true,\"expiresAt\":\"2026-11-05T15:00:00Z\"}")
            }
            assertEquals("RATE_LIMITED", failure.code)
        }
        for (body in listOf("{\"code\":null}", "{\"code\":42}", "{\"code\":\"\"}"))
            assertEquals("VOICE_INVALID_ACK", assertFailsWith<PartyException> { ack("voice.mute", body) }.code)
    }
}
