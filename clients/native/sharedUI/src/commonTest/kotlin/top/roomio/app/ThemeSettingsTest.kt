package top.roomio.app

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import top.roomio.app.profile.SettingsAction
import top.roomio.app.profile.SettingsViewModel
import top.roomio.domain.profile.ThemeColor

class ThemeSettingsTest {
    @Test
    fun selectingColorAppliesWithoutSavingProfileAndRecoversFromFailure() {
        val preferences = TestThemePreferencesRepository()
        val profile = TestProfileRepository()
        val viewModel = SettingsViewModel(profile, preferences)
        viewModel.onAction(SettingsAction.AvatarSelected(top.roomio.app.profile.ProfileAvatar.MINT))
        viewModel.onAction(SettingsAction.ColorSelected(ThemeColor.SAGE))
        assertEquals(ThemeColor.SAGE, preferences.color.value)
        assertEquals(ThemeColor.SAGE, viewModel.state.value.themeColor)
        assertEquals("Nika", profile.currentProfile().name)
        preferences.failWrites = true
        viewModel.onAction(SettingsAction.ColorSelected(ThemeColor.COCOA))
        assertTrue(viewModel.state.value.colorSaveFailed)
        assertEquals(ThemeColor.SAGE, preferences.color.value)
        preferences.failWrites = false
        viewModel.onAction(SettingsAction.ColorSelected(ThemeColor.COCOA))
        assertFalse(viewModel.state.value.colorSaveFailed)
        assertEquals(ThemeColor.COCOA, preferences.color.value)
        assertEquals(ThemeColor.COCOA, SettingsViewModel(profile, preferences).state.value.themeColor)
    }
}
