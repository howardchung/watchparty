package top.roomio.data.observability

import co.touchlab.kermit.Severity
import top.roomio.data.party.AppSessionLog
import io.sentry.Hint
import io.sentry.SentryEvent
import io.sentry.protocol.Request
import io.sentry.protocol.User
import io.sentry.protocol.SentryException
import io.sentry.protocol.SentryStackFrame
import io.sentry.protocol.SentryStackTrace
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class ObservabilityPrivacyTest {
    @Test
    fun nativeCallbackRemovesPrivateDataWithoutLosingStackLocations() {
        val options = io.sentry.SentryOptions()
        configureJvmSentryOptions(options, "test")
        run {
            val frame = SentryStackFrame().apply { filename = "App.kt"; lineno = 42 }
            val exception = SentryException().apply {
                type = "IllegalStateException"; value = "Private chat content"
                stacktrace = SentryStackTrace(listOf(frame))
            }
            AppSessionLog.log(Severity.Info,"player.state state=2 positionMs=987654", "Player",null)
            val event = SentryEvent().apply {
                user = User().apply { email = "private@example.test" }
                request = Request().apply { data = "secret" }
                setTag("private", "private")
                addBreadcrumb("private")
                exceptions = listOf(exception)
            }
            val callback = options.beforeSend!!
            val filtered = callback.execute(event, Hint())!!
            assertNull(filtered.tags?.get("private"))
            assertEquals(true, filtered.breadcrumbs.orEmpty().any { it.message?.contains("player.state") == true })
            assertEquals(false, filtered.breadcrumbs.orEmpty().any { it.message?.contains("private") == true || it.message?.contains("987654") == true })
            assertNull(filtered.user)
            assertNull(filtered.request)
            assertEquals("IllegalStateException", filtered.exceptions!![0].value)
            assertEquals(42, filtered.exceptions!![0].stacktrace!!.frames!![0].lineno)
        }
    }
}
