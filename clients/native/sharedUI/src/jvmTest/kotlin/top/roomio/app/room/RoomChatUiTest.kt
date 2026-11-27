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
import top.roomio.app.theme.LocalThemeIsDark
import top.roomio.app.theme.WatchPartyTheme
import top.roomio.domain.party.ChatMessage
import top.roomio.domain.profile.AppLanguage
import kotlin.test.*

@OptIn(ExperimentalTestApi::class)
class RoomChatUiTest {
    @Test fun consecutiveMessagesShareHeaderAndFinalDeliveryStatus() = runComposeUiTest {
        fun message(id: String, sender: String) = ChatMessage(id, "room", sender, sender, "Same name", "berry", id, "2026-11-12T06:00:00Z", id.toLong())
        val state = mutableStateOf(RoomChatState(identityId = "me", connected = true, loading = false,
            messages = listOf(message("1", "me"), message("2", "me"), message("3", "me"))))
        setContent {
            WatchPartyTheme(darkTheme = false) { Box(Modifier.width(600.dp).height(900.dp)) { RoomChatPanel(state.value, {}) } }
        }
        onAllNodesWithText("You").assertCountEquals(1)
        onAllNodesWithText("Sent").assertCountEquals(1)
        runOnIdle { state.value = state.value.copy(messages = listOf(message("1", "friend-a"), message("2", "friend-a"), message("3", "friend-b"))) }
        onAllNodesWithText("Same name").assertCountEquals(2)
        onAllNodesWithText("Sent").assertCountEquals(0)
        runOnIdle { state.value = state.value.copy(messages = listOf(message("1", "me"), message("2", "me")),
            pending = listOf(PendingChatMessage("failed", "Failed continuation", ChatSendState.FAILED, "NETWORK"))) }
        onAllNodesWithText("You").assertCountEquals(1)
        onAllNodesWithText("Sent").assertCountEquals(0)
        onNodeWithText("Retry").assertExists()
        onNodeWithText("Discard").assertExists()
    }

    @Test fun compactPanelKeepsDraftRetryAndCollapseAvailableAtLargeText() = runComposeUiTest {
        val state=mutableStateOf(RoomChatState(connected=true,loading=false,pending=listOf(PendingChatMessage("failed","A failed message",ChatSendState.FAILED,"NETWORK"))))
        val actions=mutableListOf<RoomAction>()
        setContent {
            val density=LocalDensity.current
            CompositionLocalProvider(LocalThemeIsDark provides remember { mutableStateOf(false) }, LocalDensity provides Density(density.density,1.5f)) {
                WatchPartyTheme(darkTheme=false) {
                    Column(Modifier.width(360.dp).height(1000.dp).verticalScroll(rememberScrollState())) {
                        RoomChatPanel(state.value,{ actions+=it; if(it is RoomAction.ChatDraftChanged) state.value=state.value.copy(draft=it.text); if(it==RoomAction.ChatToggle)state.value=state.value.copy(open=!state.value.open) })
                    }
                }
            }
        }
        onNodeWithContentDescription("Send message").performScrollTo().assertIsNotEnabled()
        onNodeWithContentDescription("Message the party").performScrollTo().performTextInput("Hello 🍿")
        onNodeWithContentDescription("Message the party").performKeyInput { pressKey(Key.Enter) }
        runOnIdle { assertFalse(RoomAction.ChatSend in actions) }
        onNodeWithContentDescription("Message the party").assertTextContains("Hello 🍿\n", substring = true)
        onNodeWithContentDescription("Message the party").performKeyInput {
            keyDown(Key.CtrlLeft)
            pressKey(Key.Enter)
            keyUp(Key.CtrlLeft)
        }
        runOnIdle { assertEquals(1, actions.count { it == RoomAction.ChatSend }) }
        onNodeWithContentDescription("Send message").performScrollTo().assertIsEnabled().performClick()
        runOnIdle { assertTrue(RoomAction.ChatSend in actions) }
        onNodeWithText("Retry").performScrollTo().performClick()
        runOnIdle { assertTrue(RoomAction.ChatRetry("failed") in actions) }
        onNodeWithContentDescription("Collapse chat").performScrollTo().performClick()
        onNodeWithContentDescription("Open chat").assertIsDisplayed().performClick()
        onNodeWithContentDescription("Message the party").performScrollTo().assertTextContains("Hello 🍿", substring = true)
        runOnIdle { state.value=state.value.copy(connected=false) }
        onNodeWithContentDescription("Send message").performScrollTo().assertIsEnabled()
        onNodeWithText("Chat is offline. Your draft stays here.").assertDoesNotExist()
    }

    @Test fun sharedRoomRendersSelectedSidePanelInCompactPersianAndExpandedEnglish() = runComposeUiTest {
        val expanded=mutableStateOf(false)
        val model=RoomScreenModel("Friday night screening","ABCD2345",RoomRole.OWNER,"Nika",true,RoomPlaybackState.PLAYING,emptyList())
        val message=ChatMessage("message","room","friend","member","Jo","berry","سلام 🍿\nMovie night","2026-11-12T06:00:00Z",5)
        setContent {
            val density=LocalDensity.current
            AppLanguageEnvironment(if(expanded.value) AppLanguage.ENGLISH else AppLanguage.PERSIAN) {
                CompositionLocalProvider(LocalThemeIsDark provides remember { mutableStateOf(true) },LocalDensity provides Density(density.density,if(expanded.value)1f else 1.5f)) {
                    WatchPartyTheme(darkTheme=true) {
                        Box(Modifier.width(if(expanded.value)1280.dp else 360.dp).height(1000.dp)) {
                            RoomScreen(state=RoomUiState(model,chat=RoomChatState(identityId="me",messages=listOf(message),connected=true,loading=false)),playerContent={ Box(it) })
                        }
                    }
                }
            }
        }
        onNodeWithText("فیلمت داره اجرا میشه").performScrollTo().assertIsDisplayed()
        File("/tmp/watchparty-sync-native-compact.png").writeBytes(Image.makeFromBitmap(onRoot().captureToImage().asSkiaBitmap()).encodeToData()!!.bytes)
        onNodeWithText("گپ دورهمی").performScrollTo().assertIsDisplayed()
        onNodeWithContentDescription("پیام به دورهمی").performScrollTo()
        File("/tmp/watchparty-chat-native-debug.png").writeBytes(Image.makeFromBitmap(onRoot().captureToImage().asSkiaBitmap()).encodeToData()!!.bytes)
        onNodeWithText("سلام 🍿\nMovie night").performScrollTo().assertIsDisplayed()
        File("/tmp/watchparty-chat-native-compact.png").writeBytes(Image.makeFromBitmap(onRoot().captureToImage().asSkiaBitmap()).encodeToData()!!.bytes)
        runOnIdle { expanded.value=true }
        onNodeWithText("Party chat").assertIsDisplayed()
        onNodeWithContentDescription("Send message").assertIsDisplayed()
        File("/tmp/watchparty-chat-native-expanded.png").writeBytes(Image.makeFromBitmap(onRoot().captureToImage().asSkiaBitmap()).encodeToData()!!.bytes)
    }
}
