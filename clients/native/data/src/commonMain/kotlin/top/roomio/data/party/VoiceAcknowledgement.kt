package top.roomio.data.party

import top.roomio.data.diagnostics.loggedRunCatching

import kotlin.time.Instant
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import top.roomio.domain.party.PartyException

/** A microphone can be enabled only by an explicit successful voice acknowledgement. */
internal fun validateVoiceAcknowledgement(name: String, response: JsonElement): JsonObject {
    val body = response as? JsonObject ?: invalidVoiceAcknowledgement()
    val code = body["code"]
    if (code != null) {
        val value = (code as? JsonPrimitive)?.takeIf { it.isString }?.content
            ?.takeIf { it.isNotBlank() } ?: invalidVoiceAcknowledgement()
        throw PartyException(value, "Voice request rejected")
    }
    when (name) {
        "voice.mute", "signal", "voice.leave" -> {
            val ok = body["ok"] as? JsonPrimitive
            if (ok == null || ok.isString || ok.booleanOrNull != true) invalidVoiceAcknowledgement()
        }
        "auth.refresh" -> {
            val expires = (body["expiresAt"] as? JsonPrimitive)?.takeIf { it.isString }?.content
                ?: invalidVoiceAcknowledgement()
            if (loggedRunCatching("VoiceAcknowledgement.run1") { Instant.parse(expires) }.isFailure) invalidVoiceAcknowledgement()
        }
        else -> invalidVoiceAcknowledgement()
    }
    return body
}

private fun invalidVoiceAcknowledgement(): Nothing =
    throw PartyException("VOICE_INVALID_ACK", "Invalid voice acknowledgement")
