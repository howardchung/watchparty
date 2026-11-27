package top.roomio.data.party

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.launch
import kotlinx.coroutines.awaitCancellation
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import top.roomio.domain.party.PartyException

@OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
class PeerSignalDeliveryTest {
    @Test fun rejectedIceIsReportedWithoutKillingItsOwner() = runTest {
        var code: String? = null
        val job = launch {
            deliverPeerSignal(
                { throw PartyException("STALE_NEGOTIATION", "Voice request rejected") },
                { code = (it as PartyException).code },
            )
        }
        job.join()
        assertFalse(job.isCancelled)
        assertEquals("STALE_NEGOTIATION", code)
    }

    @Test fun cancelledDeliveryDoesNotSchedulePeerRecovery() = runTest {
        var recovered = false
        val job = launch { deliverPeerSignal({ awaitCancellation() }, { recovered = true }) }
        runCurrent()
        job.cancelAndJoin()
        assertFalse(recovered)
    }
}
