package top.roomio.data.party

import top.roomio.data.diagnostics.logHandledException

import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive

/** Rejected trickle ICE is a peer failure, never an uncaught session coroutine. */
internal suspend fun deliverPeerSignal(send: suspend () -> Unit, rejected: (Throwable) -> Unit) {
    try {
        send()
    } catch (error: Exception) {
        logHandledException("PeerSignalDelivery.catch1", error)
        currentCoroutineContext().ensureActive()
        rejected(error)
    }
}
