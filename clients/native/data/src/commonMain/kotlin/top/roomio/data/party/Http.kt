package top.roomio.data.party

import top.roomio.data.diagnostics.logHandledException
import top.roomio.data.diagnostics.loggedRunCatching

import io.ktor.client.call.body
import io.ktor.client.statement.HttpResponse
import io.ktor.http.isSuccess
import kotlinx.coroutines.CancellationException
import top.roomio.data.party.dto.ErrorDto
import top.roomio.domain.party.PARTY_CODE_NETWORK
import top.roomio.domain.party.PartyException

internal suspend inline fun <reified T> HttpResponse.bodyOrThrow(): T {
    if (status.isSuccess()) {
        return try { body() }
        catch (cancel: CancellationException) { logHandledException("Http.catch1", cancel);  throw cancel }
        catch (error: Exception) {
            logHandledException("Http.catch2", error)
            co.touchlab.kermit.Logger.withTag("HTTP").w("http.decode_failure status=${status.value} route=${diagnosticRoute(call.request.url.encodedPath)}")
            throw error
        }
    }
    throw toPartyException()
}

internal suspend fun HttpResponse.toPartyException(): PartyException {
    val error = loggedRunCatching("Http.run3") { body<ErrorDto>() }.getOrNull()
    val code = when (error?.code) {
        "AUTH_UNAVAILABLE" -> PARTY_CODE_NETWORK
        null -> if (status.value == 503) PARTY_CODE_NETWORK else "HTTP_${status.value}"
        else -> error.code
    }
    co.touchlab.kermit.Logger.withTag("HTTP").w("http.rejected status=${status.value} code=${code.takeIf { Regex("[A-Z][A-Z_0-9]{1,63}").matches(it) } ?: "UNKNOWN"}")
    return PartyException(
        code = code,
        message = error?.message ?: "Request failed",
    )
}

/** A stale or missing access token is worth one refresh-and-retry. */
internal fun PartyException.isAuthFailure(): Boolean =
    code == "INVALID_TOKEN" || code == "UNAUTHENTICATED" || code == "SESSION_EXPIRED"

/**
 * Normalizes any unexpected transport failure (DNS, connection, timeout) into a
 * stable [PartyException] so presentation can show an offline state instead of
 * crashing. Coroutine cancellation is always rethrown.
 */
internal fun Throwable.asPartyException(): PartyException = when (this) {
    is PartyException -> this
    is CancellationException -> throw this
    else -> PartyException(PARTY_CODE_NETWORK, message ?: "Network request failed")
}
