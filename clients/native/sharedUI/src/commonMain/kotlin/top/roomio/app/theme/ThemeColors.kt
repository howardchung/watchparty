package top.roomio.app.theme

import androidx.compose.ui.graphics.Color
import org.jetbrains.compose.resources.StringResource
import watchparty.sharedui.generated.resources.*
import top.roomio.domain.profile.ThemeColor

internal val ThemeColor.seed: Color?
    get() = when (this) {
        ThemeColor.ROOMIO -> null
        ThemeColor.TOMATO -> Color(0xFFD50000)
        ThemeColor.FLAMINGO -> Color(0xFFE67C73)
        ThemeColor.TANGERINE -> Color(0xFFF4511E)
        ThemeColor.PUMPKIN -> Color(0xFFEF6C00)
        ThemeColor.MANGO -> Color(0xFFF09300)
        ThemeColor.BANANA -> Color(0xFFF6BF26)
        ThemeColor.CITRON -> Color(0xFFE4C441)
        ThemeColor.AVOCADO -> Color(0xFFC0CA33)
        ThemeColor.PISTACHIO -> Color(0xFF7CB342)
        ThemeColor.BASIL -> Color(0xFF0B8043)
        ThemeColor.EUCALYPTUS -> Color(0xFF009688)
        ThemeColor.SAGE -> Color(0xFF33B679)
        ThemeColor.PEACOCK -> Color(0xFF039BE5)
        ThemeColor.COBALT -> Color(0xFF4285F4)
        ThemeColor.BLUEBERRY -> Color(0xFF3F51B5)
        ThemeColor.LAVENDER -> Color(0xFF7986CB)
        ThemeColor.WISTERIA -> Color(0xFFB39DDB)
        ThemeColor.AMETHYST -> Color(0xFF9E69AF)
        ThemeColor.GRAPE -> Color(0xFF8E24AA)
        ThemeColor.RADICCHIO -> Color(0xFFAD1457)
        ThemeColor.CHERRY_BLOSSOM -> Color(0xFFD81B60)
        ThemeColor.COCOA -> Color(0xFF795548)
        ThemeColor.GRAPHITE -> Color(0xFF616161)
        ThemeColor.BIRCH -> Color(0xFFA79B8E)
    }

internal val ThemeColor.label: StringResource
    get() = when (this) {
        ThemeColor.ROOMIO -> Res.string.color_roomio
        ThemeColor.TOMATO -> Res.string.color_tomato
        ThemeColor.FLAMINGO -> Res.string.color_flamingo
        ThemeColor.TANGERINE -> Res.string.color_tangerine
        ThemeColor.PUMPKIN -> Res.string.color_pumpkin
        ThemeColor.MANGO -> Res.string.color_mango
        ThemeColor.BANANA -> Res.string.color_banana
        ThemeColor.CITRON -> Res.string.color_citron
        ThemeColor.AVOCADO -> Res.string.color_avocado
        ThemeColor.PISTACHIO -> Res.string.color_pistachio
        ThemeColor.BASIL -> Res.string.color_basil
        ThemeColor.EUCALYPTUS -> Res.string.color_eucalyptus
        ThemeColor.SAGE -> Res.string.color_sage
        ThemeColor.PEACOCK -> Res.string.color_peacock
        ThemeColor.COBALT -> Res.string.color_cobalt
        ThemeColor.BLUEBERRY -> Res.string.color_blueberry
        ThemeColor.LAVENDER -> Res.string.color_lavender
        ThemeColor.WISTERIA -> Res.string.color_wisteria
        ThemeColor.AMETHYST -> Res.string.color_amethyst
        ThemeColor.GRAPE -> Res.string.color_grape
        ThemeColor.RADICCHIO -> Res.string.color_radicchio
        ThemeColor.CHERRY_BLOSSOM -> Res.string.color_cherry_blossom
        ThemeColor.COCOA -> Res.string.color_cocoa
        ThemeColor.GRAPHITE -> Res.string.color_graphite
        ThemeColor.BIRCH -> Res.string.color_birch
    }
