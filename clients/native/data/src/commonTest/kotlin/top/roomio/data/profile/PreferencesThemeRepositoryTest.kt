package top.roomio.data.profile

import com.russhwolf.settings.MapSettings
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import top.roomio.domain.profile.ThemeColor

class PreferencesThemeRepositoryTest {
    @Test
    fun allNamedColorsPersistIndependentlyOfProfile() {
        val settings = MapSettings()
        val repository = PreferencesThemeRepository(settings)
        assertTrue(repository.color.value != ThemeColor.ROOMIO)
        ThemeColor.entries.forEach { color ->
            assertTrue(repository.selectColor(color).isSuccess)
            assertEquals(color, repository.color.value)
            PreferencesProfileRepository(settings).saveProfile(top.roomio.domain.profile.UserProfile("Mira", top.roomio.domain.profile.ProfileAvatarId.MINT))
            assertEquals(color, PreferencesThemeRepository(settings).color.value)
        }
    }

    @Test
    fun unknownStoredColorUsesWatchPartyDefault() {
        val settings = MapSettings().apply { putString("appearance.color", "removed-color") }
        assertEquals(ThemeColor.ROOMIO, PreferencesThemeRepository(settings).color.value)
    }
}
