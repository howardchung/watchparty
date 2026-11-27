package top.roomio.data.profile

import top.roomio.data.diagnostics.loggedRunCatching

import com.russhwolf.settings.Settings
import dev.zacsweers.metro.Inject
import dev.zacsweers.metro.AppScope
import dev.zacsweers.metro.SingleIn
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import top.roomio.domain.profile.ProfileAvatarId
import top.roomio.domain.profile.ProfileRepository
import top.roomio.domain.profile.UserProfile

@SingleIn(AppScope::class)
@Inject
class PreferencesProfileRepository(
    private val settings: Settings,
) : ProfileRepository {
    init { initializeProfilePreferences(settings) }

    private val mutableProfile = MutableStateFlow(readProfile())

    override fun observeProfile() = mutableProfile.asStateFlow()

    override fun currentProfile(): UserProfile = mutableProfile.value

    override fun saveProfile(profile: UserProfile): Result<Unit> = loggedRunCatching("PreferencesProfileRepository.run1") {
        val namedProfile = profile.copy(name = profile.name.trim())
        settings.putString(NAME_KEY, namedProfile.name)
        settings.putString(AVATAR_KEY, profile.avatar.name)
        settings.putString("profile.language", profile.language.tag)
        mutableProfile.value = namedProfile
    }

    private fun readProfile(): UserProfile {
        val storedAvatar = settings.getString(AVATAR_KEY, ProfileAvatarId.COMET.name)
        val avatar = ProfileAvatarId.entries
            .firstOrNull { it.name == storedAvatar }
            ?: ProfileAvatarId.COMET

        val language = top.roomio.domain.profile.AppLanguage.fromTag(settings.getString("profile.language", "en"))
        return UserProfile(
            name = settings.getString(NAME_KEY, avatar.displayName(language)),
            avatar = avatar,
            language = language,
        )
    }

    private companion object {
        // Older releases ignored profile.name and always displayed the localized avatar name.
        const val NAME_KEY = "profile.display-name"
        const val AVATAR_KEY = "profile.avatar"

    }
}
