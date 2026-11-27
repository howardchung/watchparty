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
class SettingsPickersUiTest {
    @Test fun compactPersianPickerStagesCancelsSearchesAndCommits() = checkPicker(true)
    @Test fun expandedEnglishPickerStagesCancelsSearchesAndCommits() = checkPicker(false)

    private fun checkPicker(persian: Boolean) = runComposeUiTest {
        val repository = TestProfileRepository()
        val vm = SettingsViewModel(repository, TestThemePreferencesRepository())
        val initial = if (persian) AppLanguage.PERSIAN else AppLanguage.ENGLISH
        val target = if (persian) AppLanguage.ENGLISH else AppLanguage.PERSIAN
        val targetName = if (persian) "English" else "فارسی"
        vm.onAction(SettingsAction.LanguageSelected(initial))
        setContent {
            val density = LocalDensity.current
            CompositionLocalProvider(LocalThemeIsDark provides remember { mutableStateOf(persian) },
                LocalDensity provides Density(density.density, if (persian) 1.5f else 1f)) {
                AppLanguageEnvironment(initial) {
                    WatchPartyTheme(darkTheme = persian) {
                        val state by vm.state.collectAsState()
                        Box(Modifier.size(if (persian) 360.dp else 1200.dp, 900.dp)) { SettingsScreen(state, vm::onAction) }
                    }
                }
            }
        }
        File("/tmp/watchparty-settings-compact-parity-${if (persian) "fa" else "en"}-profile.png")
            .writeBytes(Image.makeFromBitmap(onRoot().captureToImage().asSkiaBitmap()).encodeToData()!!.bytes)
        val colorsLabel = if (persian) "رنگ دلخواهت" else "Your colors"
        onNodeWithContentDescription(colorsLabel).performScrollTo()
        onAllNodes(isSelectable() and hasAnyAncestor(hasContentDescription(colorsLabel))).assertCountEquals(25)
        File("/tmp/watchparty-settings-integrated-${if (persian) "fa" else "en"}-colors.png")
            .writeBytes(Image.makeFromBitmap(onRoot().captureToImage().asSkiaBitmap()).encodeToData()!!.bytes)
        val trigger = if (persian) "زبان برنامه" else "App language"
        onNodeWithContentDescription(trigger).performScrollTo().performClick()
        onAllNodes(isSelectable() and hasAnyAncestor(isDialog())).assertCountEquals(2)
        onNode(hasText(targetName) and isSelectable()).performClick()
        onNodeWithText(if (persian) "انصراف" else "Cancel").performClick()
        runOnIdle { assertEquals(initial, vm.state.value.draftLanguage) }
        onNodeWithContentDescription(trigger).performClick()
        onNode(hasSetTextAction()).performTextInput("not-a-language")
        onNodeWithText(if (persian) "زبانی پیدا نشد" else "No languages found").assertIsDisplayed()
        onNodeWithText(if (persian) "نمایش همه زبان‌ها" else "Show all languages").performClick()
        onNode(hasText(targetName) and isSelectable()).performClick()
        File("/tmp/watchparty-settings-integrated-${if (persian) "fa" else "en"}-dialog.png")
            .writeBytes(Image.makeFromBitmap(onNode(isDialog()).captureToImage().asSkiaBitmap()).encodeToData()!!.bytes)
        onNodeWithText("${if (persian) "انتخاب" else "Use"} $targetName").performClick()
        runOnIdle {
            assertEquals(target, vm.state.value.draftLanguage)
            assertEquals(AppLanguage.ENGLISH, repository.currentProfile().language)
        }
    }
}
