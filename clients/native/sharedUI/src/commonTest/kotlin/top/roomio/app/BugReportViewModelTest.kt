package top.roomio.app

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.cancel
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import top.roomio.app.room.RoomAction
import top.roomio.domain.party.PartyException
import top.roomio.domain.party.RoomRepository

@OptIn(ExperimentalCoroutinesApi::class)
class BugReportViewModelTest {
    @Test fun retainsFailedDraftPreventsDuplicateSendsAndAllowsAnotherReportAfterSuccess() {
        Dispatchers.setMain(UnconfinedTestDispatcher())
        val image = top.roomio.domain.party.ReportScreenshot("image/png", "aGVsbG8=")
        val sent = mutableListOf<List<top.roomio.domain.party.ReportScreenshot>>()
        var calls = 0
        var response = CompletableDeferred<Unit>()
        val repository = object : RoomRepository by testRoomRepository {
            override suspend fun reportBug(roomId: String?, description: String, screenshots: List<top.roomio.domain.party.ReportScreenshot>) { calls++; sent.add(screenshots); response.await() }
        }
        val vm = testRoomViewModel("room", true, testSessionRepository, repository, testRealtimeClient, testVoiceClient, testSessionKeeper)
        try {
            vm.onAction(RoomAction.BugReportClicked)
            vm.onAction(RoomAction.BugReportSend)
            assertEquals(0, calls)
            vm.onAction(RoomAction.BugDescriptionChanged("Voice is quiet"))
            vm.onAction(RoomAction.BugScreenshotsAdded(listOf(image)))
            vm.onAction(RoomAction.BugReportDismissed)
            vm.onAction(RoomAction.BugReportClicked)
            assertEquals(listOf(image), vm.state.value.bugScreenshots)
            assertEquals("Voice is quiet", vm.state.value.bugDescription)
            vm.onAction(RoomAction.BugReportSend)
            vm.onAction(RoomAction.BugReportSend)
            vm.onAction(RoomAction.BugReportDismissed)
            assertEquals(1, calls)
            vm.onAction(RoomAction.BugScreenshotRemoved(0))
            vm.onAction(RoomAction.BugScreenshotsAdded(listOf(image)))
            assertEquals(listOf(image), vm.state.value.bugScreenshots)
            assertTrue(vm.state.value.bugSending)
            assertTrue(vm.state.value.bugReportOpen)
            response.completeExceptionally(PartyException("NETWORK", "offline"))
            assertFalse(vm.state.value.bugSending)
            assertEquals("NETWORK", vm.state.value.bugError)
            assertEquals(listOf(image), vm.state.value.bugScreenshots)
            assertEquals("Voice is quiet", vm.state.value.bugDescription)
            response = CompletableDeferred()
            vm.onAction(RoomAction.BugReportSend)
            response.complete(Unit)
            assertEquals(2, calls)
            assertEquals(listOf(listOf(image), listOf(image)), sent)
            assertTrue(vm.state.value.bugScreenshots.isEmpty())
            assertTrue(vm.state.value.bugSent)
            assertEquals("", vm.state.value.bugDescription)
            vm.onAction(RoomAction.BugReportDismissed)
            vm.onAction(RoomAction.BugReportClicked)
            assertFalse(vm.state.value.bugSent)
        } finally { vm.viewModelScope.cancel(); Dispatchers.resetMain() }
    }
}
