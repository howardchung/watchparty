package top.roomio.data.party

import kotlin.math.sqrt

/** Keeps only a recent scalar level; PCM is neither retained nor transmitted here. */
internal class MicrophoneLevel {
    private var enabled = false
    private var rms = 0.0
    private var sampledAt: Long? = null

    fun setEnabled(value: Boolean) {
        enabled = value
        rms = 0.0
        sampledAt = null
    }

    fun samplePcm16(data: ByteArray, nowMillis: Long) {
        if (!enabled || data.size < 2) return
        var sum = 0.0
        val count = data.size / 2
        repeat(count) { index ->
            val offset = index * 2
            val value = (((data[offset].toInt() and 0xff) or (data[offset + 1].toInt() shl 8)).toShort()).toDouble() / 32768.0
            sum += value * value
        }
        rms = sqrt(sum / count)
        sampledAt = nowMillis
    }

    fun samplePcm16(data: ShortArray, count: Int, nowMillis: Long) {
        if (!enabled || count <= 0) return
        require(count <= data.size)
        var sum = 0.0
        repeat(count) { index ->
            val value = data[index].toDouble() / 32768.0
            sum += value * value
        }
        rms = sqrt(sum / count)
        sampledAt = nowMillis
    }

    fun level(nowMillis: Long): Double {
        val at = sampledAt ?: return 0.0
        return if (enabled && nowMillis - at in 0..300) rms else 0.0
    }
}
