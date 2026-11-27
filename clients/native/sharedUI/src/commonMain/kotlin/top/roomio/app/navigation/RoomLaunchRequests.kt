package top.roomio.app.navigation

import androidx.compose.runtime.Composable
import kotlinx.coroutines.flow.Flow

/** A request raised outside the app, such as a notification tap, to open a room. */
internal sealed interface RoomLaunchRequest {
    data class Room(val roomId: String, val asOwner: Boolean) : RoomLaunchRequest
    data class Invite(val code: String) : RoomLaunchRequest
}

/**
 * Platform requests to open a specific room. Empty on platforms without a
 * persistent session surface that can launch the app into a room.
 */
@Composable
internal expect fun rememberRoomLaunchRequests(): Flow<RoomLaunchRequest>
