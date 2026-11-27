package top.roomio.app.room

import androidx.compose.foundation.layout.width
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.graphics.toPixelMap
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.test.*
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import kotlin.test.Test
import kotlin.test.assertTrue
import top.roomio.app.locale.AppLanguageEnvironment
import top.roomio.app.theme.LocalThemeIsDark
import top.roomio.app.theme.WatchPartyTheme
import top.roomio.domain.profile.AppLanguage
import top.roomio.domain.profile.ThemeColor

@OptIn(ExperimentalTestApi::class)
class OwnerCinemaContrastTest {
    @Test
    fun blankSourceHasReadableDisabledLabelOnMediaSurface() = runComposeUiTest {
        val model = ownerRoomModel()
        val dark = mutableStateOf(false)
        val url = mutableStateOf("")
        setContent {
            val density = LocalDensity.current
            AppLanguageEnvironment(if (dark.value) AppLanguage.ENGLISH else AppLanguage.PERSIAN) {
                CompositionLocalProvider(
                    LocalThemeIsDark provides dark,
                    LocalDensity provides Density(density.density, if (dark.value) 1f else 1.6f),
                ) {
                    WatchPartyTheme(darkTheme = dark.value, themeColor = ThemeColor.BIRCH) {
                        RoomScreen(
                            state = RoomUiState(model, videoUrl = url.value),
                            modifier = Modifier.width(if (dark.value) 800.dp else 360.dp),
                            playerContent = {},
                        )
                    }
                }
            }
        }
        for (night in listOf(false, true)) {
            runOnIdle {
                dark.value = night
                url.value = " "
            }
            val start = onNodeWithText(if (night) "Start stream" else "شروع فیلم")
            start.performScrollTo().assertIsDisplayed().assertIsNotEnabled()
            val pixels = start.captureToImage().toPixelMap()
            // The middle half excludes the rounded ends and contains both label and fill.
            val luminances = (pixels.height / 4 until pixels.height * 3 / 4).flatMap { y ->
                (pixels.width / 4 until pixels.width * 3 / 4).map { x -> pixels[x, y].luminance() }
            }
            val contrast = (luminances.max() + .05f) / (luminances.min() + .05f)
            assertTrue(contrast >= 4.5f, "Rendered disabled label contrast was $contrast")
            runOnIdle { url.value = "https://example.org/movie.mp4" }
            start.assertIsEnabled()
        }
    }
}
