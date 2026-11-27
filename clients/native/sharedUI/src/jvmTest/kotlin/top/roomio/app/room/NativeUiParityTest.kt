package top.roomio.app.room

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asSkiaBitmap
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.test.*
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import java.io.File
import org.jetbrains.skia.Image
import top.roomio.app.locale.AppLanguageEnvironment
import top.roomio.app.theme.AppTheme
import top.roomio.app.theme.LocalThemeIsDark
import top.roomio.app.theme.WatchPartyTheme
import top.roomio.domain.party.*
import top.roomio.domain.profile.AppLanguage
import kotlin.test.*

@OptIn(ExperimentalTestApi::class)
class NativeUiParityTest {
    @Test fun touchChatHasNoDesktopHintAndUsesNativeSendWithoutLosingNewlines() = runComposeUiTest {
        val state = mutableStateOf(RoomChatState(connected = true, loading = false))
        val actions = mutableListOf<RoomAction>()
        val persian = mutableStateOf(false)
        setContent {
            val density = LocalDensity.current
            AppLanguageEnvironment(if (persian.value) AppLanguage.PERSIAN else AppLanguage.ENGLISH) {
                CompositionLocalProvider(LocalDensity provides Density(density.density, if (persian.value) 1.5f else 1f)) {
                    WatchPartyTheme(darkTheme = persian.value) {
                        Column(Modifier.width(360.dp).height(900.dp).verticalScroll(rememberScrollState())) {
                            RoomChatPanel(state.value, { action ->
                                actions += action
                                if (action is RoomAction.ChatDraftChanged) state.value = state.value.copy(draft = action.text)
                            }, desktopInput = false)
                        }
                    }
                }
            }
        }
        onNodeWithText("Ctrl + Enter to send").assertDoesNotExist()
        onNodeWithContentDescription("Send message").performScrollTo().assertIsNotEnabled()
        onNodeWithContentDescription("Message the party").performScrollTo().performTextInput("Hello")
        onNodeWithContentDescription("Message the party").performKeyInput { pressKey(Key.Enter) }
        runOnIdle { assertEquals("Hello\n", state.value.draft); assertFalse(RoomAction.ChatSend in actions) }
        onNodeWithContentDescription("Message the party").performImeAction()
        runOnIdle { assertEquals(1, actions.count { it == RoomAction.ChatSend }) }
        onNodeWithContentDescription("Add emoji").performClick()
        onNodeWithText("🍿").performClick()
        runOnIdle { assertTrue(state.value.draft.contains("🍿")); state.value = state.value.copy(connected = false) }
        onNodeWithContentDescription("Send message").performScrollTo().assertIsEnabled()
        runOnIdle { persian.value = true; state.value = state.value.copy(connected = true) }
        onNodeWithText("ارسال با Ctrl + Enter").assertDoesNotExist()
        onNodeWithContentDescription("ارسال پیام").performScrollTo().assertIsEnabled()
        File("/tmp/watchparty-ui-parity-chat-fa.png").writeBytes(Image.makeFromBitmap(onRoot().captureToImage().asSkiaBitmap()).encodeToData()!!.bytes)
    }

    @Test fun syncEntryUsesOwnerViewerAndActiveLabelsInNormalAndFullscreen() = runComposeUiTest {
        val model = RoomScreenModel("Movie night", "ABCD2345", RoomRole.OWNER, "Nika", true, RoomPlaybackState.PLAYING, emptyList())
        val state = mutableStateOf(RoomUiState(model, chat = RoomChatState(connected = true, loading = false)))
        val actions = mutableListOf<RoomAction>()
        setContent {
            AppTheme(onThemeChanged = {}) {
                Box(Modifier.width(360.dp).height(900.dp)) { RoomScreen(state.value, onAction = { actions += it }, playerContent = { Box(it) }) }
            }
        }
        onNodeWithText("Ask everyone to sync").performScrollTo().assertIsEnabled().performClick()
        runOnIdle { assertEquals<RoomAction>(RoomAction.SyncClicked, actions.last()); state.value = state.value.copy(fullscreenMode = true) }
        onNodeWithContentDescription("Ask everyone to sync").assertExists()
        runOnIdle { state.value = state.value.copy(model = model.copy(role = RoomRole.GUEST)) }
        onNodeWithContentDescription("Sync to room").assertExists()
        val attempt = GroupSyncAttempt("request", "stream", 1, "owner", 1000, 0, 1, GroupSyncPhase.INVITING, emptyList())
        runOnIdle { state.value = state.value.copy(groupSync = attempt) }
        onNodeWithContentDescription("View sync").assertExists()
        runOnIdle { state.value = state.value.copy(fullscreenMode = false) }
        onNodeWithText("View sync").performScrollTo().assertIsEnabled()
        runOnIdle { state.value = state.value.copy(chat = state.value.chat.copy(connected = false)) }
        onNodeWithText("View sync").assertIsNotEnabled()
    }

    @Test fun participantCardsUseCompactGridAndReadableRowsAtLargeText() = runComposeUiTest {
        val large = mutableStateOf(false)
        val model = RoomScreenModel("Movie night", "ABCD2345", RoomRole.OWNER, "Nika", true, RoomPlaybackState.PLAYING,
            listOf(RoomParticipant("Nika", RoomAvatar.COMET, isSelf = true, isHost = true), RoomParticipant("Jo", RoomAvatar.BERRY)))
        setContent {
            val density = LocalDensity.current
            AppLanguageEnvironment(if (large.value) AppLanguage.PERSIAN else AppLanguage.ENGLISH) {
                CompositionLocalProvider(LocalDensity provides Density(density.density, if (large.value) 1.5f else 1f),
                    LocalThemeIsDark provides remember { mutableStateOf(false) }) {
                    WatchPartyTheme(darkTheme = large.value) {
                        Box(Modifier.width(360.dp).height(1000.dp)) {
                            RoomScreen(RoomUiState(model, chat = RoomChatState(open = false, connected = true, loading = false)), playerContent = { Box(it) })
                        }
                    }
                }
            }
        }
        onNodeWithText("Jo").performScrollTo()
        val first = onNodeWithText("You").fetchSemanticsNode().boundsInRoot
        val second = onNodeWithText("Jo").fetchSemanticsNode().boundsInRoot
        assertTrue(kotlin.math.abs(first.top - second.top) < 2f)
        File("/tmp/watchparty-ui-parity-participants-en.png").writeBytes(Image.makeFromBitmap(onRoot().captureToImage().asSkiaBitmap()).encodeToData()!!.bytes)
        runOnIdle { large.value = true }
        onNodeWithText("Jo").performScrollTo()
        val firstLarge = onNodeWithText("تو").fetchSemanticsNode().boundsInRoot
        val secondLarge = onNodeWithText("Jo").fetchSemanticsNode().boundsInRoot
        assertTrue(secondLarge.top > firstLarge.bottom)
        File("/tmp/watchparty-ui-parity-participants-fa.png").writeBytes(Image.makeFromBitmap(onRoot().captureToImage().asSkiaBitmap()).encodeToData()!!.bytes)
    }

    @Test fun offlineReportKeepsDraftAndDisablesSendThenRecovers() = runComposeUiTest {
        val model = RoomScreenModel("Movie night", "ABCD2345", RoomRole.OWNER, "Nika", true, RoomPlaybackState.OWNER_EMPTY, emptyList())
        val online = mutableStateOf(false)
        val state = mutableStateOf(RoomUiState(model, bugDescription = "The movie froze"))
        val actions = mutableListOf<RoomAction>()
        setContent {
            WatchPartyTheme(darkTheme = false) {
                BugReportDialogContent(state.value, { actions += it }, screenshotActions = null, online = online.value)
            }
        }
        onNodeWithText("Send").assertIsNotEnabled()
        onNodeWithText("You’re offline. Your draft is kept. Reconnect to send.").assertIsDisplayed()
        onNodeWithContentDescription("What went wrong?").assertTextContains("The movie froze")
        runOnIdle { online.value = true }
        onNodeWithText("Send").assertIsEnabled().performClick()
        runOnIdle { assertEquals<RoomAction>(RoomAction.BugReportSend, actions.last()); state.value = state.value.copy(bugSending = true) }
        onNodeWithContentDescription("Close").assertIsNotEnabled()
        onNodeWithText("Cancel").assertIsNotEnabled()
    }
}
