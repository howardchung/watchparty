package top.roomio.app.manager

import top.roomio.app.diagnostics.logHandledException

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import co.touchlab.kermit.Logger
import dev.zacsweers.metro.Assisted
import dev.zacsweers.metro.AssistedFactory
import dev.zacsweers.metro.AssistedInject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import top.roomio.domain.party.PartyException
import top.roomio.domain.party.RoomRepository
import top.roomio.domain.party.SessionRepository
import top.roomio.domain.party.isConnectivity
import top.roomio.domain.profile.ProfileRepository

internal data class PartyManagerUiState(
    val mode: ManagerMode,
    val code: String = "",
    val isLoading: Boolean = false,
    val hasCodeError: Boolean = false,
    val canResetIdentity: Boolean = false,
    val showResetConfirmation: Boolean = false,
) {
    val normalizedCode: String
        get() = code.trim().uppercase()

    val canPreview: Boolean
        get() = normalizedCode.isNotEmpty() && !isLoading
}

internal sealed interface PartyManagerAction {
    data class ModeSelected(val mode: ManagerMode) : PartyManagerAction
    data class CodeChanged(val code: String) : PartyManagerAction
    data object BackClicked : PartyManagerAction
    data object CreateClicked : PartyManagerAction
    data object PreviewClicked : PartyManagerAction
    data object ResetRequested : PartyManagerAction
    data object ResetCancelled : PartyManagerAction
    data object ResetConfirmed : PartyManagerAction
    data object PreviewRejected : PartyManagerAction
}

internal sealed interface PartyManagerEffect {
    data class Created(val roomId: String) : PartyManagerEffect
    data class PreviewReady(val code: String) : PartyManagerEffect
    data class Error(val connectivity: Boolean) : PartyManagerEffect
    data object IdentityReset : PartyManagerEffect
}

@AssistedInject
internal class PartyManagerViewModel(
    @Assisted initialMode: ManagerMode,
    @Assisted loading: Boolean = false,
    @Assisted codeError: Boolean = false,
    private val roomRepository: RoomRepository,
    private val profileRepository: ProfileRepository,
    private val sessionRepository: SessionRepository,
) : ViewModel() {
    private val mutableState = MutableStateFlow(
        PartyManagerUiState(
            mode = initialMode,
            code = if (codeError) "NOVA-99" else "",
            isLoading = loading,
            hasCodeError = codeError,
        ),
    )
    val state = mutableState.asStateFlow()

    private val mutableEffects = MutableSharedFlow<PartyManagerEffect>(extraBufferCapacity = 2)
    val effects = mutableEffects.asSharedFlow()

    @AssistedFactory
    fun interface Factory {
        fun create(
            initialMode: ManagerMode,
            loading: Boolean,
            codeError: Boolean,
        ): PartyManagerViewModel
    }

    fun onAction(action: PartyManagerAction) {
        when (action) {
            is PartyManagerAction.ModeSelected -> mutableState.update { it.copy(mode = action.mode) }
            is PartyManagerAction.CodeChanged -> mutableState.update {
                it.copy(code = action.code.uppercase(), hasCodeError = false)
            }
            PartyManagerAction.PreviewRejected -> mutableState.update { it.copy(hasCodeError = true) }
            PartyManagerAction.CreateClicked -> createRoom()
            PartyManagerAction.PreviewClicked -> previewRoom()
            PartyManagerAction.ResetRequested -> mutableState.update { it.copy(showResetConfirmation = true) }
            PartyManagerAction.ResetCancelled -> mutableState.update { it.copy(showResetConfirmation = false) }
            PartyManagerAction.ResetConfirmed -> resetIdentity()
            PartyManagerAction.BackClicked -> Unit
        }
    }

    private fun createRoom() {
        if (mutableState.value.isLoading) return
        mutableState.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            try {
                // Sync the backend identity with the saved profile first so the
                // owner membership uses the current name and avatar.
                profileRepository.currentProfile().let { profile ->
                    sessionRepository.ensureSession(name = profile.name, avatar = profile.avatar.name, language = profile.language.tag)
                }
                val room = roomRepository.createRoom(title = "")
                mutableState.update { it.copy(isLoading = false) }
                mutableEffects.tryEmit(PartyManagerEffect.Created(room.id))
            } catch (error: PartyException) {
                logHandledException("PartyManagerViewModel.catch1", error)
                log.w("create failed: ${error.code} ${error.message}")
                mutableState.update { it.copy(isLoading = false, canResetIdentity = error.code in RESET_CODES) }
                mutableEffects.tryEmit(PartyManagerEffect.Error(error.isConnectivity()))
            }
        }
    }

    private fun previewRoom() {
        val code = mutableState.value.normalizedCode
        if (code.isEmpty() || mutableState.value.isLoading) return
        mutableState.update { it.copy(isLoading = true, hasCodeError = false) }
        viewModelScope.launch {
            try {
                roomRepository.preview(code)
                mutableState.update { it.copy(isLoading = false) }
                mutableEffects.tryEmit(PartyManagerEffect.PreviewReady(code))
            } catch (error: PartyException) {
                logHandledException("PartyManagerViewModel.catch2", error)
                log.w("preview failed: ${error.code} ${error.message}")
                mutableState.update { it.copy(isLoading = false) }
                if (error.code in RESET_CODES) {
                    mutableState.update { it.copy(canResetIdentity = true) }
                    mutableEffects.tryEmit(PartyManagerEffect.Error(connectivity = false))
                } else if (error.isConnectivity()) {
                    mutableEffects.tryEmit(PartyManagerEffect.Error(connectivity = true))
                } else {
                    mutableState.update { it.copy(hasCodeError = true) }
                }
            }
        }
    }

    private fun resetIdentity() {
        if (mutableState.value.isLoading) return
        mutableState.update { it.copy(isLoading = true, showResetConfirmation = false) }
        viewModelScope.launch {
            try {
                sessionRepository.reset()
                mutableState.update { it.copy(isLoading = false, canResetIdentity = false, hasCodeError = false) }
                mutableEffects.tryEmit(PartyManagerEffect.IdentityReset)
            } catch (error: PartyException) {
                logHandledException("PartyManagerViewModel.catch3", error)
                mutableState.update { it.copy(isLoading = false) }
                mutableEffects.tryEmit(PartyManagerEffect.Error(error.isConnectivity()))
            }
        }
    }

    private companion object {
        val RESET_CODES = setOf("INVALID_TOKEN", "SESSION_EXPIRED", "SESSION_REVOKED", "UNAUTHENTICATED")
    }
    private val log = Logger.withTag("PartyManagerVM")
}
