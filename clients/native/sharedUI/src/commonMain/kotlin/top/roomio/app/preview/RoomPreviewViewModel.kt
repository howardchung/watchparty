package top.roomio.app.preview

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
import top.roomio.domain.party.RoomAvailability as DomainAvailability
import top.roomio.domain.party.RoomPreview
import top.roomio.domain.party.RoomRepository
import top.roomio.domain.party.SessionRepository
import top.roomio.domain.party.StreamState
import top.roomio.domain.party.isConnectivity
import top.roomio.domain.profile.ProfileRepository

internal data class RoomPreviewUiState(
    val model: RoomPreviewModel = emptyPreviewModel(),
    val isLoading: Boolean = true,
    val errorMessage: String? = null,
    val isOffline: Boolean = false,
) {
    val canJoin: Boolean
        get() = !isLoading && errorMessage == null && model.availability == RoomAvailability.AVAILABLE
}

internal sealed interface RoomPreviewAction {
    data object BackClicked : RoomPreviewAction
    data object JoinClicked : RoomPreviewAction
    data object RetryClicked : RoomPreviewAction
}

internal sealed interface RoomPreviewEffect {
    data class Joined(val roomId: String, val asOwner: Boolean = false) : RoomPreviewEffect
    data class Error(val connectivity: Boolean) : RoomPreviewEffect
}

@AssistedInject
internal class RoomPreviewViewModel(
    @Assisted private val partyCode: String,
    private val roomRepository: RoomRepository,
    private val profileRepository: ProfileRepository,
    private val sessionRepository: SessionRepository,
) : ViewModel() {
    private val mutableState = MutableStateFlow(RoomPreviewUiState())
    val state = mutableState.asStateFlow()

    private val mutableEffects = MutableSharedFlow<RoomPreviewEffect>(extraBufferCapacity = 1)
    val effects = mutableEffects.asSharedFlow()

    private val log = Logger.withTag("RoomPreviewVM")

    init {
        load()
    }

    fun onAction(action: RoomPreviewAction) {
        when (action) {
            RoomPreviewAction.BackClicked -> Unit
            RoomPreviewAction.JoinClicked -> join()
            RoomPreviewAction.RetryClicked -> if (!state.value.isLoading) load()
        }
    }

    @AssistedFactory
    fun interface Factory {
        fun create(partyCode: String): RoomPreviewViewModel
    }

    private fun load() {
        mutableState.update { it.copy(isLoading = true, errorMessage = null, isOffline = false) }
        viewModelScope.launch {
            try {
                // An invite can be the first screen on a fresh installation.
                val profile = profileRepository.currentProfile()
                sessionRepository.ensureSession(name = profile.name, avatar = profile.avatar.name, language = profile.language.tag)
                val preview = roomRepository.preview(partyCode)
                mutableState.update { it.copy(model = preview.toPresentation(), isLoading = false) }
            } catch (error: PartyException) {
                logHandledException("RoomPreviewViewModel.catch1", error)
                log.w("preview load failed: ${error.code} ${error.message}")
                mutableState.update { it.copy(isLoading = false, errorMessage = error.code, isOffline = error.isConnectivity()) }
                mutableEffects.tryEmit(RoomPreviewEffect.Error(error.isConnectivity()))
            }
        }
    }

    private fun join() {
        if (!mutableState.value.canJoin) return
        mutableState.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            try {
                // Sync the backend identity with the saved profile first so the
                // new membership uses the current name and avatar.
                profileRepository.currentProfile().let { profile ->
                    sessionRepository.ensureSession(name = profile.name, avatar = profile.avatar.name, language = profile.language.tag)
                }
                val room = roomRepository.join(partyCode)
                mutableState.update { it.copy(isLoading = false) }
                mutableEffects.tryEmit(RoomPreviewEffect.Joined(room.id, room.ownerIdentityId == sessionRepository.currentSession()?.identity?.id))
            } catch (error: PartyException) {
                logHandledException("RoomPreviewViewModel.catch2", error)
                log.w("join failed: ${error.code} ${error.message}")
                mutableState.update { it.copy(isLoading = false, errorMessage = error.code, isOffline = error.isConnectivity()) }
                mutableEffects.tryEmit(RoomPreviewEffect.Error(error.isConnectivity()))
            }
        }
    }
}

private fun emptyPreviewModel() = RoomPreviewModel(
    code = "",
    title = "",
    ownerName = "",
    ownerPresent = false,
    participantCount = 0,
    availability = RoomAvailability.AVAILABLE,
    streamStatus = PreviewStreamStatus.WAITING,
)

private fun RoomPreview.toPresentation() = RoomPreviewModel(
    code = code,
    title = title,
    ownerName = ownerName,
    ownerPresent = ownerPresent,
    participantCount = participantCount,
    availability = when (availability) {
        DomainAvailability.OPEN -> RoomAvailability.AVAILABLE
        DomainAvailability.FULL -> RoomAvailability.FULL
        DomainAvailability.ENDED -> RoomAvailability.ENDED
    },
    streamStatus = if (streamState == StreamState.ACTIVE) PreviewStreamStatus.PLAYING else PreviewStreamStatus.WAITING,
)
