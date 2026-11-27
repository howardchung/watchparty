package top.roomio.app

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.awaitCancellation
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.advanceTimeBy
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import kotlinx.coroutines.withTimeout
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import top.roomio.app.room.RoomAction
import top.roomio.app.room.RoomViewModel
import top.roomio.app.room.VoiceConnectionState
import top.roomio.domain.party.VoiceClient
import top.roomio.domain.party.VoiceConfiguration
import top.roomio.domain.party.VoiceEvent
import top.roomio.domain.party.VoiceSession

@OptIn(ExperimentalCoroutinesApi::class)
class VoiceJoinRecoveryTest {
    @Test
    fun timedOutJoinOffersRetryAndRetryConnectsMuted() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        var attempts = 0
        var microphoneEnabled = true
        val client = object : VoiceClient {
            override suspend fun connect(configuration: VoiceConfiguration): VoiceSession {
                attempts++
                if (attempts == 1) withTimeout(100) { delay(200) }
                return object : VoiceSession {
                    override val events: Flow<VoiceEvent> = flow { awaitCancellation() }
                    override fun setMicrophoneEnabled(enabled: Boolean) { microphoneEnabled = enabled }
                    override suspend fun disconnect() = Unit
                }
            }
        }
        val vm = testRoomViewModel("room", true, testSessionRepository, testRoomRepository,
            testRealtimeClient, client, testSessionKeeper)
        try {
            vm.onAction(RoomAction.JoinVoiceClicked)
            advanceTimeBy(101)
            runCurrent()
            assertEquals(VoiceConnectionState.FAILED, vm.state.value.voiceState)
            assertTrue(vm.state.value.micMuted)
            vm.onAction(RoomAction.JoinVoiceClicked)
            assertEquals(2, attempts)
            assertEquals(VoiceConnectionState.CONNECTED, vm.state.value.voiceState)
            assertEquals(false, microphoneEnabled)
        } finally {
            vm.viewModelScope.cancel()
            Dispatchers.resetMain()
        }
    }

    @Test
    fun stalledJoinIsBoundedAndRoomCancellationDoesNotRetry() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        var attempts = 0
        val client = object : VoiceClient {
            override suspend fun connect(configuration: VoiceConfiguration): VoiceSession {
                attempts++
                awaitCancellation()
            }
        }
        val vm = testRoomViewModel("room", true, testSessionRepository, testRoomRepository,
            testRealtimeClient, client, testSessionKeeper)
        try {
            vm.onAction(RoomAction.JoinVoiceClicked)
            advanceTimeBy(30_001)
            runCurrent()
            assertEquals(VoiceConnectionState.FAILED, vm.state.value.voiceState)
            vm.onAction(RoomAction.JoinVoiceClicked)
            vm.onAction(RoomAction.LeaveConfirmed)
            vm.viewModelScope.cancel()
            advanceTimeBy(60_000)
            runCurrent()
            assertEquals(2, attempts)
        } finally {
            vm.viewModelScope.cancel()
            Dispatchers.resetMain()
        }
    }
}
