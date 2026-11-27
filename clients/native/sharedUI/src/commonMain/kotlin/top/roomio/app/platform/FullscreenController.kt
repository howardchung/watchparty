package top.roomio.app.platform

import androidx.compose.runtime.Composable

internal interface FullscreenController {
    fun setFullscreen(enabled: Boolean)
}

@Composable
internal expect fun rememberFullscreenController(
    onExitRequested: () -> Unit,
): FullscreenController?
