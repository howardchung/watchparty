package top.roomio.app

import androidx.lifecycle.ViewModel
import dev.zacsweers.metro.Assisted
import dev.zacsweers.metro.AssistedFactory
import dev.zacsweers.metro.AssistedInject

/** Keeps dependencies alive for the same lifetime as the navigation ViewModel stores. */
@AssistedInject
internal class RetainedAppGraph(@Assisted val graph: WatchPartyAppGraph) : ViewModel() {
    private val monitoring = lazy { graph.observability }

    fun startMonitoring() {
        monitoring.value
    }

    override fun onCleared() {
        if (monitoring.isInitialized()) monitoring.value.close()
    }

    @AssistedFactory
    fun interface Factory {
        fun create(graph: WatchPartyAppGraph): RetainedAppGraph
    }
}
