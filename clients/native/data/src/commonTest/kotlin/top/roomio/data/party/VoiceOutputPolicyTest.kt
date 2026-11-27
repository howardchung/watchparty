package top.roomio.data.party

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class VoiceOutputPolicyTest {
    private data class Device(val id: Int, val kind: VoiceOutputKind)
    private val earpiece = Device(1, VoiceOutputKind.OTHER)
    private val speaker = Device(2, VoiceOutputKind.SPEAKER)
    private val bluetooth = Device(3, VoiceOutputKind.BLUETOOTH)
    private val headphones = Device(4, VoiceOutputKind.HEADPHONES)
    private fun select(devices: List<Device>, current: Device? = null) =
        preferredVoiceOutput(devices, current, Device::kind)

    @Test fun defaultsToSpeakerEvenWhenEarpieceIsCurrent() {
        assertEquals(speaker, select(listOf(earpiece, speaker), earpiece))
    }

    @Test fun headphonesOverrideSpeakerAndBluetooth() {
        assertEquals(headphones, select(listOf(speaker, bluetooth, headphones), bluetooth))
    }

    @Test fun bluetoothOverridesSpeakerAndPreservesSelectedBluetoothDevice() {
        val second = Device(5, VoiceOutputKind.BLUETOOTH)
        assertEquals(bluetooth, select(listOf(speaker, bluetooth), speaker))
        assertEquals(second, select(listOf(speaker, bluetooth, second), second))
    }

    @Test fun disconnectFallsBackToRemainingPersonalOutputThenSpeaker() {
        assertEquals(bluetooth, select(listOf(speaker, bluetooth), headphones))
        assertEquals(speaker, select(listOf(earpiece, speaker), bluetooth))
    }

    @Test fun neverSelectsEarpieceAsFallback() {
        assertNull(select(listOf(earpiece)))
        assertNull(select(emptyList()))
    }
}
