package top.roomio.app.room

import androidx.compose.runtime.Composable

/**
 * Returns a function that requests microphone permission (when needed) and
 * then invokes [onGranted]. Platforms without a permission model simply return
 * [onGranted].
 */
@Composable
internal expect fun rememberMicPermissionHandler(onGranted: () -> Unit): () -> Unit
