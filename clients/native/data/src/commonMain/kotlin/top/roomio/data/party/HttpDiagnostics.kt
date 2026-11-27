package top.roomio.data.party

import top.roomio.data.diagnostics.logHandledException

import co.touchlab.kermit.Logger
import io.ktor.client.plugins.api.Send
import io.ktor.client.plugins.api.createClientPlugin
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.updateAndGet
import kotlin.time.TimeSource

private val httpOperation = MutableStateFlow(0L)
private val httpLog = Logger.withTag("HTTP")

/** Fixed route labels omit raw URLs, headers, query values and bodies. */
internal fun diagnosticRoute(path: String): String {
    val route = path.substringBefore('?').substringBefore('#')
    if (Regex("/v1/rooms/[^/]+(?:/(?:preview|join|leave|end|snapshot|realtime-ticket|bug-reports|stream/(?:start|abort)|voice/config|chat/messages))?").matches(route)) {
        return route.replace(Regex("(/rooms/)[^/]+"), "$1[room]")
    }
    if (route == "/v1/bug-reports" || route == "/v1/rooms" || Regex("/v1/guest-sessions(?:/(?:refresh|reset|revoke|profile))?").matches(route)) return route
    if (route.trimEnd('/') == "/socket.io") return "[socket-handshake]"
    return "[other]"
}

internal fun httpDiagnosticsPlugin(config: BackendConfig) = createClientPlugin("HttpDiagnostics") {
    on(Send) { request ->
        // Media and image requests share this client; never observe third-party exchanges.
        if (!hasBackendOrigin(request.url.build(), config.baseUrl)) return@on proceed(request)
        val operation = httpOperation.updateAndGet { it + 1 }
        val started = TimeSource.Monotonic.markNow()
        val method = request.method.value
        val route = diagnosticRoute(request.url.build().encodedPath)
        httpLog.i("http.start operation=$operation method=$method route=$route")
        try {
            val response = proceed(request)
            httpLog.i("http.response operation=$operation status=${response.response.status.value} elapsedMs=${started.elapsedNow().inWholeMilliseconds}")
            response
        } catch (cancel: CancellationException) {
            logHandledException("HttpDiagnostics.catch1", cancel)
            httpLog.i("http.cancelled operation=$operation elapsedMs=${started.elapsedNow().inWholeMilliseconds}")
            throw cancel
        } catch (error: Exception) {
            logHandledException("HttpDiagnostics.catch2", error)
            httpLog.w("http.failure operation=$operation code=TRANSPORT_ERROR type=${error::class.simpleName} elapsedMs=${started.elapsedNow().inWholeMilliseconds}")
            throw error
        }
    }
}
