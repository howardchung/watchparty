package top.roomio.app

import androidx.compose.runtime.*
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.height
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.test.*
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import kotlin.test.*
import top.roomio.app.locale.AppLanguageEnvironment
import top.roomio.app.profile.SettingsAction
import top.roomio.app.profile.SettingsScreen
import top.roomio.app.profile.SettingsViewModel
import top.roomio.app.theme.LocalThemeIsDark
import top.roomio.app.theme.WatchPartyTheme
import top.roomio.domain.profile.AppLanguage

@OptIn(ExperimentalTestApi::class)
class PersianLanguageTest {
    @Test
    fun savedLanguageChangesResourcesAndDirectionAndCanReturnToEnglish() = runComposeUiTest {
        val repository = TestProfileRepository()
        val viewModel = SettingsViewModel(repository, TestThemePreferencesRepository())
        val language = mutableStateOf(AppLanguage.ENGLISH)
        var direction = LayoutDirection.Ltr
        setContent {
            AppLanguageEnvironment(language.value) {
                val state by viewModel.state.collectAsState()
                direction = LocalLayoutDirection.current
                CompositionLocalProvider(LocalThemeIsDark provides remember { mutableStateOf(false) }) {
                    WatchPartyTheme(darkTheme = false) {
                        Box(Modifier.width(360.dp).height(900.dp)) { SettingsScreen(state, viewModel::onAction) }
                    }
                }
            }
        }
        onNodeWithContentDescription("App language").performScrollTo().performClick()
        onNode(hasText("فارسی") and isSelectable()).performClick()
        onNodeWithText("Use فارسی").performClick()
        runOnIdle {
            assertEquals(AppLanguage.PERSIAN, viewModel.state.value.draftLanguage)
            assertEquals(AppLanguage.ENGLISH, repository.currentProfile().language)
            viewModel.onAction(SettingsAction.SaveClicked)
            language.value = repository.currentProfile().language
        }
        onNodeWithText("به سلیقه خودت").assertExists()
        runOnIdle { assertEquals(LayoutDirection.Rtl, direction) }
        onNodeWithContentDescription("زبان برنامه").performScrollTo().performClick()
        onNode(hasText("English") and isSelectable()).performClick()
        onNodeWithText("انتخاب English").performClick()
        runOnIdle {
            viewModel.onAction(SettingsAction.SaveClicked)
            language.value = repository.currentProfile().language
        }
        onNodeWithText("Make yourself at home").assertExists()
        runOnIdle { assertEquals(LayoutDirection.Ltr, direction) }
    }
}
