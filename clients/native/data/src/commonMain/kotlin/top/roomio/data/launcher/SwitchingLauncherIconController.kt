package top.roomio.data.launcher

import top.roomio.data.diagnostics.loggedRunCatching

import top.roomio.domain.launcher.LauncherIconColor
import top.roomio.domain.launcher.LauncherIconController

/** Narrow platform boundary also lets tests exercise partial component-update failures. */
internal interface LauncherComponents {
    val supportsAtomicChanges: Boolean
    fun isEnabled(color: LauncherIconColor): Boolean
    fun setEnabled(color: LauncherIconColor, enabled: Boolean)
    fun selectAtomically(color: LauncherIconColor)
}

internal class SwitchingLauncherIconController(
    private val components: LauncherComponents,
) : LauncherIconController {
    override val isSupported = true

    override fun currentColor(): Result<LauncherIconColor> = loggedRunCatching("SwitchingLauncherIconController.run1") {
        val enabled = LauncherIconColor.entries.filter(components::isEnabled)
        check(enabled.size == 1) { "Launcher icon state needs repair: select a color again" }
        enabled.single()
    }

    override fun selectColor(color: LauncherIconColor): Result<Unit> = loggedRunCatching("SwitchingLauncherIconController.run2") {
        val enabled = LauncherIconColor.entries.filter(components::isEnabled)
        if (enabled == listOf(color)) return@loggedRunCatching
        if (components.supportsAtomicChanges) {
            components.selectAtomically(color)
        } else {
            // API 23–32: always make the replacement launchable before removing others.
            // On a partial failure, return an error and leave at least one entry usable.
            if (color !in enabled) components.setEnabled(color, true)
            enabled.filter { it != color }.forEach { components.setEnabled(it, false) }
        }
        check(LauncherIconColor.entries.filter(components::isEnabled) == listOf(color)) {
            "Launcher icon update was not applied"
        }
    }
}

internal class UnsupportedLauncherIconController : LauncherIconController {
    override val isSupported = false
    override fun currentColor(): Result<LauncherIconColor> = unsupported()
    override fun selectColor(color: LauncherIconColor): Result<Unit> = unsupported()
    private fun <T> unsupported(): Result<T> =
        Result.failure(UnsupportedOperationException("Launcher icon selection is Android-only"))
}
