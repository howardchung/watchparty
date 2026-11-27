package top.roomio.app

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.runComposeUiTest
import top.roomio.app.theme.WatchPartyTheme
import top.roomio.app.theme.ThemeLauncherIcon
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import top.roomio.app.theme.synchronizeThemeLauncherIcon
import top.roomio.domain.launcher.LauncherIconColor
import top.roomio.domain.launcher.LauncherIconController
import top.roomio.domain.launcher.launcherIconColor
import top.roomio.domain.profile.ThemeColor

@OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class, ExperimentalTestApi::class)
class ThemeLauncherIconTest {
    @Test fun compositionRestoresAndTracksThemeWithoutSwitchingForDarkMode() = runComposeUiTest {
        val controller = FakeIcons()
        var selected by mutableStateOf(ThemeColor.WISTERIA)
        var dark by mutableStateOf(false)
        setContent {
            WatchPartyTheme(darkTheme = dark, themeColor = selected) {
                Box { ThemeLauncherIcon(selected, controller) }
            }
        }
        waitForIdle()
        assertEquals(listOf(LauncherIconColor.WISTERIA), controller.selections)
        runOnIdle { dark = true }
        waitForIdle()
        assertEquals(1, controller.selections.size)
        runOnIdle { selected = ThemeColor.TOMATO }
        waitForIdle()
        assertEquals(listOf(LauncherIconColor.WISTERIA, LauncherIconColor.TOMATO), controller.selections)
    }

    @Test fun failureSnackbarOffersWorkingRetryAndClearsAfterSuccess() = runComposeUiTest {
        val controller = FakeIcons().apply { failuresRemaining = 1 }
        setContent {
            WatchPartyTheme {
                Box { ThemeLauncherIcon(ThemeColor.COBALT, controller) }
            }
        }
        onNodeWithText("Your theme is saved, but the app icon couldn’t be updated.").assertIsDisplayed()
        onNodeWithText("Retry").performClick()
        waitForIdle()
        assertEquals(List(2) { LauncherIconColor.COBALT }, controller.selections)
        onNodeWithText("Your theme is saved, but the app icon couldn’t be updated.").assertDoesNotExist()
    }

    @Test fun everyNamedThemeMapsToItsOwnIconAndDefaultMapsToBasil() {
        assertEquals(LauncherIconColor.BASIL, ThemeColor.ROOMIO.launcherIconColor())
        val named = ThemeColor.entries.filter { it != ThemeColor.ROOMIO }
        assertEquals(LauncherIconColor.entries.size, named.size)
        named.forEach { assertEquals(it.name, it.launcherIconColor().name) }
    }

    @Test fun restoredThemeSynchronizesWithoutOpeningSettings() = runTest {
        val preferences = TestThemePreferencesRepository()
        preferences.selectColor(ThemeColor.WISTERIA).getOrThrow()
        val controller = FakeIcons()
        synchronizeThemeLauncherIcon(preferences.color.value, controller) { error("No failure expected") }
        assertEquals(listOf(LauncherIconColor.WISTERIA), controller.selections)
    }

    @Test fun iconFailureKeepsSavedThemeAndRetriesTheSameColor() = runTest {
        val preferences = TestThemePreferencesRepository()
        preferences.selectColor(ThemeColor.CHERRY_BLOSSOM).getOrThrow()
        val controller = FakeIcons().apply { failuresRemaining = 1 }
        var retryPrompts = 0
        synchronizeThemeLauncherIcon(preferences.color.value, controller) {
            retryPrompts++
            assertEquals(ThemeColor.CHERRY_BLOSSOM, preferences.color.value)
            true
        }
        assertEquals(1, retryPrompts)
        assertEquals(List(2) { LauncherIconColor.CHERRY_BLOSSOM }, controller.selections)
    }

    @Test fun dismissStopsRetryAndNextLaunchReconcilesSavedTheme() = runTest {
        val controller = FakeIcons().apply { failuresRemaining = 1 }
        synchronizeThemeLauncherIcon(ThemeColor.COBALT, controller) { false }
        assertEquals(1, controller.selections.size)
        synchronizeThemeLauncherIcon(ThemeColor.COBALT, controller) { error("No failure expected") }
        assertEquals(List(2) { LauncherIconColor.COBALT }, controller.selections)
    }

    @Test fun changingThemeCancelsOldRetryBeforeApplyingNewColor() = runTest {
        val controller = FakeIcons().apply { failuresRemaining = 1 }
        val waitingForRetry = CompletableDeferred<Unit>()
        val oldColor = launch {
            synchronizeThemeLauncherIcon(ThemeColor.TOMATO, controller) {
                waitingForRetry.complete(Unit)
                CompletableDeferred<Boolean>().await()
            }
        }
        runCurrent()
        assertTrue(waitingForRetry.isCompleted)
        oldColor.cancelAndJoin()
        synchronizeThemeLauncherIcon(ThemeColor.ROOMIO, controller) { error("No failure expected") }
        assertEquals(listOf(LauncherIconColor.TOMATO, LauncherIconColor.BASIL), controller.selections)
    }

    @Test fun unsupportedPlatformsDoNotAttemptSelectionOrShowFailure() = runTest {
        val controller = FakeIcons(supported = false)
        synchronizeThemeLauncherIcon(ThemeColor.TOMATO, controller) { error("Must not show failure") }
        assertTrue(controller.selections.isEmpty())
    }

    private class FakeIcons(supported: Boolean = true) : LauncherIconController {
        override val isSupported = supported
        val selections = mutableListOf<LauncherIconColor>()
        var failuresRemaining = 0
        override fun currentColor() = Result.success(selections.lastOrNull() ?: LauncherIconColor.BASIL)
        override fun selectColor(color: LauncherIconColor): Result<Unit> {
            selections += color
            return if (failuresRemaining-- > 0) Result.failure(IllegalStateException("Launcher unavailable"))
            else Result.success(Unit)
        }
    }
}
