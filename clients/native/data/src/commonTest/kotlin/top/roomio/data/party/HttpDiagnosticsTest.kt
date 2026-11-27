package top.roomio.data.party

import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.request.header
import io.ktor.http.HttpStatusCode
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class HttpDiagnosticsTest {
    private val config = BackendConfig("https://diagnostics.test")

    @Test fun retainsTimingAndStatusWithoutHeadersBodiesUrlsOrQueryValues() = runTest {
        AppSessionLog.install()
        val before = AppSessionLog.snapshot().length
        val client = HttpClient(MockEngine { respond("response-private-marker", HttpStatusCode.ServiceUnavailable) }) {
            install(httpDiagnosticsPlugin(config))
        }
        try {
            client.post("${config.baseUrl}/v1/rooms/room-private-marker/chat/messages?before=cursor-private-marker") {
                header("Authorization", "Bearer header-private-marker")
                setBody("body-private-marker")
            }
            val captured = AppSessionLog.snapshot().substring(before)
            assertTrue(captured.contains("\"http.start\""))
            assertTrue(captured.contains("/v1/rooms/[room]/chat/messages"))
            assertTrue(captured.contains("\"status\":503"))
            for (secret in listOf("diagnostics.test", "room-private-marker", "cursor-private-marker", "header-private-marker", "body-private-marker", "response-private-marker")) assertFalse(captured.contains(secret), secret)
        } finally { client.close() }
    }

    @Test fun logsRedactedTransportFailuresAndPreservesCancellation() = runTest {
        AppSessionLog.install()
        for (failure in listOf(IllegalStateException("Transport failed ticket=exception-private-marker"), CancellationException("Cancelled token=cancel-private-marker"))) {
            val before = AppSessionLog.snapshot().length
            val client = HttpClient(MockEngine { throw failure }) { install(httpDiagnosticsPlugin(config)) }
            try {
                val thrown = runCatching { client.get("${config.baseUrl}/v1/guest-sessions/refresh") }.exceptionOrNull()
                assertTrue(thrown != null)
                if (failure is CancellationException) assertTrue(thrown is CancellationException)
                val captured = AppSessionLog.snapshot().substring(before)
                assertTrue(captured.contains(if (failure is CancellationException) "http.cancelled" else "http.failure"))
                assertTrue(captured.contains("exception.handled"))
                assertFalse(captured.contains("private-marker"))
            } finally { client.close() }
        }
    }

    @Test fun ignoresMediaOriginsAndUnknownRouteDetails() = runTest {
        assertEquals("[other]", diagnosticRoute("/v1/unknown/private-value?token=secret"))
        assertEquals("/v1/rooms/[room]/preview", diagnosticRoute("/v1/rooms/INVITE/preview"))
        AppSessionLog.install()
        val before = AppSessionLog.snapshot()
        val client = HttpClient(MockEngine { respond("ok") }) { install(httpDiagnosticsPlugin(config)) }
        try {
            client.get("https://media.test/private-movie")
            assertEquals(before, AppSessionLog.snapshot())
        } finally { client.close() }
    }
}
