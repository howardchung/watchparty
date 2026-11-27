package top.roomio.data.profile

import top.roomio.data.diagnostics.loggedRunCatching

import com.russhwolf.settings.Settings
import dev.zacsweers.metro.AppScope
import dev.zacsweers.metro.SingleIn
import top.roomio.data.party.SecureCredentialStorage
import dev.zacsweers.metro.Binds
import dev.zacsweers.metro.BindingContainer
import dev.zacsweers.metro.Provides
import top.roomio.domain.profile.ProfileRepository

@BindingContainer
interface ProfileDataBindings {
    @Binds
    fun bindProfileRepository(
        repository: PreferencesProfileRepository,
    ): ProfileRepository

    @Binds
    fun bindThemePreferencesRepository(repository: PreferencesThemeRepository): top.roomio.domain.profile.ThemePreferencesRepository

    companion object {
        @Provides
        @SingleIn(AppScope::class)
        fun provideSettings(secureStorage: SecureCredentialStorage): Settings = Settings().also {
            // Storage errors must not be mistaken for a brand-new identity.
            val existingSession = loggedRunCatching("ProfileDataBindings.run1") { secureStorage.read() != null }.getOrDefault(true)
            initializeProfilePreferences(it, existingSession)
        }
    }
}
