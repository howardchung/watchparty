package top.roomio.app

import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import top.roomio.app.preview.RoomPreviewAction
import top.roomio.app.preview.RoomPreviewViewModel
import top.roomio.domain.party.PartyException
import top.roomio.domain.party.RoomRepository

@OptIn(ExperimentalCoroutinesApi::class)
class InvitePreviewTest {
    @BeforeTest
    fun setUp() = Dispatchers.setMain(UnconfinedTestDispatcher())

    @AfterTest
    fun tearDown() = Dispatchers.resetMain()

    @Test
    fun inviteWaitsForPreviewAndNeverJoinsWithoutConfirmation() {
        val ready = CompletableDeferred<Unit>()
        val sessions = RecordingSessionRepository()
        var joins = 0
        val repository = object : RoomRepository by testRoomRepository {
            override suspend fun preview(code: String) = testRoomRepository.preview(code).also {
                assertTrue(sessions.ensureCalls.isNotEmpty())
                ready.await()
            }
            override suspend fun join(code: String) = testRoomRepository.join(code).also { joins++ }
        }
        val viewModel = RoomPreviewViewModel("ABCD2345", repository, TestProfileRepository(), sessions)
        assertTrue(viewModel.state.value.isLoading)
        assertFalse(viewModel.state.value.canJoin)
        viewModel.onAction(RoomPreviewAction.JoinClicked)
        assertEquals(0, joins)
        ready.complete(Unit)
        assertTrue(viewModel.state.value.canJoin)
        assertEquals("ABCD2345", viewModel.state.value.model.code)
        assertEquals(0, joins)
        viewModel.onAction(RoomPreviewAction.JoinClicked)
        assertEquals(1, joins)
    }

    @Test
    fun offlineInviteCanRetryWithoutJoiningOrReplacingIdentity() {
        var attempts = 0
        val repository = object : RoomRepository by testRoomRepository {
            override suspend fun preview(code: String) =
                if (++attempts == 1) throw PartyException("NETWORK", "Offline")
                else testRoomRepository.preview(code)
        }
        val sessions = RecordingSessionRepository()
        val viewModel = RoomPreviewViewModel("ABCD2345", repository, TestProfileRepository(), sessions)
        assertTrue(viewModel.state.value.isOffline)
        assertFalse(viewModel.state.value.canJoin)
        viewModel.onAction(RoomPreviewAction.RetryClicked)
        assertTrue(viewModel.state.value.canJoin)
        assertFalse(viewModel.state.value.isOffline)
        assertEquals(null, viewModel.state.value.errorMessage)
        assertEquals(2, attempts)
    }
}
