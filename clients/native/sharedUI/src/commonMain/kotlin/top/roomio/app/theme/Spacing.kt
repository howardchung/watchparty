package top.roomio.app.theme

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Immutable
internal data class WatchPartySpacingTokens(
    val extraExtraSmall: Dp,
    val extraSmall: Dp,
    val small: Dp,
    val medium: Dp,
    val large: Dp,
    val extraLarge: Dp,
)

internal val DefaultWatchPartySpacing = WatchPartySpacingTokens(
    extraExtraSmall = 4.dp,
    extraSmall = 8.dp,
    small = 16.dp,
    medium = 24.dp,
    large = 32.dp,
    extraLarge = 48.dp,
)

internal val LocalWatchPartySpacing = staticCompositionLocalOf {
    DefaultWatchPartySpacing
}
