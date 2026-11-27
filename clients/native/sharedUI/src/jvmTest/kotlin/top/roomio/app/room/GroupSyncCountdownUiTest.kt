package top.roomio.app.room

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.test.*
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import top.roomio.app.locale.AppLanguageEnvironment
import top.roomio.app.theme.LocalThemeIsDark
import top.roomio.app.theme.WatchPartyTheme
import top.roomio.domain.profile.AppLanguage
import kotlin.test.Test

@OptIn(ExperimentalTestApi::class)
class GroupSyncCountdownUiTest {
    @Test fun countdownDoesNotShareCenterWithPausedPlaybackButton() = runComposeUiTest {
        val countdown = mutableStateOf<String?>("3")
        val fullscreen = mutableStateOf(false)
        val locked = mutableStateOf(true)
        val persian = mutableStateOf(false)
        val model = RoomScreenModel("Movie night", "ABCD2345", RoomRole.OWNER, "Nika", true, RoomPlaybackState.PAUSED, emptyList())
        setContent {
            val density = LocalDensity.current
            AppLanguageEnvironment(if (persian.value) AppLanguage.PERSIAN else AppLanguage.ENGLISH) {
                CompositionLocalProvider(
                    LocalThemeIsDark provides remember { mutableStateOf(false) },
                    LocalDensity provides Density(density.density, if (persian.value) 1.5f else 1f),
                ) {
                    WatchPartyTheme(darkTheme = persian.value) {
                        Box(Modifier.width(if (fullscreen.value) 900.dp else 360.dp).height(900.dp)) {
                            RoomScreen(
                                state = RoomUiState(model, syncLocked = locked.value, syncCountdown = countdown.value, fullscreenMode = fullscreen.value),
                                playerContent = { Box(it) },
                            )
                        }
                    }
                }
            }
        }
        for (wide in listOf(false, true)) {
            for (rtl in listOf(false, true)) {
                runOnIdle { fullscreen.value = wide; persian.value = rtl }
                for (value in listOf("3", "2", "1", "Action")) {
                    runOnIdle { countdown.value = value }
                    onNodeWithText(if (rtl && value == "Action") "حرکت" else value).assertIsDisplayed()
                    // Only the transport button remains; the large central button must be absent.
                    onAllNodesWithContentDescription(if (rtl) "فیلم" else "Play").assertCountEquals(1)
                }
            }
        }
        runOnIdle { fullscreen.value = false; persian.value = false; countdown.value = null; locked.value = false }
        onAllNodesWithContentDescription("Play").assertCountEquals(2)
    }
}
