package top.roomio.domain.launcher

/** Stable launcher IDs, deliberately independent of theme preference storage. */
enum class LauncherIconColor(val aliasSuffix: String, val rgb: Int) {
    TOMATO("Tomato", 0xD50000),
    FLAMINGO("Flamingo", 0xE67C73),
    TANGERINE("Tangerine", 0xF4511E),
    PUMPKIN("Pumpkin", 0xEF6C00),
    MANGO("Mango", 0xF09300),
    BANANA("Banana", 0xF6BF26),
    CITRON("Citron", 0xE4C441),
    AVOCADO("Avocado", 0xC0CA33),
    PISTACHIO("Pistachio", 0x7CB342),
    BASIL("Basil", 0x0B8043),
    EUCALYPTUS("Eucalyptus", 0x009688),
    SAGE("Sage", 0x33B679),
    PEACOCK("Peacock", 0x039BE5),
    COBALT("Cobalt", 0x4285F4),
    BLUEBERRY("Blueberry", 0x3F51B5),
    LAVENDER("Lavender", 0x7986CB),
    WISTERIA("Wisteria", 0xB39DDB),
    AMETHYST("Amethyst", 0x9E69AF),
    GRAPE("Grape", 0x8E24AA),
    RADICCHIO("Radicchio", 0xAD1457),
    CHERRY_BLOSSOM("CherryBlossom", 0xD81B60),
    COCOA("Cocoa", 0x795548),
    GRAPHITE("Graphite", 0x616161),
    BIRCH("Birch", 0xA79B8E),
}

/** Platform launcher settings are the source of truth; no second saved preference. */
interface LauncherIconController {
    val isSupported: Boolean
    fun currentColor(): Result<LauncherIconColor>
    fun selectColor(color: LauncherIconColor): Result<Unit>
}
