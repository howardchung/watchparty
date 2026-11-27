package top.roomio.data.profile

import com.russhwolf.settings.MapSettings
import kotlin.random.Random
import kotlin.test.*
import top.roomio.domain.profile.ProfileAvatarId
import top.roomio.domain.profile.ThemeColor

class InitialProfilePreferencesTest {
    @Test fun newDefaultsPersistAcrossConstructionOrderAndRestarts() {
        val settings = MapSettings()
        initializeProfilePreferences(settings, random = Random(12))
        val profile = PreferencesProfileRepository(settings).currentProfile()
        val theme = PreferencesThemeRepository(settings).color.value
        assertNotEquals(ThemeColor.ROOMIO, theme)
        initializeProfilePreferences(settings, random = Random(99))
        assertEquals(profile, PreferencesProfileRepository(settings).currentProfile())
        assertEquals(theme, PreferencesThemeRepository(settings).color.value)
        PreferencesProfileRepository(settings).saveProfile(profile.copy(avatar = ProfileAvatarId.ORBIT)).getOrThrow()
        PreferencesThemeRepository(settings).selectColor(ThemeColor.ROOMIO).getOrThrow()
        assertEquals(ProfileAvatarId.ORBIT, PreferencesProfileRepository(settings).currentProfile().avatar)
        assertEquals(ThemeColor.ROOMIO, PreferencesThemeRepository(settings).color.value)
    }
    @Test fun existingManualChoicesAndImplicitSessionDefaultsNeverReroll() {
        val chosen = MapSettings().apply { putString("profile.avatar", "COMET"); putString("appearance.color", "SAGE") }
        initializeProfilePreferences(chosen, random = Random(4))
        assertEquals(ProfileAvatarId.COMET, PreferencesProfileRepository(chosen).currentProfile().avatar)
        assertEquals(ThemeColor.SAGE, PreferencesThemeRepository(chosen).color.value)
        val existing = MapSettings()
        initializeProfilePreferences(existing, existingSession = true, random = Random(4))
        assertEquals(ProfileAvatarId.COMET, PreferencesProfileRepository(existing).currentProfile().avatar)
        assertEquals(ThemeColor.ROOMIO, PreferencesThemeRepository(existing).color.value)
    }
    @Test fun separateFreshUsersReceiveVariedInitialChoices() {
        val avatars = mutableSetOf<String>()
        val colors = mutableSetOf<String>()
        repeat(100) { seed ->
            val settings = MapSettings()
            initializeProfilePreferences(settings, random = Random(seed))
            avatars += settings.getString("profile.avatar", "")
            colors += settings.getString("appearance.color", "")
        }
        assertTrue(avatars.size > 1)
        assertTrue(colors.size > 1)
    }
}
