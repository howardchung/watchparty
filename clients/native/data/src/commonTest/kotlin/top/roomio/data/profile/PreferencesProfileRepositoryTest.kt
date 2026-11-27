package top.roomio.data.profile

import com.russhwolf.settings.MapSettings
import kotlin.test.Test
import kotlin.test.assertTrue
import kotlin.test.assertEquals
import top.roomio.domain.profile.ProfileAvatarId
import top.roomio.domain.profile.UserProfile

class PreferencesProfileRepositoryTest {
    @Test
    fun generatedNamePersistsBeforeAnyProfileEdit() {
        val settings = MapSettings()
        val first = PreferencesProfileRepository(settings).currentProfile()
        assertEquals(first.avatar.displayName, first.name)
        assertTrue(first.name.none { it.isDigit() })
        assertTrue(first.name.length <= 48)
        assertEquals(first, PreferencesProfileRepository(settings).currentProfile())
        assertEquals(first.avatar.name, settings.getString("profile.avatar", ""))
    }

    @Test
    fun previousCustomNameIsReplacedWithoutChangingTheSavedAvatar() {
        val settings = MapSettings().apply { putString("profile.name", "Previous custom name"); putString("profile.avatar", "BERRY") }
        val first = PreferencesProfileRepository(settings).currentProfile()
        assertEquals("Captain Octopus", first.name)
        assertEquals(first, PreferencesProfileRepository(settings).currentProfile())
    }

    @Test
    fun profilePersistsAcrossRepositoryInstances() {
        val settings = MapSettings()
        val repository = PreferencesProfileRepository(settings)

        repository.saveProfile(
            UserProfile(
                name = "Mira",
                avatar = ProfileAvatarId.MINT,
            ),
        )

        val restoredProfile = PreferencesProfileRepository(settings).currentProfile()
        assertEquals("Frog Wizard", restoredProfile.name)
        assertEquals(ProfileAvatarId.MINT, restoredProfile.avatar)
    }
    @Test
    fun persianLanguagePersistsAndUnknownTagsFallBackToEnglish() {
        val settings = MapSettings()
        val repository = PreferencesProfileRepository(settings)
        val profile = repository.currentProfile().copy(language = top.roomio.domain.profile.AppLanguage.PERSIAN)
        repository.saveProfile(profile).getOrThrow()
        assertEquals(profile.copy(name = profile.avatar.displayName(profile.language)), PreferencesProfileRepository(settings).currentProfile())
        assertEquals(profile.avatar.displayName(profile.language), repository.currentProfile().name)
        settings.putString("profile.language", "unknown")
        assertEquals(top.roomio.domain.profile.AppLanguage.ENGLISH, PreferencesProfileRepository(settings).currentProfile().language)
    }
    @Test
    fun existingPersianProfileAndLanguageSwitchUseAvatarNames() {
        val settings = MapSettings().apply {
            putString("profile.avatar", "MINT")
            putString("profile.name", "Frog Wizard")
            putString("profile.language", "fa")
        }
        val repository = PreferencesProfileRepository(settings)
        assertEquals("قورباغهٔ جادوگر", repository.currentProfile().name)
        repository.saveProfile(repository.currentProfile().copy(language = top.roomio.domain.profile.AppLanguage.ENGLISH)).getOrThrow()
        assertEquals("Frog Wizard", repository.currentProfile().name)
        assertEquals(repository.currentProfile(), PreferencesProfileRepository(settings).currentProfile())
    }

}
