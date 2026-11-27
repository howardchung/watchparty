package top.roomio.app.navigation

import androidx.compose.runtime.Composable
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow

@Composable
internal actual fun rememberRoomLaunchRequests(): Flow<RoomLaunchRequest> = emptyFlow()
