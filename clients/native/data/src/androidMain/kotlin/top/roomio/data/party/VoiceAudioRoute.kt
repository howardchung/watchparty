package top.roomio.data.party

import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import co.touchlab.kermit.Logger

/** Owns communication routing only for the lifetime of one voice session. */
@Suppress("DEPRECATION") // Android 6–11 require speakerphone/SCO routing.
internal class VoiceAudioRoute(private val manager: AudioManager) {
    private val log = Logger.withTag("VoiceAudioRoute")
    private var previousMode: Int? = null
    private var previousSpeaker = false
    private var startedSco = false

    fun start() {
        if (previousMode != null) return
        previousMode = manager.mode
        previousSpeaker = manager.isSpeakerphoneOn
        // Keep call/media volume categories and concurrent movie playback.
        manager.mode = AudioManager.MODE_IN_COMMUNICATION
        update()
    }

    fun update() {
        if (previousMode == null) return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val outputs = manager.availableCommunicationDevices
            val selected = preferredVoiceOutput(outputs, manager.communicationDevice, ::kind)
            if (selected == null) {
                log.w("No supported voice output available")
            } else if (!manager.setCommunicationDevice(selected)) {
                log.w("Voice output selection rejected type=${selected.type}")
            } else {
                log.i("Voice output requested type=${selected.type}")
            }
        } else {
            val outputs = manager.getDevices(AudioManager.GET_DEVICES_OUTPUTS).toList()
            val selected = preferredVoiceOutput(outputs, null, ::kind)
            val bluetooth = selected?.let(::kind) == VoiceOutputKind.BLUETOOTH
            if (bluetooth && !startedSco && !manager.isBluetoothScoOn) {
                manager.startBluetoothSco()
                manager.isBluetoothScoOn = true
                startedSco = true
            } else if (!bluetooth && startedSco) {
                manager.stopBluetoothSco()
                manager.isBluetoothScoOn = false
                startedSco = false
            }
            manager.isSpeakerphoneOn = selected?.let(::kind) == VoiceOutputKind.SPEAKER
        }
    }

    fun close() {
        val restoreMode = previousMode ?: return
        previousMode = null
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                manager.clearCommunicationDevice()
            } else {
                if (startedSco) {
                    manager.stopBluetoothSco()
                    manager.isBluetoothScoOn = false
                    startedSco = false
                }
                manager.isSpeakerphoneOn = previousSpeaker
            }
        } finally {
            manager.mode = restoreMode
        }
    }

    private fun kind(device: AudioDeviceInfo): VoiceOutputKind = when (device.type) {
        AudioDeviceInfo.TYPE_WIRED_HEADSET,
        AudioDeviceInfo.TYPE_WIRED_HEADPHONES,
        AudioDeviceInfo.TYPE_USB_HEADSET,
        AudioDeviceInfo.TYPE_USB_DEVICE -> VoiceOutputKind.HEADPHONES
        AudioDeviceInfo.TYPE_BLUETOOTH_SCO,
        AudioDeviceInfo.TYPE_BLE_HEADSET,
        AudioDeviceInfo.TYPE_HEARING_AID -> VoiceOutputKind.BLUETOOTH
        AudioDeviceInfo.TYPE_BUILTIN_SPEAKER -> VoiceOutputKind.SPEAKER
        else -> VoiceOutputKind.OTHER
    }
}
