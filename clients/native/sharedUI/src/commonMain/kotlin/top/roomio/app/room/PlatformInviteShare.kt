package top.roomio.app.room

import androidx.compose.runtime.Composable

/** Null on platforms that retain the invite-link clipboard action. Returns launch success only. */
@Composable
internal expect fun rememberPlatformInviteShare(): ((String) -> Boolean)?
