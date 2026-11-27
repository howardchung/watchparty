package top.roomio.app.theme

import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.dp

internal val WatchPartyMaterialShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(12.dp),
    large = RoundedCornerShape(16.dp),
    extraLarge = RoundedCornerShape(28.dp),
)

/** Expressive shape roles that are not part of the core Material Shapes API. */
internal data class WatchPartyExpressiveShapes(
    val none: Shape,
    val largeIncreased: Shape,
    val extraLargeIncreased: Shape,
    val extraExtraLarge: Shape,
    val full: Shape,
)

internal val DefaultWatchPartyExpressiveShapes = WatchPartyExpressiveShapes(
    none = RectangleShape,
    largeIncreased = RoundedCornerShape(20.dp),
    extraLargeIncreased = RoundedCornerShape(32.dp),
    extraExtraLarge = RoundedCornerShape(48.dp),
    full = CircleShape,
)

internal val LocalWatchPartyExpressiveShapes = staticCompositionLocalOf {
    DefaultWatchPartyExpressiveShapes
}
