package top.roomio.app

import androidx.lifecycle.ViewModelStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.test.*
import kotlin.test.*
import top.roomio.app.room.*
import top.roomio.app.room.player.*
import top.roomio.domain.party.*

@OptIn(ExperimentalCoroutinesApi::class)
class AutomaticJoinSyncTest {
    private val room = Room("room", "MOON-42", "Film", "owner", false)
    private val stream = StreamInfo("stream", 1, StreamState.ACTIVE, "https://example.test/movie.mp4")
    private val members = listOf(Member("owner", "owner", "Host", "COMET", true, true), Member("guest", "test", "Guest", "MINT", false, true))
    private val snapshot = RoomSnapshot(room, members, stream)
    private class Transport : RealtimeSession {
        val incoming = Channel<RealtimeEvent>(Channel.UNLIMITED)
        override val events = incoming.receiveAsFlow()
        val requests = mutableListOf<String>()
        override suspend fun reportPlayback(streamSessionId: String, positionMs: Long, playing: Boolean) = Unit
        override suspend fun requestSync(streamSessionId: String, positionMs: Long, requestId: String) { requests += requestId }
        override suspend fun close() = Unit
        override suspend fun groupSync(action: String, streamSessionId: String, requestId: String, positionMs: Long?, response: String?, ready: Boolean?, reason: String?) = null
    }
    private fun fixture(transport: Transport, asOwner: Boolean = false): RoomViewModel = testRoomViewModel(
        "room", asOwner, testSessionRepository,
        object : RoomRepository by testRoomRepository { override suspend fun snapshot(roomId: String) = snapshot },
        object : RealtimeClient { override suspend fun connect(roomId: String) = transport },
        testVoiceClient, testSessionKeeper,
    )
    @Test fun joinsOnlyAfterPlayerReadyRetriesAndPreservesOwnerPauseState() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        val store = ViewModelStore()
        try {
            val transport = Transport(); val vm = fixture(transport); store.put("vm", vm)
            advanceTimeBy(3000); runCurrent(); assertTrue(transport.requests.isEmpty())
            vm.onAction(RoomAction.PlayerStateChanged(VideoPlayerState(VideoPlayerStatus.PLAYING, 42000, 60000, 60000)))
            advanceTimeBy(3000); runCurrent(); assertEquals(1, transport.requests.size)
            transport.incoming.send(RealtimeEvent.SyncResult(SyncStatus.UNAVAILABLE, 0, transport.requests.last())); runCurrent()
            advanceTimeBy(3000); runCurrent(); assertEquals(2, transport.requests.size)
            transport.incoming.send(RealtimeEvent.SyncResult(SyncStatus.APPLIED, 12000, transport.requests.last(), false)); runCurrent()
            assertEquals(12000, vm.state.value.positionMs); assertEquals(RoomPlaybackState.PAUSED, vm.state.value.playback)
            transport.incoming.send(RealtimeEvent.Snapshot(snapshot)); runCurrent()
            advanceTimeBy(12000); runCurrent(); assertEquals(2, transport.requests.size)
        } finally { store.clear(); Dispatchers.resetMain() }
    }
    @Test fun committedStartTakesPrecedenceAndOwnerNeverCatchesUp() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        val store = ViewModelStore()
        try {
            val transport = Transport(); val vm = fixture(transport); store.put("vm", vm)
            transport.incoming.send(RealtimeEvent.GroupSyncChanged(GroupSyncAttempt("source-stream", "stream", 1, "owner", 0, 1, 1, GroupSyncPhase.PREPARING, listOf(GroupSyncParticipant("guest", GroupSyncResponse.ACCEPTED))), 1)); runCurrent()
            vm.onAction(RoomAction.PlayerStateChanged(VideoPlayerState(VideoPlayerStatus.PAUSED, 0, 60000, 60000)))
            advanceTimeBy(3000); runCurrent(); assertTrue(transport.requests.isEmpty()); assertTrue(vm.state.value.syncLocked)
            val ownerTransport = Transport(); val ownerVm = fixture(ownerTransport, true); store.put("owner", ownerVm)
            ownerVm.onAction(RoomAction.PlayerStateChanged(VideoPlayerState(VideoPlayerStatus.PLAYING, 0, 60000, 60000)))
            advanceTimeBy(3000); runCurrent(); assertTrue(ownerTransport.requests.isEmpty())
        } finally { store.clear(); Dispatchers.resetMain() }
    }
}
