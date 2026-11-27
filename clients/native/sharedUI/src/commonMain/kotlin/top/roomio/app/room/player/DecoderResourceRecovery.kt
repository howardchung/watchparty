package top.roomio.app.room.player

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/** One deferred decoder retry per loaded source, cancelled when that source is replaced or stopped. */
internal class DecoderResourceRecovery(private val scope: CoroutineScope) {
    private var attempted = false
    private var pending: Job? = null
    private var generation = 0
    val isPending: Boolean get() = pending?.isActive == true

    fun schedule(prepare: () -> Unit): Boolean {
        if (attempted) return false
        attempted = true
        val scheduledGeneration = generation
        pending = scope.launch {
            try {
                // Let Media3 finish its error -> idle transition and release the old codec first.
                delay(300)
                prepare()
            } finally {
                if (generation == scheduledGeneration) pending = null
            }
        }
        return true
    }

    fun reset() {
        generation++
        pending?.cancel()
        pending = null
        attempted = false
    }
}
