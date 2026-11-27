package top.roomio.app.locale

import androidx.compose.runtime.Composable
import androidx.compose.runtime.key
import androidx.compose.runtime.remember
import androidx.compose.runtime.DisposableEffect
import java.util.Locale

@Composable
internal actual fun PlatformLanguageEnvironment(tag: String, content: @Composable () -> Unit) {
    val original = remember { Locale.getDefault() }
    DisposableEffect(Unit) { onDispose { Locale.setDefault(original) } }
    // Compose resources on desktop read the JVM default locale.
    Locale.setDefault(Locale.forLanguageTag(tag))
    key(tag) { content() }
}
