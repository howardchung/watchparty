package top.roomio.app

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.emptyFlow
import kotlinx.coroutines.test.*
import top.roomio.app.room.*
import top.roomio.domain.party.*
import kotlin.test.*

@OptIn(ExperimentalCoroutinesApi::class)
class RoomChatViewModelTest {
    private val room = Room("room","ABCD2345","Movie night","test",false)
    private val message = ChatMessage("old","room","other","member","Jo","berry","Hello","2026-11-12T06:00:00Z",5)
    @Test fun failedSendsRetrySameIdWithoutLosingNewDraftAndEventsReconcileOnce() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        val events = MutableSharedFlow<RealtimeEvent>(extraBufferCapacity = 16)
        val sends = mutableListOf<Pair<String,String>>()
        var fail = true
        val repository = object : RoomRepository by testRoomRepository {
            override suspend fun snapshot(roomId: String) = RoomSnapshot(room,emptyList(),StreamInfo("",0,StreamState.EMPTY,""))
            override suspend fun sendChatMessage(roomId: String, messageId: String, text: String): ChatMessage {
                sends += messageId to text
                if (fail) { fail = false; throw PartyException("RATE_LIMITED","Wait") }
                return message.copy(id=messageId,identityId="test",text=text,sequence=6)
            }
        }
        val realtime = object : RealtimeClient {
            override suspend fun connect(roomId: String) = object : RealtimeSession {
                override val events = events
                override suspend fun reportPlayback(streamSessionId: String, positionMs: Long, playing: Boolean) = Unit
                override suspend fun requestSync(streamSessionId: String, positionMs: Long, requestId: String) = Unit
                override suspend fun close() = Unit
            }
        }
        val vm = testRoomViewModel("room",true,testSessionRepository,repository,realtime,testVoiceClient,testSessionKeeper)
        try {
            vm.onAction(RoomAction.ChatDraftChanged("  سلام 🍿  "))
            vm.onAction(RoomAction.ChatSend)
            assertEquals(ChatSendState.FAILED,vm.state.value.chat.pending.single().state)
            val id=vm.state.value.chat.pending.single().id
            vm.onAction(RoomAction.ChatDraftChanged("Keep this new draft"))
            vm.onAction(RoomAction.ChatRetry(id))
            assertEquals(sends[0],sends[1]);assertEquals("سلام 🍿",sends[0].second)
            assertEquals("Keep this new draft",vm.state.value.chat.draft)
            assertTrue(vm.state.value.chat.pending.isEmpty())
            events.emit(RealtimeEvent.ChatMessageReceived(vm.state.value.chat.messages.single()))
            assertEquals(1,vm.state.value.chat.messages.size)
            vm.onAction(RoomAction.ChatToggle)
            events.emit(RealtimeEvent.ChatMessageReceived(message.copy(id="incoming",sequence=7)))
            assertEquals(1,vm.state.value.chat.unread)
            events.emit(RealtimeEvent.ChatMessageReceived(message.copy(id="incoming",sequence=7)))
            assertEquals(1,vm.state.value.chat.unread)
            events.emit(RealtimeEvent.Failure("NETWORK","offline"))
            vm.onAction(RoomAction.ChatSend)
            assertEquals(2,sends.size)
            assertEquals(ChatSendState.SENDING,vm.state.value.chat.pending.single().state)
            assertEquals("",vm.state.value.chat.draft)
            events.emit(RealtimeEvent.Snapshot(repository.snapshot("room").copy(chat=ChatPage(listOf(message),true))))
            assertTrue(vm.state.value.chat.connected)
            advanceTimeBy(1000); runCurrent()
            assertEquals(3,sends.size)
            assertTrue(vm.state.value.chat.pending.isEmpty())
        } finally { vm.viewModelScope.cancel();Dispatchers.resetMain() }
    }

    @Test fun offlineSendExpiresAndManualRetryWaitsForReconnect() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        val events = MutableSharedFlow<RealtimeEvent>(extraBufferCapacity = 16)
        val sends = mutableListOf<Pair<String,String>>()
        var failTransport = true
        val snapshot = RoomSnapshot(room,emptyList(),StreamInfo("",0,StreamState.EMPTY,""))
        val repository = object : RoomRepository by testRoomRepository {
            override suspend fun snapshot(roomId: String) = snapshot
            override suspend fun sendChatMessage(roomId: String, messageId: String, text: String): ChatMessage {
                sends += messageId to text
                if (failTransport) { failTransport = false; throw PartyException("NETWORK", "Offline") }
                return message.copy(id=messageId,identityId="test",text=text,sequence=6)
            }
        }
        val realtime = object : RealtimeClient {
            override suspend fun connect(roomId: String) = object : RealtimeSession {
                override val events = events
                override suspend fun reportPlayback(streamSessionId: String, positionMs: Long, playing: Boolean) = Unit
                override suspend fun requestSync(streamSessionId: String, positionMs: Long, requestId: String) = Unit
                override suspend fun close() = Unit
            }
        }
        val vm = testRoomViewModel("room",true,testSessionRepository,repository,realtime,testVoiceClient,testSessionKeeper)
        try {
            events.emit(RealtimeEvent.Failure("NETWORK","offline"))
            vm.onAction(RoomAction.ChatDraftChanged("Queued")); vm.onAction(RoomAction.ChatSend)
            val id = vm.state.value.chat.pending.single().id
            vm.onAction(RoomAction.ChatDraftChanged("New draft"))
            advanceTimeBy(29_999); runCurrent()
            assertEquals(ChatSendState.SENDING,vm.state.value.chat.pending.single().state)
            assertTrue(sends.isEmpty())
            advanceTimeBy(1); runCurrent()
            assertEquals("CHAT_SEND_TIMEOUT",vm.state.value.chat.pending.single().error)
            events.emit(RealtimeEvent.Snapshot(snapshot))
            assertTrue(sends.isEmpty()) // Expired messages never send automatically.
            events.emit(RealtimeEvent.Failure("NETWORK","offline"))
            vm.onAction(RoomAction.ChatRetry(id))
            assertEquals(ChatSendState.SENDING,vm.state.value.chat.pending.single().state)
            events.emit(RealtimeEvent.Snapshot(snapshot)); runCurrent()
            assertEquals(ChatSendState.SENDING,vm.state.value.chat.pending.single().state)
            advanceTimeBy(1_000); runCurrent()
            assertEquals(listOf(id to "Queued", id to "Queued"),sends)
            assertTrue(vm.state.value.chat.pending.isEmpty())
            assertEquals("New draft",vm.state.value.chat.draft)
            events.emit(RealtimeEvent.Failure("NETWORK","offline"))
            vm.onAction(RoomAction.ChatSend)
            val reconciledId = vm.state.value.chat.pending.single().id
            events.emit(RealtimeEvent.Snapshot(snapshot.copy(chat=ChatPage(listOf(message.copy(id=reconciledId, identityId="test"))))))
            advanceTimeBy(30_000); runCurrent()
            assertEquals(2,sends.size)
            assertTrue(vm.state.value.chat.pending.isEmpty())
        } finally { vm.viewModelScope.cancel();Dispatchers.resetMain() }
    }

    @Test fun historyResponseCannotOverwriteNewerReconnectSnapshot() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        val response = CompletableDeferred<ChatPage>()
        val events = MutableSharedFlow<RealtimeEvent>(extraBufferCapacity = 8)
        val snapshot = RoomSnapshot(room,emptyList(),StreamInfo("",0,StreamState.EMPTY,""),ChatPage(listOf(message),true))
        val repository = object : RoomRepository by testRoomRepository {
            override suspend fun snapshot(roomId: String) = snapshot
            override suspend fun chatHistory(roomId: String, before: Long?) = response.await()
        }
        val realtime = object : RealtimeClient {
            override suspend fun connect(roomId: String) = object : RealtimeSession {
                override val events = events
                override suspend fun reportPlayback(streamSessionId: String, positionMs: Long, playing: Boolean) = Unit
                override suspend fun requestSync(streamSessionId: String, positionMs: Long, requestId: String) = Unit
                override suspend fun close() = Unit
            }
        }
        val vm=testRoomViewModel("room",true,testSessionRepository,repository,realtime,testVoiceClient,testSessionKeeper)
        try {
            vm.onAction(RoomAction.ChatLoadEarlier)
            events.emit(RealtimeEvent.Snapshot(snapshot.copy(chat=ChatPage(listOf(message.copy(id="new",sequence=10)),false))))
            response.complete(ChatPage(listOf(message.copy(id="stale",sequence=2)),false))
            runCurrent()
            assertEquals(listOf("new"),vm.state.value.chat.messages.map { it.id })
            assertFalse(vm.state.value.chat.loadingMore)
        } finally { vm.viewModelScope.cancel();Dispatchers.resetMain() }
    }
}
