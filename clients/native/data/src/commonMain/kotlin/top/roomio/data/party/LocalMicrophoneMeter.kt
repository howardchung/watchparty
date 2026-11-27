package top.roomio.data.party

import top.roomio.data.diagnostics.logHandledException
import top.roomio.data.diagnostics.loggedRunCatching

/** Shares WebRTC's capture when peers exist; owns a recorder only while alone. */
internal class LocalMicrophoneMeter(
    private val createCapture: () -> MicrophoneCapture,
    private val nowMillis: () -> Long,
    private val onFailure: () -> Unit,
) {
    private val lock = Any()
    private val level = MicrophoneLevel()
    private var enabled = false
    private var peerCaptureRequired = false
    private var recorder: MicrophoneCapture? = null
    private val samples = ShortArray(3200)
    private var retryAt = 0L

    fun setEnabled(value: Boolean) = synchronized(lock) {
        enabled = value
        level.setEnabled(value)
        if (!value) stopStandaloneLocked()
    }

    fun onWebRtcSamples(data: ByteArray) = synchronized(lock) {
        if (recorder == null) level.samplePcm16(data, nowMillis())
    }

    // Called before any peer is created, so the two capture paths never compete.
    fun setPeerCaptureRequired(value: Boolean) = synchronized(lock) {
        peerCaptureRequired = value
        if (value) stopStandaloneLocked()
    }

    fun poll(): Double = synchronized(lock) {
        val now = nowMillis()
        if (!enabled || peerCaptureRequired) stopStandaloneLocked()
        if (enabled && !peerCaptureRequired) {
            try {
                if (recorder == null && now >= retryAt) {
                    recorder = createCapture()
                }
                recorder?.let { capture ->
                    val count = capture.read(samples)
                    check(count >= 0)
                    level.samplePcm16(samples, count, now)
                }
            } catch (handledError: Exception) {
                logHandledException("LocalMicrophoneMeter.catch1", handledError)
                retryAt = now + 5_000
                stopStandaloneLocked()
                level.setEnabled(enabled)
                onFailure()
            }
        }
        level.level(now)
    }

    private fun stopStandaloneLocked() {
        val capture = recorder ?: return
        recorder = null
        loggedRunCatching("LocalMicrophoneMeter.run2") { capture.close() }
        samples.fill(0)
        level.setEnabled(enabled)
    }
}

/** A non-blocking, session-owned source used only when WebRTC has no peers. */
internal interface MicrophoneCapture {
    fun read(samples: ShortArray): Int
    fun close()
}
