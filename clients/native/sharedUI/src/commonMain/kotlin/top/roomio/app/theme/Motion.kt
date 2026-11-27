package top.roomio.app.theme

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.Easing
import androidx.compose.runtime.staticCompositionLocalOf

internal data class WatchPartyMotionTokens(
    val shortDurationMillis: Int,
    val mediumDurationMillis: Int,
    val longDurationMillis: Int,
    val emphasizedEasing: Easing,
    val emphasizedDecelerateEasing: Easing,
    val standardEasing: Easing,
)

internal val DefaultWatchPartyMotion = WatchPartyMotionTokens(
    shortDurationMillis = 160,
    mediumDurationMillis = 300,
    longDurationMillis = 500,
    emphasizedEasing = CubicBezierEasing(0.2f, 0f, 0f, 1f),
    emphasizedDecelerateEasing = CubicBezierEasing(0.05f, 0.7f, 0.1f, 1f),
    standardEasing = CubicBezierEasing(0.2f, 0f, 0f, 1f),
)

internal val LocalWatchPartyMotion = staticCompositionLocalOf {
    DefaultWatchPartyMotion
}
