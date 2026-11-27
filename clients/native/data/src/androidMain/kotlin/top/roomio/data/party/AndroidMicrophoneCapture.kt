package top.roomio.data.party

import top.roomio.data.diagnostics.logHandledException
import top.roomio.data.diagnostics.loggedRunCatching

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder

/** Never overlaps peer capture; released synchronously before WebRTC takes over. */
internal class AndroidMicrophoneCapture : MicrophoneCapture {
    private val recorder: AudioRecord

    init {
        val minimum = AudioRecord.getMinBufferSize(16_000, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
        check(minimum > 0)
        recorder = AudioRecord.Builder()
            .setAudioSource(MediaRecorder.AudioSource.VOICE_COMMUNICATION)
            .setAudioFormat(AudioFormat.Builder().setSampleRate(16_000)
                .setChannelMask(AudioFormat.CHANNEL_IN_MONO).setEncoding(AudioFormat.ENCODING_PCM_16BIT).build())
            .setBufferSizeInBytes(maxOf(minimum, 6400)).build()
        try {
            check(recorder.state == AudioRecord.STATE_INITIALIZED)
            recorder.startRecording()
            check(recorder.recordingState == AudioRecord.RECORDSTATE_RECORDING)
        } catch (error: Exception) {
            logHandledException("AndroidMicrophoneCapture.catch1", error)
            close()
            throw error
        }
    }

    override fun read(samples: ShortArray): Int =
        recorder.read(samples, 0, samples.size, AudioRecord.READ_NON_BLOCKING)

    override fun close() {
        loggedRunCatching("AndroidMicrophoneCapture.run2") { recorder.stop() }
        recorder.release()
    }
}
