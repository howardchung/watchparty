package top.roomio.app.theme

import androidx.compose.material3.Typography
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import org.jetbrains.compose.resources.Font
import watchparty.sharedui.generated.resources.Res
import watchparty.sharedui.generated.resources.pofak_thin
import watchparty.sharedui.generated.resources.pofak_ultralight
import watchparty.sharedui.generated.resources.pofak_light
import watchparty.sharedui.generated.resources.pofak_regular
import watchparty.sharedui.generated.resources.pofak_medium
import watchparty.sharedui.generated.resources.pofak_bold
import watchparty.sharedui.generated.resources.pofak_demibold
import watchparty.sharedui.generated.resources.pofak_extrabold
import watchparty.sharedui.generated.resources.pofak_black
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

private fun roomioTextStyle(
    size: Int,
    lineHeight: Int,
    weight: FontWeight = FontWeight.Normal,
) = TextStyle(
    fontWeight = weight,
    fontSize = size.sp,
    lineHeight = lineHeight.sp,
    letterSpacing = 0.sp,
)

/** Bundled Pofak is shared by Android and desktop; no font download is needed. */
@Composable
internal fun WatchPartyTypography(): Typography {
    val family = FontFamily(
        Font(Res.font.pofak_thin, weight = FontWeight(100)),
        Font(Res.font.pofak_ultralight, weight = FontWeight(200)),
        Font(Res.font.pofak_light, weight = FontWeight(300)),
        Font(Res.font.pofak_regular, weight = FontWeight(400)),
        Font(Res.font.pofak_medium, weight = FontWeight(500)),
        Font(Res.font.pofak_demibold, weight = FontWeight(600)),
        Font(Res.font.pofak_bold, weight = FontWeight(700)),
        Font(Res.font.pofak_extrabold, weight = FontWeight(800)),
        Font(Res.font.pofak_black, weight = FontWeight(900)),
    )
    return remember(family) {
        val base = Typography(
            displayLarge = roomioTextStyle(size = 57, lineHeight = 64, weight = FontWeight.SemiBold),
            displayMedium = roomioTextStyle(size = 45, lineHeight = 52, weight = FontWeight.SemiBold),
            displaySmall = roomioTextStyle(size = 36, lineHeight = 44, weight = FontWeight.SemiBold),
            headlineLarge = roomioTextStyle(size = 32, lineHeight = 40, weight = FontWeight.SemiBold),
            headlineMedium = roomioTextStyle(size = 28, lineHeight = 36, weight = FontWeight.SemiBold),
            headlineSmall = roomioTextStyle(size = 24, lineHeight = 32, weight = FontWeight.SemiBold),
            titleLarge = roomioTextStyle(size = 22, lineHeight = 28, weight = FontWeight.SemiBold),
            titleMedium = roomioTextStyle(size = 16, lineHeight = 24, weight = FontWeight.SemiBold),
            titleSmall = roomioTextStyle(size = 14, lineHeight = 20, weight = FontWeight.SemiBold),
            bodyLarge = roomioTextStyle(size = 16, lineHeight = 24),
            bodyMedium = roomioTextStyle(size = 14, lineHeight = 20),
            bodySmall = roomioTextStyle(size = 12, lineHeight = 16),
            labelLarge = roomioTextStyle(size = 14, lineHeight = 20, weight = FontWeight.SemiBold),
            labelMedium = roomioTextStyle(size = 12, lineHeight = 16, weight = FontWeight.SemiBold),
            labelSmall = roomioTextStyle(size = 11, lineHeight = 16, weight = FontWeight.SemiBold),
        )
        base.copy(
            displayLarge = base.displayLarge.copy(fontFamily = family),
            displayMedium = base.displayMedium.copy(fontFamily = family),
            displaySmall = base.displaySmall.copy(fontFamily = family),
            headlineLarge = base.headlineLarge.copy(fontFamily = family),
            headlineMedium = base.headlineMedium.copy(fontFamily = family),
            headlineSmall = base.headlineSmall.copy(fontFamily = family),
            titleLarge = base.titleLarge.copy(fontFamily = family),
            titleMedium = base.titleMedium.copy(fontFamily = family),
            titleSmall = base.titleSmall.copy(fontFamily = family),
            bodyLarge = base.bodyLarge.copy(fontFamily = family),
            bodyMedium = base.bodyMedium.copy(fontFamily = family),
            bodySmall = base.bodySmall.copy(fontFamily = family),
            labelLarge = base.labelLarge.copy(fontFamily = family),
            labelMedium = base.labelMedium.copy(fontFamily = family),
            labelSmall = base.labelSmall.copy(fontFamily = family),
            displayLargeEmphasized = base.displayLargeEmphasized.copy(fontFamily = family),
            displayMediumEmphasized = base.displayMediumEmphasized.copy(fontFamily = family),
            displaySmallEmphasized = base.displaySmallEmphasized.copy(fontFamily = family),
            headlineLargeEmphasized = base.headlineLargeEmphasized.copy(fontFamily = family),
            headlineMediumEmphasized = base.headlineMediumEmphasized.copy(fontFamily = family),
            headlineSmallEmphasized = base.headlineSmallEmphasized.copy(fontFamily = family),
            titleLargeEmphasized = base.titleLargeEmphasized.copy(fontFamily = family),
            titleMediumEmphasized = base.titleMediumEmphasized.copy(fontFamily = family),
            titleSmallEmphasized = base.titleSmallEmphasized.copy(fontFamily = family),
            bodyLargeEmphasized = base.bodyLargeEmphasized.copy(fontFamily = family),
            bodyMediumEmphasized = base.bodyMediumEmphasized.copy(fontFamily = family),
            bodySmallEmphasized = base.bodySmallEmphasized.copy(fontFamily = family),
            labelLargeEmphasized = base.labelLargeEmphasized.copy(fontFamily = family),
            labelMediumEmphasized = base.labelMediumEmphasized.copy(fontFamily = family),
            labelSmallEmphasized = base.labelSmallEmphasized.copy(fontFamily = family),
        )
    }
}
