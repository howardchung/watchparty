package top.roomio.app.theme

import com.materialkolor.rememberDynamicColorScheme
import com.materialkolor.PaletteStyle
import com.materialkolor.dynamiccolor.ColorSpec
import top.roomio.domain.profile.ThemeColor
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember

/**
 * Mutable theme state retained for the current sample-level theme toggle.
 * New UI should read colors from MaterialTheme or WatchPartyDesignSystem.
 */
internal val LocalThemeIsDark = compositionLocalOf<MutableState<Boolean>> {
    error("LocalThemeIsDark must be provided by AppTheme")
}

/** Access to WatchParty-specific tokens that do not exist on MaterialTheme. */
internal object WatchPartyDesignSystem {
    val colors: WatchPartyExtendedColors
        @Composable
        @ReadOnlyComposable
        get() = LocalWatchPartyExtendedColors.current

    val spacing: WatchPartySpacingTokens
        @Composable
        @ReadOnlyComposable
        get() = LocalWatchPartySpacing.current

    val shapes: WatchPartyExpressiveShapes
        @Composable
        @ReadOnlyComposable
        get() = LocalWatchPartyExpressiveShapes.current

    val motion: WatchPartyMotionTokens
        @Composable
        @ReadOnlyComposable
        get() = LocalWatchPartyMotion.current
}

/**
 * Compatibility wrapper used by App.kt.
 *
 * The callback continues to report whether system bars need dark foreground
 * icons, matching the existing Android host implementation.
 */
@Composable
internal fun AppTheme(
    onThemeChanged: @Composable (useDarkSystemBarIcons: Boolean) -> Unit,
    themeColor: ThemeColor = ThemeColor.ROOMIO,
    content: @Composable () -> Unit,
) {
    val systemIsDark = isSystemInDarkTheme()
    val isDarkState = remember(systemIsDark) { mutableStateOf(systemIsDark) }

    CompositionLocalProvider(LocalThemeIsDark provides isDarkState) {
        WatchPartyTheme(darkTheme = isDarkState.value, themeColor = themeColor) {
            onThemeChanged(!isDarkState.value)
            content()
        }
    }
}

/**
 * Cross-platform WatchParty theme based on the approved Immersive Cinema direction.
 * The default retains the cinema palette; named seeds generate Material Tonal Spot schemes.
 */
@Composable
internal fun WatchPartyTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    themeColor: ThemeColor = ThemeColor.ROOMIO,
    content: @Composable () -> Unit,
) {
    val seed = themeColor.seed
    val colorScheme = if (seed == null) {
        if (darkTheme) WatchPartyDarkColorScheme else WatchPartyLightColorScheme
    } else {
        rememberDynamicColorScheme(
            seedColor = seed, isDark = darkTheme, style = PaletteStyle.TonalSpot,
            contrastLevel = 0.0, specVersion = ColorSpec.SpecVersion.SPEC_2021,
        )
    }
    val extendedColors = if (darkTheme) {
        WatchPartyDarkExtendedColors
    } else {
        WatchPartyLightExtendedColors
    }

    CompositionLocalProvider(
        LocalWatchPartyExtendedColors provides extendedColors,
        LocalWatchPartySpacing provides DefaultWatchPartySpacing,
        LocalWatchPartyExpressiveShapes provides DefaultWatchPartyExpressiveShapes,
        LocalWatchPartyMotion provides DefaultWatchPartyMotion,
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = WatchPartyTypography(),
            shapes = WatchPartyMaterialShapes,
        ) {
            Surface(
                color = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.onSurface,
                content = content,
            )
        }
    }
}
