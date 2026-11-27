package top.roomio.app.platform

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember

@Composable
internal actual fun rememberNotificationPermissionRequest(): () -> Unit = remember { {} }
