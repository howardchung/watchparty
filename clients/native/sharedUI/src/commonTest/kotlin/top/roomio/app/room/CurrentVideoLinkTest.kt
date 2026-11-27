package top.roomio.app.room

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.hasAnyAncestor
import androidx.compose.ui.test.isDialog
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.onAllNodesWithContentDescription
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performScrollTo
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.runComposeUiTest
import androidx.compose.ui.platform.ClipboardManager
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import kotlin.test.Test
import kotlin.test.assertEquals
import top.roomio.app.room.player.AudioTrack
import top.roomio.app.theme.AppTheme

@OptIn(ExperimentalTestApi::class)
class CurrentVideoLinkTest {
    @Test
    fun currentVideoUrlIsAvailableToHostAndGuest() = runComposeUiTest {
        var copiedText: AnnotatedString? = null
        val clipboard = object : ClipboardManager {
            override fun getText(): AnnotatedString? = copiedText

            override fun setText(annotatedString: AnnotatedString) {
                copiedText = annotatedString
            }
        }
        lateinit var showGuestRoom: () -> Unit
        setContent {
            var state by remember { mutableStateOf(roomState(RoomRole.OWNER)) }
            showGuestRoom = { state = roomState(RoomRole.GUEST) }
            AppTheme(onThemeChanged = {}) {
                CompositionLocalProvider(LocalClipboardManager provides clipboard) {
                    RoomScreen(
                        state = state,
                        onAction = { action ->
                            when (action) {
                                RoomAction.LinkClicked -> state = state.copy(linkOpen = true)
                                RoomAction.LinkDismissed -> state = state.copy(linkOpen = false)
                                else -> Unit
                            }
                        },
                        playerContent = { modifier -> Box(modifier) },
                    )
                }
            }
        }

        onNodeWithText("aurora-station.mp4").assertExists()
        onNodeWithContentDescription("Copy video link").performScrollTo().performClick()
        assertEquals(CURRENT_VIDEO_URL, copiedText?.text)
        onNodeWithText(CURRENT_VIDEO_URL).assertDoesNotExist()
        onAllNodesWithContentDescription("Current video link")[0].performClick()
        onNodeWithText(CURRENT_VIDEO_URL).assertExists()
        onNodeWithContentDescription("Copy link").assertExists()
        onNodeWithContentDescription("Copy link").performClick()
        assertEquals(CURRENT_VIDEO_URL, copiedText?.text)
        onNode(hasText("Video link copied") and hasAnyAncestor(isDialog())).assertExists()
        onNodeWithText("Done").performClick()

        runOnIdle { showGuestRoom() }
        onNodeWithText("aurora-station.mp4").assertExists()
        onAllNodesWithContentDescription("Current video link")[0].performClick()
        onNodeWithText(CURRENT_VIDEO_URL).assertExists()
        onNodeWithContentDescription("Copy link").assertExists()
        onNodeWithContentDescription("Copy link").performClick()
        assertEquals(CURRENT_VIDEO_URL, copiedText?.text)
    }

    @Test
    fun audioTrackControlShowsAvailableSourcesAndClosesAfterSelection() = runComposeUiTest {
        setContent {
            AppTheme(onThemeChanged = {}) {
                RoomScreen(
                    state = roomState(RoomRole.GUEST).copy(
                        audioTracks = listOf(
                            AudioTrack("0:0", "English"),
                            AudioTrack("0:1", "Spanish"),
                        ),
                    ),
                    playerContent = { modifier -> Box(modifier) },
                )
            }
        }

        onNodeWithContentDescription("Audio tracks").performClick()
        onNodeWithText("Automatic").assertExists()
        onNodeWithText("English").assertExists()
        onNodeWithText("Spanish").performClick()
        onNodeWithText("Automatic").assertDoesNotExist()
    }

    @Test
    fun audioTrackControlShowsOnlyAutomaticForASingleSource() = runComposeUiTest {
        setContent {
            AppTheme(onThemeChanged = {}) {
                RoomScreen(
                    state = roomState(RoomRole.GUEST).copy(
                        audioTracks = listOf(AudioTrack("0:0", "English")),
                    ),
                    playerContent = { modifier -> Box(modifier) },
                )
            }
        }

        onNodeWithContentDescription("Audio tracks").performClick()
        onNodeWithText("Automatic").assertExists()
        onNodeWithText("English").assertDoesNotExist()
    }
}

private const val CURRENT_VIDEO_URL = "https://media.example.org/films/aurora-station.mp4?token=room#chapter-2"

private fun roomState(role: RoomRole) = RoomUiState(
    model = RoomScreenModel(
        title = "Friday night screening",
        partyCode = "MOON-42",
        role = role,
        ownerName = "Nika",
        ownerPresent = true,
        playback = RoomPlaybackState.PLAYING,
        participants = emptyList(),
    ),
    playback = RoomPlaybackState.PLAYING,
    videoUrl = CURRENT_VIDEO_URL,
)
