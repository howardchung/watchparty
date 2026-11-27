package top.roomio.app.platform

import androidx.compose.runtime.Composable

@Composable
internal actual fun rememberFullscreenController(
    onExitRequested: () -> Unit,
): FullscreenController? = null
