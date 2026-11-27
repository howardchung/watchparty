package top.roomio.app.locale

import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.runComposeUiTest
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import androidx.lifecycle.compose.LocalLifecycleOwner
import java.util.Locale
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlinx.coroutines.runBlocking
import org.jetbrains.compose.resources.getString
import watchparty.sharedui.generated.resources.Res
import watchparty.sharedui.generated.resources.roomio

@OptIn(ExperimentalTestApi::class)
class AppLanguageLifecycleEffectTest {
    @Test
    fun resumeRestoresLatestLanguageWithoutRecreatingContentAndDisposalRemovesObserver() = runComposeUiTest {
        val originalLocale = Locale.getDefault()
        val owner = object : LifecycleOwner {
            override val lifecycle = LifecycleRegistry.createUnsafe(this)
        }
        val language = mutableStateOf("en")
        val visible = mutableStateOf(true)
        var contentCreations = 0
        try {
            owner.lifecycle.currentState = Lifecycle.State.RESUMED
            setContent {
                CompositionLocalProvider(LocalLifecycleOwner provides owner) {
                    if (visible.value) {
                        AppLanguageLifecycleEffect(language.value) { Locale.setDefault(Locale.forLanguageTag(it)) }
                        remember { contentCreations++ }
                    }
                }
            }
            runOnIdle {
                assertEquals("watchparty", runBlocking { getString(Res.string.roomio) })
                language.value = "fa"
            }
            runOnIdle {
                assertEquals("watchparty", runBlocking { getString(Res.string.roomio) })
                owner.lifecycle.currentState = Lifecycle.State.CREATED
                Locale.setDefault(Locale.US) // Simulate Android restoring the device locale in background.
                owner.lifecycle.currentState = Lifecycle.State.STARTED
                assertEquals("watchparty", runBlocking { getString(Res.string.roomio) })
                Locale.setDefault(Locale.US)
                owner.lifecycle.currentState = Lifecycle.State.RESUMED
                assertEquals("watchparty", runBlocking { getString(Res.string.roomio) })
                assertEquals(1, contentCreations)
                language.value = "en"
            }
            runOnIdle {
                owner.lifecycle.currentState = Lifecycle.State.CREATED
                Locale.setDefault(Locale.forLanguageTag("fa"))
                owner.lifecycle.currentState = Lifecycle.State.RESUMED
                assertEquals("watchparty", runBlocking { getString(Res.string.roomio) })
                visible.value = false
            }
            runOnIdle {
                owner.lifecycle.currentState = Lifecycle.State.CREATED
                Locale.setDefault(Locale.forLanguageTag("fa"))
                owner.lifecycle.currentState = Lifecycle.State.RESUMED
                assertEquals("fa", Locale.getDefault().language)
            }
        } finally {
            Locale.setDefault(originalLocale)
        }
    }
}
