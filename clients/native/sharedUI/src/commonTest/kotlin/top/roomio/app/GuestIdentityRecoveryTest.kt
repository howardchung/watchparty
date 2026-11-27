package top.roomio.app

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import top.roomio.app.manager.ManagerMode
import top.roomio.app.manager.PartyManagerAction
import top.roomio.app.manager.PartyManagerViewModel
import top.roomio.domain.party.GuestSession
import top.roomio.domain.party.PartyException
import top.roomio.domain.party.SessionRepository

@OptIn(ExperimentalCoroutinesApi::class)
class GuestIdentityRecoveryTest {
    @Test
    fun permanentAuthFailureRequiresConfirmationBeforeReset() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            var resets = 0
            val sessions = object : SessionRepository by testSessionRepository {
                override suspend fun ensureSession(name: String, avatar: String, language: String): GuestSession {
                    throw PartyException("SESSION_REVOKED", "revoked")
                }
                override suspend fun reset() { resets++ }
            }
            val vm = PartyManagerViewModel(ManagerMode.CREATE, false, false, testRoomRepository, TestProfileRepository(), sessions)
            vm.onAction(PartyManagerAction.CreateClicked)
            assertTrue(vm.state.value.canResetIdentity)
            assertEquals(0, resets)
            vm.onAction(PartyManagerAction.ResetRequested)
            assertTrue(vm.state.value.showResetConfirmation)
            vm.onAction(PartyManagerAction.ResetCancelled)
            assertFalse(vm.state.value.showResetConfirmation)
            assertEquals(0, resets)
            vm.onAction(PartyManagerAction.ResetRequested)
            vm.onAction(PartyManagerAction.ResetConfirmed)
            assertEquals(1, resets)
            assertFalse(vm.state.value.canResetIdentity)
            assertFalse(vm.state.value.isLoading)
        } finally { Dispatchers.resetMain() }
    }

    @Test
    fun networkFailureOffersRetryWithoutIdentityReplacement() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        try {
            val sessions = object : SessionRepository by testSessionRepository {
                override suspend fun ensureSession(name: String, avatar: String, language: String): GuestSession {
                    throw PartyException("NETWORK", "unavailable")
                }
            }
            val vm = PartyManagerViewModel(ManagerMode.CREATE, false, false, testRoomRepository, TestProfileRepository(), sessions)
            vm.onAction(PartyManagerAction.CreateClicked)
            assertFalse(vm.state.value.canResetIdentity)
            assertFalse(vm.state.value.isLoading)
        } finally { Dispatchers.resetMain() }
    }
}
