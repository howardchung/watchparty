package top.roomio.app.navigation

import android.content.Intent
import androidx.activity.ComponentActivity
import androidx.activity.compose.LocalActivity
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.core.util.Consumer
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.receiveAsFlow
import top.roomio.domain.party.RoomSessionExtras

@Composable
internal actual fun rememberRoomLaunchRequests(): Flow<RoomLaunchRequest> {
    val activity = LocalActivity.current as? ComponentActivity
    val requests = remember {
        Channel<RoomLaunchRequest>(
            capacity = 4,
            onBufferOverflow = BufferOverflow.DROP_OLDEST,
        )
    }
    val flow = remember(requests) { requests.receiveAsFlow() }
    DisposableEffect(activity) {
        if (activity == null) return@DisposableEffect onDispose { }
        val listener = Consumer<Intent> { intent ->
            intent.consumeRoomLaunch()?.let { requests.trySend(it) }
        }
        activity.addOnNewIntentListener(listener)
        activity.intent?.consumeRoomLaunch()?.let { requests.trySend(it) }
        onDispose { activity.removeOnNewIntentListener(listener) }
    }
    return flow
}

/**
 * Reads and clears the room extras so a recycled activity intent cannot reopen
 * a room the user has already left.
 */
private fun Intent.consumeRoomLaunch(): RoomLaunchRequest? {
    if (action == Intent.ACTION_VIEW) {
        val code = dataString?.let(RoomInviteLinks::codeFrom)
        data = null
        return code?.let(RoomLaunchRequest::Invite)
    }
    val roomId = getStringExtra(RoomSessionExtras.ROOM_ID) ?: return null
    val asOwner = getBooleanExtra(RoomSessionExtras.AS_OWNER, false)
    removeExtra(RoomSessionExtras.ROOM_ID)
    removeExtra(RoomSessionExtras.AS_OWNER)
    return RoomLaunchRequest.Room(roomId, asOwner)
}
