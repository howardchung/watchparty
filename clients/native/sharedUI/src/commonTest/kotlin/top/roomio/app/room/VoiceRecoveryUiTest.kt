package top.roomio.app.room

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.test.*
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import kotlin.test.Test
import kotlin.test.assertEquals
import top.roomio.app.theme.LocalThemeIsDark
import top.roomio.app.theme.WatchPartyTheme
import top.roomio.domain.party.VoicePeerStatus

@OptIn(ExperimentalTestApi::class)
class VoiceRecoveryUiTest {
    @Test
    fun failedJoinExplainsNetworkFailureAndKeepsRetryAccessible() = runComposeUiTest {
        val failureCode = mutableStateOf<String?>("NETWORK")
        val dark = mutableStateOf(false)
        var joins = 0
        setContent {
            val density = LocalDensity.current
            CompositionLocalProvider(
                LocalThemeIsDark provides dark,
                LocalLayoutDirection provides if (dark.value) LayoutDirection.Rtl else LayoutDirection.Ltr,
                LocalDensity provides Density(density.density, if (dark.value) 1.8f else 1f),
            ) {
                WatchPartyTheme(darkTheme = dark.value) {
                    Box(Modifier.width(360.dp).height(900.dp)) {
                        RoomScreen(
                            state = RoomUiState(
                                model = RoomScreenModel("Friday screening", "MOON-42", RoomRole.GUEST,
                                    "Nika", true, RoomPlaybackState.WAITING_FOR_OWNER, emptyList()),
                                voiceState = VoiceConnectionState.FAILED,
                                voiceFailureCode = failureCode.value,
                                micMuted = true,
                            ),
                            onAction = { if (it == RoomAction.JoinVoiceClicked) joins++ },
                            playerContent = { Box(it) },
                        )
                    }
                }
            }
        }
        val networkMessage = "Could not reach voice. Check your connection and try again."
        onNodeWithText(networkMessage).performScrollTo().assertIsDisplayed()
        onNodeWithText("Voice is unavailable on this device").assertDoesNotExist()
        onNodeWithText("Join voice").performScrollTo().performClick()
        runOnIdle { dark.value = true }
        onNodeWithText(networkMessage).performScrollTo().assertIsDisplayed()
        onNodeWithText("Join voice").performScrollTo().performClick()
        runOnIdle { failureCode.value = "VOICE_CONNECTION_FAILED" }
        onNodeWithText("Could not join voice. Try again.").performScrollTo().assertIsDisplayed()
        onNodeWithText("Join voice").performScrollTo().performClick()
        runOnIdle { assertEquals(3, joins) }
    }

    @Test
    fun failedPeerRetryRemainsAccessibleInCompactLightAndDarkRtlLargeText() = runComposeUiTest {
        val dark = mutableStateOf(false)
        var retries = 0
        setContent {
            val density = LocalDensity.current
            CompositionLocalProvider(
                LocalThemeIsDark provides dark,
                LocalLayoutDirection provides if (dark.value) LayoutDirection.Rtl else LayoutDirection.Ltr,
                LocalDensity provides Density(density.density, if (dark.value) 1.8f else 1f),
            ) {
                WatchPartyTheme(darkTheme = dark.value) {
                    Box(Modifier.width(360.dp).height(900.dp)) {
                        RoomScreen(
                            state = RoomUiState(
                                model = RoomScreenModel("Friday screening", "MOON-42", RoomRole.GUEST,
                                    "Nika", true, RoomPlaybackState.WAITING_FOR_OWNER,
                                    listOf(RoomParticipant("Mira", RoomAvatar.COMET, voiceStatus = VoicePeerStatus.UNAVAILABLE))),
                                voiceState = VoiceConnectionState.DEGRADED,
                                micMuted = true,
                            ),
                            onAction = { if (it == RoomAction.RetryVoiceConnections) retries++ },
                            playerContent = { Box(it) },
                        )
                    }
                }
            }
        }
        onNodeWithText("Voice unavailable").performScrollTo().assertIsDisplayed()
        onNodeWithText("Retry voice connections").performScrollTo().performClick()
        runOnIdle { dark.value = true }
        onNodeWithText("Voice unavailable").performScrollTo().assertIsDisplayed()
        onNodeWithText("Retry voice connections").performScrollTo().performClick()
        runOnIdle { assertEquals(2, retries) }
    }
}
