package top.roomio.data.launcher

import kotlin.test.*
import top.roomio.domain.launcher.LauncherIconColor
import top.roomio.domain.launcher.LauncherIconColor.*

class SwitchingLauncherIconControllerTest {
    @Test fun selectsEveryColorAndPersistsAcrossControllerInstances() {
        val components = FakeComponents()
        for (color in LauncherIconColor.entries) {
            assertTrue(SwitchingLauncherIconController(components).selectColor(color).isSuccess)
            assertEquals(setOf(color), components.enabled)
            assertEquals(color, SwitchingLauncherIconController(components).currentColor().getOrThrow())
        }
    }

    @Test fun selectionAlreadyAppliedDoesNotNotifyLauncherAgain() {
        val components = FakeComponents()
        assertTrue(SwitchingLauncherIconController(components).selectColor(BASIL).isSuccess)
        assertTrue(components.changes.isEmpty())
    }

    @Test fun olderAndroidEnablesReplacementBeforeDisablingCurrentIcon() {
        val components = FakeComponents()
        SwitchingLauncherIconController(components).selectColor(TOMATO).getOrThrow()
        assertEquals(listOf("TOMATO:true", "BASIL:false"), components.changes)
        assertFalse(components.everEmpty)
    }

    @Test fun failedEnableKeepsExistingIconAndReportsFailure() {
        val components = FakeComponents().apply { failChange = "TOMATO:true" }
        assertTrue(SwitchingLauncherIconController(components).selectColor(TOMATO).isFailure)
        assertEquals(setOf(BASIL), components.enabled)
    }

    @Test fun partialDisableFailureKeepsAppLaunchableAndRetryRepairsDuplicates() {
        val components = FakeComponents().apply { failChange = "BASIL:false" }
        val controller = SwitchingLauncherIconController(components)
        assertTrue(controller.selectColor(TOMATO).isFailure)
        assertFalse(components.everEmpty)
        assertTrue(controller.currentColor().isFailure)
        components.failChange = null
        controller.selectColor(TOMATO).getOrThrow()
        assertEquals(setOf(TOMATO), components.enabled)
    }

    @Test fun atomicSwitchDoesNotPerformIndividualWrites() {
        val components = FakeComponents(atomic = true)
        SwitchingLauncherIconController(components).selectColor(CHERRY_BLOSSOM).getOrThrow()
        assertEquals(listOf("atomic:CHERRY_BLOSSOM"), components.changes)
        assertEquals(setOf(CHERRY_BLOSSOM), components.enabled)
    }

    @Test fun missingEnabledAliasCanBeRecoveredBySelection() {
        val components = FakeComponents().apply { enabled.clear() }
        val controller = SwitchingLauncherIconController(components)
        assertTrue(controller.currentColor().isFailure)
        controller.selectColor(COBALT).getOrThrow()
        assertEquals(COBALT, controller.currentColor().getOrThrow())
    }

    @Test fun otherPlatformsExplicitlyReportUnsupported() {
        val controller = UnsupportedLauncherIconController()
        assertFalse(controller.isSupported)
        assertTrue(controller.selectColor(TOMATO).isFailure)
        assertTrue(controller.currentColor().isFailure)
    }

    private class FakeComponents(atomic: Boolean = false) : LauncherComponents {
        override val supportsAtomicChanges = atomic
        val enabled = mutableSetOf(BASIL)
        val changes = mutableListOf<String>()
        var everEmpty = false
        var failChange: String? = null
        override fun isEnabled(color: LauncherIconColor) = color in enabled
        override fun setEnabled(color: LauncherIconColor, enabled: Boolean) {
            val change = "$color:$enabled"
            check(change != failChange) { "Simulated package manager failure" }
            changes += change
            if (enabled) this.enabled += color else this.enabled -= color
            everEmpty = everEmpty || this.enabled.isEmpty()
        }
        override fun selectAtomically(color: LauncherIconColor) {
            changes += "atomic:$color"
            enabled.clear()
            enabled += color
        }
    }
}
