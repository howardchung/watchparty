package top.roomio.app.locale

import android.content.res.Configuration
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import java.util.Locale

@Composable
internal actual fun PlatformLanguageEnvironment(tag: String, content: @Composable () -> Unit) {
    // Compose resource locale and background notification strings follow the saved choice.
    Locale.setDefault(Locale.forLanguageTag(tag))
    val configuration = LocalConfiguration.current
    val localized = remember(configuration, tag) {
        Configuration(configuration).apply { setLocale(Locale.forLanguageTag(tag)) }
    }
    val resources = LocalContext.current.resources
    AppLanguageLifecycleEffect(tag) { savedTag ->
        val locale = Locale.forLanguageTag(savedTag)
        Locale.setDefault(locale)
        // LocalConfiguration alone does not update Android's resource configuration.
        // Keep the Activity context intact for fullscreen, sharing and activity results.
        val restored = Configuration(resources.configuration).apply { setLocale(locale) }
        if (restored != resources.configuration) {
            @Suppress("DEPRECATION")
            resources.updateConfiguration(restored, resources.displayMetrics)
        }
    }
    // Preserve the Activity in LocalContext for fullscreen, sharing and activity results.
    CompositionLocalProvider(LocalConfiguration provides localized, content = content)
}
