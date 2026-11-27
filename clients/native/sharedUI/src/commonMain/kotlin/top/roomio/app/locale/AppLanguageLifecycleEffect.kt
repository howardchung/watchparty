package top.roomio.app.locale

import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.rememberUpdatedState
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner

/** Android can restore the system locale while the existing composition is stopped. */
@Composable
internal fun AppLanguageLifecycleEffect(tag: String, applyLanguage: (String) -> Unit) {
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    val currentApplyLanguage = rememberUpdatedState(applyLanguage)
    DisposableEffect(lifecycle, tag) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_START || event == Lifecycle.Event.ON_RESUME) {
                currentApplyLanguage.value(tag)
            }
        }
        lifecycle.addObserver(observer)
        onDispose { lifecycle.removeObserver(observer) }
    }
}
