package top.roomio.app.platform

import android.app.Activity
import android.content.pm.ActivityInfo
import androidx.activity.OnBackPressedCallback
import androidx.activity.OnBackPressedDispatcherOwner
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.platform.LocalContext
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

@Composable
internal actual fun rememberFullscreenController(
    onExitRequested: () -> Unit,
): FullscreenController? {
    val activity = LocalContext.current as? Activity ?: return null
    val currentOnExit by rememberUpdatedState(onExitRequested)
    return remember(activity) {
        AndroidFullscreenController(activity) { currentOnExit() }
    }
}

private class AndroidFullscreenController(
    private val activity: Activity,
    private val onExitRequested: () -> Unit,
) : FullscreenController {
    private var backCallback: OnBackPressedCallback? = null

    override fun setFullscreen(enabled: Boolean) {
        if (enabled) {
            enter()
        } else {
            exit()
        }
    }

    private fun enter() {
        val window = activity.window
        WindowInsetsControllerCompat(window, window.decorView).apply {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
        activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE

        val callback = object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                onExitRequested()
            }
        }
        backCallback = callback
        (activity as? OnBackPressedDispatcherOwner)?.onBackPressedDispatcher?.addCallback(callback)
    }

    private fun exit() {
        val window = activity.window
        WindowInsetsControllerCompat(window, window.decorView).apply {
            show(WindowInsetsCompat.Type.systemBars())
        }
        activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
        backCallback?.remove()
        backCallback = null
    }
}
