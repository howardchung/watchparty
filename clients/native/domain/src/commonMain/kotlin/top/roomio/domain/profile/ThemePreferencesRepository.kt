package top.roomio.domain.profile

import kotlinx.coroutines.flow.StateFlow

enum class ThemeColor {
    ROOMIO,
    TOMATO,
    FLAMINGO,
    TANGERINE,
    PUMPKIN,
    MANGO,
    BANANA,
    CITRON,
    AVOCADO,
    PISTACHIO,
    BASIL,
    EUCALYPTUS,
    SAGE,
    PEACOCK,
    COBALT,
    BLUEBERRY,
    LAVENDER,
    WISTERIA,
    AMETHYST,
    GRAPE,
    RADICCHIO,
    CHERRY_BLOSSOM,
    COCOA,
    GRAPHITE,
    BIRCH,
}

interface ThemePreferencesRepository {
    val color: StateFlow<ThemeColor>
    fun selectColor(color: ThemeColor): Result<Unit>
}
