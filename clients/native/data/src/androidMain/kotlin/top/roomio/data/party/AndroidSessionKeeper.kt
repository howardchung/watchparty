package top.roomio.data.party

import top.roomio.data.diagnostics.logHandledException
import top.roomio.data.diagnostics.loggedRunCatching

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Build
import android.os.IBinder
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import top.roomio.domain.party.*

internal actual fun createSessionKeeper(roomRepository: RoomRepository): SessionKeeper =
    AndroidSessionKeeper(AppContextHolder.appContext, roomRepository)

/** Application-owned binding; framework service never looks up the dependency graph. */
internal class AndroidSessionKeeper(
    private val context: Context,
    private val roomRepository: RoomRepository,
) : SessionKeeper {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val mutableActions = MutableSharedFlow<SessionAction>(extraBufferCapacity = 8)
    override val actions = mutableActions.asSharedFlow()
    private var current: RoomSession? = null
    private var revision = 0L
    private var binder: RoomSessionService.SessionBinder? = null
    private var binding: CompletableDeferred<RoomSessionService.SessionBinder>? = null
    private var bound = false
    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val local = service as? RoomSessionService.SessionBinder
            if (local == null) {
                binding?.completeExceptionally(PartyException("VOICE_SERVICE_UNAVAILABLE", "Room service binding failed"))
                return
            }
            binder = local
            local.register { action -> mutableActions.tryEmit(action) }
            binding?.complete(local)
        }
        override fun onServiceDisconnected(name: ComponentName?) { loseBinding() }
        override fun onNullBinding(name: ComponentName?) { loseBinding() }
        override fun onBindingDied(name: ComponentName?) { loseBinding() }
    }

    private fun loseBinding() {
        binder = null
        binding?.completeExceptionally(PartyException("VOICE_SERVICE_UNAVAILABLE", "Microphone service disconnected"))
        binding = null
        if (bound) { loggedRunCatching("AndroidSessionKeeper.run3") { context.unbindService(connection) }; bound = false }
        if (current != null) mutableActions.tryEmit(SessionAction.MicrophoneServiceLost)
    }

    override fun start(room: RoomSession) {
        current = room
        val expectedRevision = ++revision
        scope.launch {
            loggedRunCatching("AndroidSessionKeeper.run4") {
                val service = service(room)
                if (revision == expectedRevision && current?.roomId == room.roomId) service.update(room)
            }.onFailure {
                // A failed update cannot leave the UI claiming a live microphone.
                if (revision == expectedRevision && current?.roomId == room.roomId)
                    mutableActions.tryEmit(SessionAction.MicrophoneServiceLost)
            }
        }
    }

    override suspend fun ensureMicrophone(room: RoomSession) = withContext(Dispatchers.Main.immediate) {
        current = room
        revision++
        try {
            withTimeout(5_000) { service(room).confirmMicrophone(room) }
        } catch (error: Throwable) {
            logHandledException("AndroidSessionKeeper.catch1", error)
            currentCoroutineContext().ensureActive()
            throw PartyException("VOICE_SERVICE_UNAVAILABLE", "Microphone foreground service could not start")
        }
    }

    private suspend fun service(room: RoomSession): RoomSessionService.SessionBinder {
        binder?.let { return it }
        binding?.let { return it.await() }
        val pending = CompletableDeferred<RoomSessionService.SessionBinder>()
        binding = pending
        try {
            val intent = Intent(context, RoomSessionService::class.java).apply {
                action = RoomSessionService.ACTION_START
                putExtra(RoomSessionService.EXTRA_ROOM_ID, room.roomId)
                putExtra(RoomSessionService.EXTRA_ROOM_AS_OWNER, room.asOwner)
                putExtra(RoomSessionService.EXTRA_VOICE_ACTIVE, room.voiceActive)
                putExtra(RoomSessionService.EXTRA_MIC_MUTED, room.micMuted)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) context.startForegroundService(intent)
            else context.startService(intent)
            bound = context.bindService(intent, connection, Context.BIND_AUTO_CREATE)
            check(bound) { "Room service binding rejected" }
            return pending.await()
        } catch (error: Throwable) {
            logHandledException("AndroidSessionKeeper.catch2", error)
            pending.completeExceptionally(error)
            if (binding === pending) binding = null
            throw error
        }
    }

    override fun stop() {
        revision++
        current = null
        scope.launch {
            binder?.register(null)
            binder = null
            binding?.cancel()
            binding = null
            if (bound) { loggedRunCatching("AndroidSessionKeeper.run5") { context.unbindService(connection) }; bound = false }
            context.stopService(Intent(context, RoomSessionService::class.java))
        }
    }

    override fun stopAndLeave() {
        val room = current
        current = null
        val leavingRevision = ++revision
        scope.launch {
            if (room != null) withTimeoutOrNull(5_000) { loggedRunCatching("AndroidSessionKeeper.run6") { roomRepository.leave(room.roomId) } }
            if (revision == leavingRevision && current == null) stop()
        }
    }
}
