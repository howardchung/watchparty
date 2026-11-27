package top.roomio.app

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asSkiaBitmap
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.test.*
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import java.io.File
import org.jetbrains.skia.Image
import top.roomio.app.locale.AppLanguageEnvironment
import top.roomio.app.profile.*
import top.roomio.app.theme.LocalThemeIsDark
import top.roomio.app.theme.WatchPartyTheme
import top.roomio.domain.profile.AppLanguage
import kotlin.test.*

@OptIn(ExperimentalTestApi::class)
class AvatarNamesUiTest {
    @Test fun compactPersianLargeText() = checkSettings(360, 900, true)
    @Test fun expandedEnglish() = checkSettings(1200, 900, false)

    private fun checkSettings(width: Int, height: Int, persian: Boolean) = runComposeUiTest {
        val profile = TestProfileRepository()
        val viewModel = SettingsViewModel(profile, TestThemePreferencesRepository())
        if (persian) viewModel.onAction(SettingsAction.LanguageSelected(AppLanguage.PERSIAN))
        setContent {
            val density = LocalDensity.current
            CompositionLocalProvider(
                LocalThemeIsDark provides remember { mutableStateOf(persian) },
                LocalDensity provides Density(density.density, if (persian) 1.5f else 1f),
            ) {
                AppLanguageEnvironment(if (persian) AppLanguage.PERSIAN else AppLanguage.ENGLISH) {
                    WatchPartyTheme(darkTheme = persian) {
                        val state by viewModel.state.collectAsState()
                        Box(Modifier.size(width.dp, height.dp)) { SettingsScreen(state, viewModel::onAction) }
                    }
                }
            }
        }
        onAllNodes(hasSetTextAction()).assertCountEquals(0)
        onNodeWithContentDescription(if (persian) "ویرایش نام نمایشی" else "Edit display name").performClick()
        onNode(hasSetTextAction()).performTextReplacement("Riley")
        onNodeWithText(if (persian) "انتخاب نام" else "Use name").performClick()
        onNodeWithText(if (persian) "قورباغهٔ جادوگر" else "Frog Wizard").performScrollTo().performClick()
        runOnIdle { assertEquals("Riley", viewModel.state.value.displayName) }
        onNode(hasText(if (persian) "قورباغهٔ جادوگر" else "Frog Wizard") and isSelectable()).performScrollTo().assertIsSelected()
        File("/tmp/watchparty-spotlight-native-${if(persian) "compact-fa" else "expanded-en"}.png")
            .writeBytes(Image.makeFromBitmap(onRoot().captureToImage().asSkiaBitmap()).encodeToData()!!.bytes)
        onNodeWithText(if (persian) "ذخیره تغییرات" else "Save changes").assertIsEnabled().performClick()
        runOnIdle { assertEquals("Riley", profile.currentProfile().name) }
        onNodeWithText(if (persian) "مومیایی باریستا" else "Mummy Barista").performScrollTo().assertIsDisplayed()
        File("/tmp/watchparty-avatar-native-${if(persian) "compact-fa" else "expanded-en"}.png")
            .writeBytes(Image.makeFromBitmap(onRoot().captureToImage().asSkiaBitmap()).encodeToData()!!.bytes)
    }
}
