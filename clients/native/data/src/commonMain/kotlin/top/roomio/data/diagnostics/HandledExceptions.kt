package top.roomio.data.diagnostics

import co.touchlab.kermit.Logger
import kotlinx.coroutines.CancellationException
import top.roomio.domain.diagnostics.handledExceptionDetails

internal fun logHandledException(operation: String, error: Throwable) {
    try {
        val message = handledExceptionDetails(operation, error)
        if (error is CancellationException) Logger.withTag("HandledException").d(message)
        else Logger.withTag("HandledException").w(message)
    } catch (_: Throwable) { /* Logging cannot break recovery or recursively log itself. */ }
}

internal inline fun <T> loggedRunCatching(operation: String, block: () -> T): Result<T> = try {
    Result.success(block())
} catch (error: Throwable) {
    logHandledException(operation, error)
    Result.failure(error)
}
