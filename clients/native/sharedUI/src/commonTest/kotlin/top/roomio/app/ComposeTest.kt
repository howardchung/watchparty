package top.roomio.app

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.assertIsNotEnabled
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.assertTextEquals
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.performScrollTo
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextClearance
import androidx.compose.ui.test.performTextInput
import androidx.compose.ui.test.runComposeUiTest
import kotlin.test.Test
import top.roomio.app.theme.AppTheme
import top.roomio.app.ui.WatchPartyUi

@OptIn(ExperimentalTestApi::class)
class ComposeTest {

    @Test
    fun simpleCheck() = runComposeUiTest {
        setContent {
            var txt by remember { mutableStateOf("Go") }
            Column {
                Text(
                    text = txt,
                    modifier = Modifier.testTag("t_text")
                )
                Button(
                    onClick = { txt += "." },
                    modifier = Modifier.testTag("t_button")
                ) {
                    Text("click me")
                }
            }
        }

        onNodeWithTag("t_button").apply {
            repeat(3) { performClick() }
        }
        onNodeWithTag("t_text").assertTextEquals("Go...")
    }

    @Test
    fun inviteDialogShowsBothShareOptions() = runComposeUiTest {
        setContent {
            AppTheme(onThemeChanged = {}) {
                WatchPartyUi(TestProfileRepository())
            }
        }

        onNodeWithText("Start a party").performClick()
        onNodeWithText("Start the party").performClick()

        onNodeWithContentDescription("Invite friends").performClick()

        onNodeWithText("Share either option. Friends will preview the room before they join.").assertExists()
        onNodeWithContentDescription("Invite code").assertExists()
        onNodeWithContentDescription("Prototype invite link").assertExists()
        onNodeWithText("Copy code").assertExists()
        onNodeWithText("Copy link").assertExists()
    }

    @Test
    fun lastRoomCardShowsRealRoomAndOffersReturn() = runComposeUiTest {
        var action: top.roomio.app.home.HomeAction? = null
        setContent {
            AppTheme(onThemeChanged = {}) {
                top.roomio.app.home.HomeScreen(
                    state = top.roomio.app.home.HomeUiState(
                        roomPreview = top.roomio.app.home.HomeRoomPreview("Movie night", 0, true, "ABCD2345"),
                    ),
                    onAction = { action = it },
                )
            }
        }
        onNodeWithText("Movie night").assertExists()
        onNodeWithText("ABCD2345").assertExists()
        onNodeWithContentDescription("Jump back in").performClick()
        kotlin.test.assertEquals(top.roomio.app.home.HomeAction.OpenRoomClicked, action)
    }

    @Test
    fun homeShowsIdentityAndActionsWithoutRoomCard() = runComposeUiTest {
        setContent {
            WatchPartyUi(TestProfileRepository())
        }

        onNodeWithText("Stream and chill").assertExists()
        onNodeWithText("Your next watch party is one room away.").assertDoesNotExist()
        onNodeWithText("READY WHEN EVERYONE IS").assertDoesNotExist()
        onNodeWithText("watchparty").assertDoesNotExist()
        onNodeWithText("Nika").assertExists()
        onNodeWithText("Start a party").assertExists()
        onNodeWithText("Got a code?").assertExists()
        onNodeWithText("Friday night screening").assertDoesNotExist()
        onNodeWithText("2 friends · No owner").assertDoesNotExist()
    }

    @Test
    fun homeSettingsSetsNameFromAvatarWithoutCustomInput() = runComposeUiTest {
        setContent {
            WatchPartyUi(TestProfileRepository())
        }

        onNodeWithContentDescription("Settings").performClick()

        onNodeWithText("Make yourself at home").assertExists()
        onNodeWithText("Display name").assertDoesNotExist()
        onNodeWithText("Avatar").assertExists()
        onAllNodesWithText("Ice Queen")[0].assertExists()
        onNodeWithText("Skeleton Detective").assertExists()
        onNodeWithText("Save changes").assertExists()

        onNodeWithText("Frog Wizard").performScrollTo().performClick()
        onNodeWithText("Save changes").performClick()

        onNodeWithText("Frog Wizard").assertExists()
        onNodeWithText("Stream and chill").assertExists()
        onNodeWithText("Your next watch party is one room away.").assertDoesNotExist()
        onNodeWithText("READY WHEN EVERYONE IS").assertDoesNotExist()
        onNodeWithText("watchparty").assertDoesNotExist()
    }

    @Test
    fun createFromHomeOpensPartyManagerAndCreatesRoom() = runComposeUiTest {
        setContent {
            WatchPartyUi(TestProfileRepository())
        }

        onNodeWithText("Start a party").performClick()

        onNodeWithText("Movie night").assertExists()
        onNodeWithText("Let’s start movie night").assertExists()
        onNodeWithText("You’re hosting", ignoreCase = true).assertExists()

        onNodeWithText("Start the party").performClick()

        onNodeWithText("Your cinema is empty").assertExists()
    }

    @Test
    fun joinFromHomeOpensDisabledEmptyCodeState() = runComposeUiTest {
        setContent {
            WatchPartyUi(TestProfileRepository())
        }

        onNodeWithText("Got a code?").performClick()

        onNodeWithText("Step into their room").assertExists()
        onNodeWithContentDescription("Invite code").assertExists()
        onNodeWithText("Take a look").assertIsNotEnabled()
    }

    @Test
    fun destinationUpActionsReturnToHome() = runComposeUiTest {
        setContent {
            WatchPartyUi(TestProfileRepository())
        }

        onNodeWithContentDescription("Settings").performClick()
        onNodeWithText("Make yourself at home").assertExists()
        onNodeWithContentDescription("Back").performClick()
        onNodeWithText("Stream and chill").assertExists()
        onNodeWithText("Your next watch party is one room away.").assertDoesNotExist()
        onNodeWithText("READY WHEN EVERYONE IS").assertDoesNotExist()
        onNodeWithText("watchparty").assertDoesNotExist()

        onNodeWithText("Start a party").performClick()
        onNodeWithText("Movie night").assertExists()
        onNodeWithContentDescription("Back").performClick()
        onNodeWithText("Stream and chill").assertExists()
        onNodeWithText("Your next watch party is one room away.").assertDoesNotExist()
        onNodeWithText("READY WHEN EVERYONE IS").assertDoesNotExist()
        onNodeWithText("watchparty").assertDoesNotExist()
    }

    @Test
    fun confirmedLeavePartyReturnsToHome() = runComposeUiTest {
        setContent {
            WatchPartyUi(TestProfileRepository())
        }

        onNodeWithText("Start a party").performClick()
        onNodeWithText("Start the party").performClick()
        onNodeWithContentDescription("Leave").performClick()
        onNodeWithText("Leave party?").assertExists()
        onNodeWithText("Leave").performClick()

        onNodeWithText("Stream and chill").assertExists()
        onNodeWithText("Your next watch party is one room away.").assertDoesNotExist()
        onNodeWithText("READY WHEN EVERYONE IS").assertDoesNotExist()
        onNodeWithText("watchparty").assertDoesNotExist()
        onNodeWithText("Movie night").assertDoesNotExist()
    }

    @kotlin.test.Ignore("Preview now loads asynchronously from the backend; rewrite to await the effect-based navigation.")
    @Test
    fun joinCodeShowsPreviewBeforeEnteringRoom() = runComposeUiTest {
        setContent {
            WatchPartyUi(TestProfileRepository())
        }

        onNodeWithText("Got a code?").performClick()
        onNodeWithContentDescription("Invite code").performTextInput("MOON-42")
        onNodeWithText("Take a look").performClick()

        onNodeWithText("Room preview").assertExists()
        onNodeWithText("Mira's late show").assertExists()
        onNodeWithText("Open").assertExists()
        onNodeWithText("3 people").assertExists()
        onNodeWithText("Playing now").assertExists()

        onNodeWithText("Join party").performClick()

        onNodeWithText("Voice party").assertExists()
        onNodeWithText("MOON-42 · Guest").assertExists()
    }

    @Test
    fun notNowReturnsFromPreviewToEnteredCode() = runComposeUiTest {
        setContent {
            WatchPartyUi(TestProfileRepository())
        }

        onNodeWithText("Got a code?").performClick()
        onNodeWithContentDescription("Invite code").performTextInput("MOON-42")
        onNodeWithText("Take a look").performClick()
        onNodeWithText("Not now").performClick()

        onNodeWithText("Step into their room").assertExists()
        onNodeWithText("MOON-42").assertExists()
    }
}
