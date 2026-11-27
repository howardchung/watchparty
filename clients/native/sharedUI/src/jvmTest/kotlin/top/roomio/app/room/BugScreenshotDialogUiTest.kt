package top.roomio.app.room

import androidx.compose.runtime.*
import androidx.compose.ui.graphics.asSkiaBitmap
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.test.*
import androidx.compose.ui.unit.Density
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.io.File
import javax.imageio.ImageIO
import kotlin.io.encoding.Base64
import kotlin.test.*
import org.jetbrains.skia.Image
import top.roomio.app.locale.AppLanguageEnvironment
import top.roomio.app.theme.LocalThemeIsDark
import top.roomio.app.theme.WatchPartyTheme
import top.roomio.domain.party.ReportScreenshot
import top.roomio.domain.profile.AppLanguage

@OptIn(ExperimentalTestApi::class)
class BugScreenshotDialogUiTest {
    @Test fun previewPasteRemoveAndSendStayUsableInEnglishAndLargePersian() = runComposeUiTest {
        val png = ByteArrayOutputStream().also { ImageIO.write(BufferedImage(320,180,BufferedImage.TYPE_INT_RGB), "png", it) }.toByteArray()
        val image = ReportScreenshot("image/png", Base64.encode(png))
        val model = RoomScreenModel("Friday night screening", "ABCD2345", RoomRole.OWNER, "Nika", true, RoomPlaybackState.OWNER_EMPTY, emptyList())
        val state = mutableStateOf(RoomUiState(model, bugReportOpen = true, bugDescription = "Playback freezes", bugScreenshots = listOf(image)))
        val persian = mutableStateOf(false)
        val reading = mutableStateOf(false)
        val actions = mutableListOf<RoomAction>()
        var pasted = 0
        setContent {
            val density = LocalDensity.current
            AppLanguageEnvironment(if (persian.value) AppLanguage.PERSIAN else AppLanguage.ENGLISH) {
                CompositionLocalProvider(LocalThemeIsDark provides remember { mutableStateOf(persian.value) }, LocalDensity provides Density(density.density, if (persian.value) 1.7f else 1f)) {
                    WatchPartyTheme(darkTheme = persian.value) {
                        BugReportDialogContent(state.value, { action ->
                            actions += action
                            if (action is RoomAction.BugScreenshotRemoved) state.value = state.value.copy(bugScreenshots = emptyList())
                        }, ReportScreenshotActions(pick = {}, paste = { pasted++ }), reading.value)
                    }
                }
            }
        }
        onNodeWithContentDescription("Screenshot 1").performScrollTo().assertIsDisplayed()
        onNodeWithText("Paste screenshot").performScrollTo().performClick()
        runOnIdle { assertEquals(1, pasted); reading.value = true }
        onNodeWithText("Send").assertIsNotEnabled()
        onNodeWithText("Remove screenshot 1").performScrollTo().assertIsNotEnabled()
        runOnIdle { reading.value = false }
        onAllNodes(isRoot()).onLast().captureToImage().also { File("/tmp/watchparty-bug-screenshots-native-light.png").writeBytes(Image.makeFromBitmap(it.asSkiaBitmap()).encodeToData()!!.bytes) }
        runOnIdle { persian.value = true }
        onNodeWithText("چسباندن تصویر").performScrollTo().assertIsDisplayed()
        onNodeWithText("ارسال").assertIsDisplayed().assertIsEnabled()
        onAllNodes(isRoot()).onLast().captureToImage().also { File("/tmp/watchparty-bug-screenshots-native-rtl.png").writeBytes(Image.makeFromBitmap(it.asSkiaBitmap()).encodeToData()!!.bytes) }
        onNodeWithText("حذف تصویر 1").performScrollTo().performClick()
        runOnIdle { assertTrue(actions.any { it is RoomAction.BugScreenshotRemoved }); state.value = state.value.copy(bugSending = true) }
        onNodeWithText("چسباندن تصویر").performScrollTo().assertIsNotEnabled()
    }
}
