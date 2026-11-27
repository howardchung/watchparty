package top.roomio.app.profile

import top.roomio.app.diagnostics.logHandledException

import top.roomio.domain.profile.ThemeColor
import top.roomio.domain.profile.ThemePreferencesRepository
import androidx.lifecycle.ViewModel
import dev.zacsweers.metro.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import top.roomio.domain.profile.ProfileRepository
import top.roomio.domain.profile.UserProfile

internal data class SettingsUiState(
    val draftAvatar: ProfileAvatar,
    val saveFailed: Boolean = false,
    val themeColor: ThemeColor = ThemeColor.ROOMIO,
    val colorSaveFailed: Boolean = false,
    val draftLanguage: top.roomio.domain.profile.AppLanguage = top.roomio.domain.profile.AppLanguage.ENGLISH,
) {
    val displayName: String
        get() = draftAvatar.toDomainAvatar().displayName(draftLanguage)
}

internal sealed interface SettingsAction {
    data class AvatarSelected(val avatar: ProfileAvatar) : SettingsAction
    data class ColorSelected(val color: ThemeColor) : SettingsAction
    data class LanguageSelected(val language: top.roomio.domain.profile.AppLanguage) : SettingsAction
    data object BackClicked : SettingsAction
    data object SaveClicked : SettingsAction
}

internal enum class SettingsEffect {
    PROFILE_SAVED,
}

@Inject
internal class SettingsViewModel(
    private val profileRepository: ProfileRepository,
    private val themePreferencesRepository: ThemePreferencesRepository,
) : ViewModel() {
    private val initialProfile = profileRepository.currentProfile()
    private val mutableState = MutableStateFlow(
        SettingsUiState(
            themeColor = themePreferencesRepository.color.value,
            draftLanguage = initialProfile.language,
            draftAvatar = initialProfile.avatar.toPresentationAvatar(),
        ),
    )
    val state = mutableState.asStateFlow()

    private val mutableEffects = MutableSharedFlow<SettingsEffect>(extraBufferCapacity = 1)
    val effects = mutableEffects.asSharedFlow()

    fun onAction(action: SettingsAction) {
        when (action) {
            is SettingsAction.AvatarSelected -> mutableState.update {
                it.copy(
                    draftAvatar = action.avatar,
                    saveFailed = false,
                )
            }
            is SettingsAction.ColorSelected -> {
                themePreferencesRepository.selectColor(action.color).fold(
                    onSuccess = { mutableState.update { it.copy(themeColor = action.color, colorSaveFailed = false) } },
                    onFailure = { logHandledException("Settings.selectColor", it); mutableState.update { it.copy(colorSaveFailed = true) } },
                )
            }
            is SettingsAction.LanguageSelected -> mutableState.update { it.copy(draftLanguage = action.language, saveFailed = false) }
            SettingsAction.SaveClicked -> saveProfile()
            SettingsAction.BackClicked -> Unit
        }
    }

    private fun saveProfile() {
        val currentState = state.value

        profileRepository.saveProfile(
            UserProfile(
                name = currentState.displayName,
                language = currentState.draftLanguage,
                avatar = currentState.draftAvatar.toDomainAvatar(),
            ),
        ).fold(
            onSuccess = {
                mutableState.update { it.copy(saveFailed = false) }
                mutableEffects.tryEmit(SettingsEffect.PROFILE_SAVED)
            },
            onFailure = {
                logHandledException("Settings.saveProfile", it)
                mutableState.update { it.copy(saveFailed = true) }
            },
        )
    }
}
