package top.roomio.data.party

import top.roomio.data.diagnostics.logHandledException

import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.ensureActive
import top.roomio.domain.party.VoiceConfiguration

internal enum class VoiceRefreshDisposition { STALE, REPLACED, APPLY }

/** Called by the serialized owner before validating or applying a delayed response. */
internal fun voiceRefreshDisposition(
    expected: VoiceConfiguration,
    current: VoiceConfiguration,
    incoming: VoiceConfiguration,
    closed: Boolean,
): VoiceRefreshDisposition {
    // Referential identity also fences a newer resume/credential descriptor
    // whose voice generation (or even all of its values) happens to be equal.
    if (closed || current !== expected) return VoiceRefreshDisposition.STALE
    if (incoming.roomId != expected.roomId || incoming.membershipId != expected.membershipId ||
        incoming.voiceSessionId != expected.voiceSessionId || incoming.namespace != expected.namespace || incoming.mode != expected.mode)
        return VoiceRefreshDisposition.REPLACED
    return VoiceRefreshDisposition.APPLY
}

/** Retry transient failures before the current ten-minute TURN lease expires. */
internal suspend fun refreshVoiceCredentials(active: () -> Boolean, refresh: suspend () -> Unit) {
    var nextDelay = 5 * 60_000L
    while (active()) {
        delay(nextDelay)
        if (!active()) return
        nextDelay = try {
            refresh()
            5 * 60_000L
        } catch (handledError: Throwable) {
            logHandledException("VoiceCredentialRefresh.catch1", handledError)
            // An operation timeout is recoverable; caller cancellation is not.
            currentCoroutineContext().ensureActive()
            30_000L
        }
    }
}
