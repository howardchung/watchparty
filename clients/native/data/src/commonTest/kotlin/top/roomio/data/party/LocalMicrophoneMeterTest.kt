package top.roomio.data.party

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class LocalMicrophoneMeterTest {
    private class Capture : MicrophoneCapture {
        var closed = false
        var fail = false
        override fun read(samples: ShortArray): Int {
            check(!closed)
            if (fail) return -3
            samples[0] = 8192; samples[1] = -8192
            return 2
        }
        override fun close() { closed = true }
    }

    @Test
    fun capturesAloneOnlyAfterAuthorizationAndReleasesBeforePeerCapture() {
        val captures = mutableListOf<Capture>()
        val meter = LocalMicrophoneMeter(
            createCapture = { Capture().also { captures += it } }, nowMillis = { 100L }, onFailure = { error("unexpected failure") },
        )
        assertEquals(0.0, meter.poll())
        assertTrue(captures.isEmpty())
        meter.setEnabled(true)
        assertEquals(0.25, meter.poll())
        assertEquals(1, captures.size)
        meter.setPeerCaptureRequired(true)
        assertTrue(captures.single().closed)
        assertEquals(0.0, meter.poll())
        meter.onWebRtcSamples(byteArrayOf(0, 32, 0, -32))
        assertEquals(0.25, meter.poll())
        assertEquals(1, captures.size)
        meter.setEnabled(false)
        meter.onWebRtcSamples(byteArrayOf(0, 32))
        assertEquals(0.0, meter.poll())
        meter.setEnabled(true)
        assertEquals(0.0, meter.poll())
    }

    @Test
    fun resumesStandaloneAfterLastPeerLeavesAndMuteReleasesImmediately() {
        var now = 100L
        val captures = mutableListOf<Capture>()
        val meter = LocalMicrophoneMeter({ Capture().also { captures += it } }, { now }, { error("unexpected failure") })
        meter.setPeerCaptureRequired(true)
        meter.setEnabled(true)
        meter.onWebRtcSamples(byteArrayOf(0, 32))
        assertEquals(0.25, meter.poll())
        now = 500
        assertEquals(0.0, meter.poll())
        meter.setPeerCaptureRequired(false)
        assertEquals(0.25, meter.poll())
        meter.setEnabled(false)
        assertTrue(captures.single().closed)
        assertEquals(0.0, meter.poll())
        now = 6000
        meter.setEnabled(true)
        assertEquals(0.25, meter.poll())
        assertEquals(2, captures.size)
        meter.setEnabled(false)
        assertTrue(captures.all { it.closed })
    }

    @Test
    fun failedCaptureIsReleasedAndRetriesAreBoundedWithoutPreventingPeerCapture() {
        var now = 100L
        var failures = 0
        val capture = Capture().apply { fail = true }
        var attempts = 0
        val meter = LocalMicrophoneMeter({ attempts++; capture }, { now }, { failures++ })
        meter.setEnabled(true)
        assertEquals(0.0, meter.poll())
        assertTrue(capture.closed)
        assertEquals(1, failures)
        now = 200
        assertEquals(0.0, meter.poll())
        assertEquals(1, attempts)
        meter.setPeerCaptureRequired(true)
        meter.onWebRtcSamples(byteArrayOf(0, 32))
        assertEquals(0.25, meter.poll())
    }
}
