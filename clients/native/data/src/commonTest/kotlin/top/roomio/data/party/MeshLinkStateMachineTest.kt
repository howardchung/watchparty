package top.roomio.data.party

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue
import top.roomio.domain.party.VoicePeerStatus

class MeshLinkStateMachineTest {
    @Test fun staleCallbacksCannotModifyReplacement() {
        val mesh = MeshLinkStateMachine()
        mesh.opened("a", "session", 1, 0)
        mesh.opened("a", "session", 2, 1)
        assertFalse(mesh.connected("a", 1))
        assertFalse(mesh.needsRecovery("a", 1))
        assertNull(mesh.retry("a", 1))
        assertTrue(mesh.connected("a", 2))
        assertEquals(VoicePeerStatus.CONNECTED, mesh.snapshot()["a"])
    }

    @Test fun oneBrokenLinkExhaustsThreeRetriesWithoutDisturbingHealthyAudio() {
        val mesh = MeshLinkStateMachine()
        mesh.opened("healthy", "one", 1, 0)
        mesh.connected("healthy", 1)
        mesh.opened("broken", "two", 1, 0)
        for (attempt in 1..3) {
            assertEquals(attempt, mesh.retry("broken", attempt.toLong()))
            mesh.opened("broken", "two", attempt + 1L, attempt)
        }
        assertNull(mesh.retry("broken", 4))
        assertEquals(VoicePeerStatus.UNAVAILABLE, mesh.snapshot()["broken"])
        assertEquals(VoicePeerStatus.CONNECTED, mesh.snapshot()["healthy"])
        mesh.remove("broken")
        assertFalse(mesh.connected("broken", 4))
    }
}
