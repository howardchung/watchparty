package top.roomio.app.room

import androidx.compose.runtime.Composable

@Composable
internal actual fun rememberMicPermissionHandler(onGranted: () -> Unit): () -> Unit = onGranted
