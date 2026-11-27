package top.roomio.app.room.player

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.test.advanceTimeBy
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
class DecoderResourceRecoveryTest {
    @Test fun retryIsDeferredAndCannotLoopEvenAfterSuccessfulPreparation() = runTest {
        val recovery = DecoderResourceRecovery(this)
        var preparations = 0
        assertTrue(recovery.schedule { preparations++ })
        assertTrue(recovery.isPending)
        assertFalse(recovery.schedule { preparations++ })
        runCurrent()
        assertEquals(0, preparations)
        advanceTimeBy(300)
        runCurrent()
        assertEquals(1, preparations)
        assertFalse(recovery.isPending)
        assertFalse(recovery.schedule { preparations++ })
    }

    @Test fun replacingOrStoppingSourceCancelsItsRetry() = runTest {
        val recovery = DecoderResourceRecovery(this)
        var oldPreparations = 0
        var newPreparations = 0
        recovery.schedule { oldPreparations++ }
        runCurrent()
        advanceTimeBy(100)
        recovery.reset()
        recovery.schedule { newPreparations++ }
        runCurrent() // cancellation of the old job must not clear the new job
        assertTrue(recovery.isPending)
        advanceTimeBy(300)
        runCurrent()
        assertEquals(0, oldPreparations)
        assertEquals(1, newPreparations)
        recovery.reset()
        recovery.schedule { newPreparations++ }
        recovery.reset()
        advanceTimeBy(1000)
        runCurrent()
        assertEquals(1, newPreparations)
    }

    @Test fun leavingPlayerCancelsRetry() = runTest {
        val lifecycle = Job()
        val recovery = DecoderResourceRecovery(CoroutineScope(coroutineContext + lifecycle))
        var preparations = 0
        recovery.schedule { preparations++ }
        runCurrent()
        lifecycle.cancel()
        advanceTimeBy(1000)
        runCurrent()
        assertFalse(recovery.isPending)
        assertEquals(0, preparations)
    }
}
