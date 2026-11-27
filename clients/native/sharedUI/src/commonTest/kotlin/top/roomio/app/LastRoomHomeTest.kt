package top.roomio.app

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import kotlinx.coroutines.test.resetMain
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import top.roomio.app.room.RoomAction
import top.roomio.app.home.HomeViewModel
import top.roomio.domain.party.PartyException
import top.roomio.domain.party.Room
import top.roomio.domain.party.RoomAvailability
import top.roomio.domain.party.RoomRepository

@OptIn(ExperimentalCoroutinesApi::class)
class LastRoomHomeTest {
    @Test
    fun homeReportHasNoRoomAndRetainsDraftUntilAccepted() = runTest {
        val dispatcher = UnconfinedTestDispatcher(testScheduler)
        Dispatchers.setMain(dispatcher)
        try {
            var fails = true
            val roomIds = mutableListOf<String?>()
            val descriptions = mutableListOf<String>()
            val rooms = object : RoomRepository by testRoomRepository {
                override suspend fun reportBug(roomId: String?, description: String, screenshots: List<top.roomio.domain.party.ReportScreenshot>) {
                    roomIds.add(roomId)
                    descriptions.add(description)
                    if (fails) throw PartyException("NETWORK", "Offline")
                }
            }
            val vm = HomeViewModel(TestProfileRepository(), testSessionRepository, rooms)
            backgroundScope.launch(dispatcher) { vm.state.collect() }
            vm.onReportAction(RoomAction.BugReportClicked)
            vm.onReportAction(RoomAction.BugDescriptionChanged("Home lost my language"))
            vm.onReportAction(RoomAction.BugReportDismissed)
            vm.onReportAction(RoomAction.BugReportClicked)
            assertEquals("Home lost my language", vm.state.value.report.bugDescription)
            vm.onReportAction(RoomAction.BugReportSend)
            assertEquals("NETWORK", vm.state.value.report.bugError)
            assertEquals("Home lost my language", vm.state.value.report.bugDescription)
            fails = false
            vm.onReportAction(RoomAction.BugReportSend)
            assertEquals(listOf<String?>(null, null), roomIds)
            assertEquals(listOf("Home lost my language", "Home lost my language"), descriptions)
            assertEquals(true, vm.state.value.report.bugSent)
            assertEquals("", vm.state.value.report.bugDescription)
            vm.viewModelScope.cancel()
        } finally { Dispatchers.resetMain() }
    }

    @Test
    fun cachedRoomSurvivesOfflineRefreshAndUpdatesWhenReturningHome() = runTest {
        val dispatcher = UnconfinedTestDispatcher(testScheduler)
        Dispatchers.setMain(dispatcher)
        try {
            var saved: Room? = Room("room", "ABCD2345", "Movie night", "owner", false)
            var offline = true
            var ended = false
            val rooms = object : RoomRepository by testRoomRepository {
                override suspend fun lastRoom() = saved
                override suspend fun preview(code: String) = if (offline) throw PartyException("NETWORK", "Offline") else testRoomRepository.preview(code).copy(
                    title = "Updated title", availability = if (ended) RoomAvailability.ENDED else RoomAvailability.OPEN,
                )
            }
            val vm = HomeViewModel(TestProfileRepository(), testSessionRepository, rooms)
            backgroundScope.launch(dispatcher) { vm.state.collect() }
            vm.refreshLastRoom()
            assertEquals("ABCD2345", vm.state.value.roomPreview?.code)
            assertEquals("Movie night", vm.state.value.roomPreview?.title)
            offline = false
            vm.refreshLastRoom()
            assertEquals("Updated title", vm.state.value.roomPreview?.title)
            ended = true
            vm.refreshLastRoom()
            assertNull(vm.state.value.roomPreview)
            saved = null
            vm.refreshLastRoom()
            assertNull(vm.state.value.roomPreview)
            vm.viewModelScope.cancel()
        } finally { Dispatchers.resetMain() }
    }
    @Test
    fun previewAdmissionRestoresOwnerOnlyForOriginalIdentity() = runTest {
        val dispatcher = UnconfinedTestDispatcher(testScheduler)
        Dispatchers.setMain(dispatcher)
        try {
            for (owner in listOf("test", "someone-else")) {
                val rooms = object : RoomRepository by testRoomRepository {
                    override suspend fun join(code: String) = Room("room", code, "Movie night", owner, false)
                }
                val vm = top.roomio.app.preview.RoomPreviewViewModel("ABCD2345", rooms, TestProfileRepository(), testSessionRepository)
                val admissions = mutableListOf<top.roomio.app.preview.RoomPreviewEffect.Joined>()
                val collector = backgroundScope.launch(dispatcher) {
                    vm.effects.collect { if (it is top.roomio.app.preview.RoomPreviewEffect.Joined) admissions.add(it) }
                }
                vm.onAction(top.roomio.app.preview.RoomPreviewAction.JoinClicked)
                assertEquals(owner == "test", admissions.single().asOwner)
                collector.cancel()
                vm.viewModelScope.cancel()
            }
        } finally { Dispatchers.resetMain() }
    }

}
