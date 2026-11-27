package top.roomio.app.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

/**
 * Material color roles approved in the browser prototype.
 *
 * Raw colors belong here; product UI should consume semantic roles from
 * MaterialTheme.colorScheme or WatchPartyDesignSystem.colors.
 */
internal val WatchPartyLightColorScheme = lightColorScheme(
    primary = Color(0xFF8F3B49),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFFFDADE),
    onPrimaryContainer = Color(0xFF3B0714),
    secondary = Color(0xFF3D665E),
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Color(0xFFBEECE1),
    onSecondaryContainer = Color(0xFF00201B),
    tertiary = Color(0xFF765A00),
    onTertiary = Color(0xFFFFFFFF),
    tertiaryContainer = Color(0xFFFFE083),
    onTertiaryContainer = Color(0xFF241A00),
    error = Color(0xFFBA1A1A),
    onError = Color(0xFFFFFFFF),
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF410002),
    background = Color(0xFFFFF8F7),
    onBackground = Color(0xFF241918),
    surface = Color(0xFFFFF8F7),
    onSurface = Color(0xFF241918),
    surfaceVariant = Color(0xFFEDDFDD),
    onSurfaceVariant = Color(0xFF534344),
    outline = Color(0xFF857374),
    outlineVariant = Color(0xFFD7C1C2),
    scrim = Color(0xFF000000),
    inverseSurface = Color(0xFF392E2D),
    inverseOnSurface = Color(0xFFFFEDEB),
    inversePrimary = Color(0xFFFFB2BC),
    surfaceDim = Color(0xFFE6D6D5),
    surfaceBright = Color(0xFFFFF8F7),
    surfaceContainerLowest = Color(0xFFFFFFFF),
    surfaceContainerLow = Color(0xFFFFF0EF),
    surfaceContainer = Color(0xFFF9EAE9),
    surfaceContainerHigh = Color(0xFFF3E4E3),
    surfaceContainerHighest = Color(0xFFEDDFDD),
)

internal val WatchPartyDarkColorScheme = darkColorScheme(
    primary = Color(0xFFFFB2BC),
    onPrimary = Color(0xFF56101F),
    primaryContainer = Color(0xFF71303A),
    onPrimaryContainer = Color(0xFFFFDADE),
    secondary = Color(0xFFA3D0C6),
    onSecondary = Color(0xFF0A3731),
    secondaryContainer = Color(0xFF244E47),
    onSecondaryContainer = Color(0xFFBEECE1),
    tertiary = Color(0xFFE7C454),
    onTertiary = Color(0xFF3D2E00),
    tertiaryContainer = Color(0xFF584400),
    onTertiaryContainer = Color(0xFFFFE083),
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005),
    errorContainer = Color(0xFF93000A),
    onErrorContainer = Color(0xFFFFDAD6),
    background = Color(0xFF181211),
    onBackground = Color(0xFFF1DEDC),
    surface = Color(0xFF181211),
    onSurface = Color(0xFFF1DEDC),
    surfaceVariant = Color(0xFF3B3332),
    onSurfaceVariant = Color(0xFFD7C1C2),
    outline = Color(0xFFA08C8D),
    outlineVariant = Color(0xFF534344),
    scrim = Color(0xFF000000),
    inverseSurface = Color(0xFFF1DEDC),
    inverseOnSurface = Color(0xFF392E2D),
    inversePrimary = Color(0xFF8F3B49),
    surfaceDim = Color(0xFF181211),
    surfaceBright = Color(0xFF403736),
    surfaceContainerLowest = Color(0xFF120D0C),
    surfaceContainerLow = Color(0xFF211A19),
    surfaceContainer = Color(0xFF251E1D),
    surfaceContainerHigh = Color(0xFF302827),
    surfaceContainerHighest = Color(0xFF3B3332),
)

/** Colors that express WatchParty concepts not represented by Material color roles. */
@Immutable
internal data class WatchPartyExtendedColors(
    val mediaSurface: Color,
    val onMedia: Color,
    val mediaContainer: Color,
    val mediaContainerHigh: Color,
    val mediaOutline: Color,
    val speaker: Color,
    val mediaScrim: Color,
    val sceneSky: Color,
    val scenePlanet: Color,
    val sceneRidgeBack: Color,
    val sceneRidgeFront: Color,
    val sceneStation: Color,
    val sceneWindow: Color,
)

internal val WatchPartyLightExtendedColors = WatchPartyExtendedColors(
    mediaSurface = Color(0xFF151416),
    onMedia = Color(0xFFF7F1F4),
    mediaContainer = Color(0xFF272428),
    mediaContainerHigh = Color(0xFF332F34),
    mediaOutline = Color(0xFF625D64),
    speaker = Color(0xFF37D7B5),
    mediaScrim = Color(0x8F000000),
    sceneSky = Color(0xFF27233C),
    scenePlanet = Color(0xFFFFD66E),
    sceneRidgeBack = Color(0xFF664B68),
    sceneRidgeFront = Color(0xFF1E6B66),
    sceneStation = Color(0xFFF2E9E7),
    sceneWindow = Color(0xFFF7BB4D),
)

internal val WatchPartyDarkExtendedColors = WatchPartyLightExtendedColors.copy(
    mediaSurface = Color(0xFF0F0E10),
    mediaContainer = Color(0xFF1C1A1E),
    mediaContainerHigh = Color(0xFF29262B),
    mediaOutline = Color(0xFF5C565E),
    mediaScrim = Color(0xB3000000),
)

internal val LocalWatchPartyExtendedColors = staticCompositionLocalOf {
    WatchPartyLightExtendedColors
}
