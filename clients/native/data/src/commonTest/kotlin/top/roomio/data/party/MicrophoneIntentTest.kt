package top.roomio.data.party

import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class MicrophoneIntentTest {
    @Test fun delayedUnmuteAcknowledgementCannotOverrideNewMute() {
        val intent = MicrophoneIntent()
        var capture = false
        val unmute = intent.request(true) { capture = it }
        assertFalse(capture)
        intent.request(false) { capture = it }
        intent.authorized(unmute, true) { capture = it }
        assertFalse(capture)
    }

    @Test fun reconnectReplaysIntentOnlyAfterAuthorization() {
        val intent = MicrophoneIntent()
        var capture = false
        val request = intent.request(true) { capture = it }
        intent.authorized(request, true) { capture = it }
        assertTrue(capture)
        intent.suspendCapture { capture = it }
        assertFalse(capture)
        intent.authorized(intent.latest(), false) { capture = it }
        assertFalse(capture)
        intent.authorized(intent.latest(), true) { capture = it }
        assertTrue(capture)
    }
}
