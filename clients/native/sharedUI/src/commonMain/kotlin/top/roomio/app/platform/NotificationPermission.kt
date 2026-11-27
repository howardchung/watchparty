package top.roomio.app.platform

import androidx.compose.runtime.Composable

/**
 * Returns a function that asks for permission to post notifications (when the
 * platform needs one) so the background room notification stays visible.
 * Platforms without a notification permission model return a no-op.
 */
@Composable
internal expect fun rememberNotificationPermissionRequest(): () -> Unit
