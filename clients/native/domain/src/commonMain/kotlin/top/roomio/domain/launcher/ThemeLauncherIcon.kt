package top.roomio.domain.launcher

import top.roomio.domain.profile.ThemeColor

/** The default palette retains the approved green Shared Screen icon. */
fun ThemeColor.launcherIconColor(): LauncherIconColor = when (this) {
    ThemeColor.ROOMIO, ThemeColor.BASIL -> LauncherIconColor.BASIL
    ThemeColor.TOMATO -> LauncherIconColor.TOMATO
    ThemeColor.FLAMINGO -> LauncherIconColor.FLAMINGO
    ThemeColor.TANGERINE -> LauncherIconColor.TANGERINE
    ThemeColor.PUMPKIN -> LauncherIconColor.PUMPKIN
    ThemeColor.MANGO -> LauncherIconColor.MANGO
    ThemeColor.BANANA -> LauncherIconColor.BANANA
    ThemeColor.CITRON -> LauncherIconColor.CITRON
    ThemeColor.AVOCADO -> LauncherIconColor.AVOCADO
    ThemeColor.PISTACHIO -> LauncherIconColor.PISTACHIO
    ThemeColor.EUCALYPTUS -> LauncherIconColor.EUCALYPTUS
    ThemeColor.SAGE -> LauncherIconColor.SAGE
    ThemeColor.PEACOCK -> LauncherIconColor.PEACOCK
    ThemeColor.COBALT -> LauncherIconColor.COBALT
    ThemeColor.BLUEBERRY -> LauncherIconColor.BLUEBERRY
    ThemeColor.LAVENDER -> LauncherIconColor.LAVENDER
    ThemeColor.WISTERIA -> LauncherIconColor.WISTERIA
    ThemeColor.AMETHYST -> LauncherIconColor.AMETHYST
    ThemeColor.GRAPE -> LauncherIconColor.GRAPE
    ThemeColor.RADICCHIO -> LauncherIconColor.RADICCHIO
    ThemeColor.CHERRY_BLOSSOM -> LauncherIconColor.CHERRY_BLOSSOM
    ThemeColor.COCOA -> LauncherIconColor.COCOA
    ThemeColor.GRAPHITE -> LauncherIconColor.GRAPHITE
    ThemeColor.BIRCH -> LauncherIconColor.BIRCH
}
