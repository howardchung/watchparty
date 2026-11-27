package top.roomio.domain.party

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow

/**
 * Keeps a room session alive while the app is in the background. Android runs a
 * foreground service so the realtime connection and voice call survive; other
 * platforms do nothing.
 */
interface SessionKeeper {
    /**
     * Starts or updates the background session for [room]. The room context lets
     * the platform session surface (an Android notification) return the user to
     * the room and act on the voice call.
     */
    fun start(room: RoomSession)

    /** Confirms platform microphone protection before capture is initialized. */
    suspend fun ensureMicrophone(room: RoomSession) { start(room) }

    /** Stops the background session once the user leaves the room. */
    fun stop()

    /**
     * Stops the background session because the app closed without an explicit
     * in-room leave. Platforms that can still reach the backend first report the
     * departure so other participants stop seeing this device, then stop the
     * session. The default simply stops the session.
     */
    fun stopAndLeave() {
        stop()
    }

    /**
     * Actions raised from outside the room UI, such as notification buttons.
     * Empty on platforms without a persistent session surface.
     */
    val actions: Flow<SessionAction>
        get() = emptyFlow()
}

/** The room kept alive by the platform's background session surface. */
data class RoomSession(
    val roomId: String,
    val asOwner: Boolean,
    val voiceActive: Boolean,
    val micMuted: Boolean,
)

/**
 * Intent extras carried by the platform session surface so a tap on its
 * notification reopens the owning room on every platform that has one.
 */
object RoomSessionExtras {
    const val ROOM_ID = "top.roomio.roomId"
    const val AS_OWNER = "top.roomio.roomAsOwner"
}

/** A user intent raised by the platform's background session surface. */
sealed interface SessionAction {
    /** Platform microphone foreground protection was lost; capture must stop. */
    data object MicrophoneServiceLost : SessionAction

    /** The user asked to turn the local microphone on from the notification. */
    data object UnmuteVoice : SessionAction

    /** The user asked to turn the local microphone off from the notification. */
    data object MuteVoice : SessionAction

    /** The user asked to leave the room from the notification. */
    data object Leave : SessionAction
}
