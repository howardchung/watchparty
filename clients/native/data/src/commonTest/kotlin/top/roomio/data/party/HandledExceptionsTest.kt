package top.roomio.data.party

import kotlinx.coroutines.CancellationException
import top.roomio.data.diagnostics.loggedRunCatching
import top.roomio.domain.diagnostics.handledExceptionDetails
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertSame
import kotlin.test.assertTrue

class HandledExceptionsTest {
    @Test fun redactsMessagesAndCausesWhileRetainingTheOriginalFailureAndStack() {
        AppSessionLog.install()
        val error = IllegalStateException("Peer setup failed ticket=secret-ticket", IllegalArgumentException("Bad configuration https://private.example/movie"))
        val before = AppSessionLog.snapshot().length
        val result = loggedRunCatching("test.voice.setup") { throw error }
        assertSame(error, result.exceptionOrNull())
        val saved = AppSessionLog.snapshot().substring(before)
        for (expected in listOf("voice", "IllegalStateException", "IllegalArgumentException")) assertTrue(saved.contains(expected), expected)
        for (secret in listOf("Peer setup failed", "Bad configuration", "secret-ticket", "private.example")) assertFalse(saved.contains(secret), secret)
    }

    @Test fun preservesSuccessAndCancellationResultSemantics() {
        assertEquals(42, loggedRunCatching("test.success") { 42 }.getOrThrow())
        val cancelled = CancellationException("Cancelled token=private-token")
        assertSame(cancelled, loggedRunCatching("test.cancel") { throw cancelled }.exceptionOrNull())
        assertFalse(handledExceptionDetails("test.cancel", cancelled).contains("private-token"))
    }
}
