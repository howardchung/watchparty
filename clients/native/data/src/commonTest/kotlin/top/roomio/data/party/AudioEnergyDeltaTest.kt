package top.roomio.data.party

import kotlin.test.Test
import kotlin.test.assertEquals

class AudioEnergyDeltaTest {
    @Test
    fun computesAudioLevelFromEnergyAndDurationDeltas() {
        val sampler = AudioEnergyDelta()
        assertEquals(0.0, sampler.level("remote", null, 0.2, 1.0))
        assertEquals(0.5, sampler.level("remote", null, 0.225, 1.1), 0.00001)
    }

    @Test
    fun prefersExplicitLevelAndIgnoresCounterResets() {
        val sampler = AudioEnergyDelta()
        sampler.level("track", null, 0.4, 2.0)
        assertEquals(0.75, sampler.level("track", 0.75, 0.5, 2.1))
        assertEquals(0.0, sampler.level("track", null, 0.1, 1.0))
    }
}
