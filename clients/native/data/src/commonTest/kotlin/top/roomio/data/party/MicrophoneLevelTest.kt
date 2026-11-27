package top.roomio.data.party

import kotlin.math.abs
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class MicrophoneLevelTest {
    @Test
    fun signedLittleEndianPcmMatchesShortSamplesIncludingFullScale() {
        val level = MicrophoneLevel()
        level.setEnabled(true)
        level.samplePcm16(byteArrayOf(0, -128, -1, 127), 100)
        val fromBytes = level.level(100)
        level.samplePcm16(shortArrayOf(Short.MIN_VALUE, Short.MAX_VALUE), 2, 100)
        assertTrue(abs(fromBytes - level.level(100)) < 0.000001)
        assertTrue(fromBytes > 0.99)
        level.samplePcm16(byteArrayOf(0, 32, 0, -32), 100)
        assertEquals(0.25, level.level(100))
    }

    @Test
    fun mutedAndStaleAudioCannotActivateIndicatorOrLeakAcrossUnmute() {
        val level = MicrophoneLevel()
        val voice = shortArrayOf(8192, -8192)
        level.samplePcm16(voice, 2, 0)
        assertEquals(0.0, level.level(0))
        level.setEnabled(true)
        level.samplePcm16(voice, 2, 100)
        assertEquals(0.25, level.level(400))
        assertEquals(0.0, level.level(401))
        level.setEnabled(false)
        level.samplePcm16(voice, 2, 402)
        assertEquals(0.0, level.level(402))
        level.setEnabled(true)
        assertEquals(0.0, level.level(403))
    }

    @Test
    fun emptyAndPartialSamplesDoNotCountUnusedBufferOrInventSound() {
        val level = MicrophoneLevel()
        level.setEnabled(true)
        level.samplePcm16(shortArrayOf(0, 32767), 1, 100)
        assertEquals(0.0, level.level(100))
        level.samplePcm16(byteArrayOf(0, 0, 127), 100)
        assertEquals(0.0, level.level(100))
        level.samplePcm16(shortArrayOf(), 0, 100)
        level.samplePcm16(byteArrayOf(), 100)
        assertEquals(0.0, level.level(100))
    }

    @Test
    fun localSpeechHasAttackAndSilenceReleaseWithoutAnyPeers() {
        val level = MicrophoneLevel()
        val activity = VoiceActivityTracker()
        level.setEnabled(true)
        for (now in listOf(0L, 100L)) {
            level.samplePcm16(shortArrayOf(4096, -4096), 2, now)
            activity.sample("self", level.level(now) >= 0.02, now)
        }
        assertEquals(setOf("self"), activity.speakers())
        level.samplePcm16(shortArrayOf(0, 0), 2, 200)
        assertFalse(activity.sample("self", level.level(200) >= 0.02, 200))
        assertTrue(activity.sample("self", level.level(700) >= 0.02, 700))
        assertTrue(activity.speakers().isEmpty())
    }
}
