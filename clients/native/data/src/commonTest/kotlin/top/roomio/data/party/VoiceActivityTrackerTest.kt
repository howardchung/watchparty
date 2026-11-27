package top.roomio.data.party

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class VoiceActivityTrackerTest {
    @Test
    fun speakingRequiresTwoSamplesAndReleasesAfterHalfSecond() {
        val tracker = VoiceActivityTracker()
        assertFalse(tracker.sample("member", true, 0))
        assertTrue(tracker.sample("member", true, 300))
        assertEquals(setOf("member"), tracker.speakers())
        assertFalse(tracker.sample("member", false, 400))
        assertFalse(tracker.sample("member", false, 899))
        assertTrue(tracker.sample("member", false, 900))
        assertEquals(emptySet(), tracker.speakers())
    }

    @Test
    fun muteAndDisconnectClearImmediatelyAndResetAttackWindow() {
        val tracker = VoiceActivityTracker()
        tracker.sample("local", true, 0)
        tracker.sample("local", true, 300)
        assertTrue(tracker.clear("local"))
        assertFalse(tracker.sample("local", true, 400))
        assertTrue(tracker.sample("local", true, 700))
        assertTrue(tracker.clearAll())
        assertEquals(emptySet(), tracker.speakers())
        assertFalse(tracker.clearAll())
    }
}
