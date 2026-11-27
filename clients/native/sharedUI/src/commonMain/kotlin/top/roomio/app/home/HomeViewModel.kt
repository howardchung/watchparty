package top.roomio.app.home

import top.roomio.app.diagnostics.logHandledException

import top.roomio.app.room.HomeBugReportState
import top.roomio.app.room.RoomAction
import kotlinx.coroutines.flow.update
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.zacsweers.metro.Inject
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import top.roomio.domain.party.RoomRepository
import top.roomio.domain.party.RoomAvailability
import top.roomio.domain.party.PartyException
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import top.roomio.app.profile.ProfileAvatar
import top.roomio.app.profile.toPresentationAvatar
import top.roomio.domain.party.SessionRepository
import top.roomio.domain.profile.ProfileRepository

internal data class HomeUiState(
    val identityName: String = "Nika",
    val identityAvatar: ProfileAvatar = ProfileAvatar.COMET,
    val report: HomeBugReportState = HomeBugReportState(),
    val roomPreview: HomeRoomPreview? = null,
)

internal sealed interface HomeAction {
    data class Report(val action: RoomAction) : HomeAction
    data object SettingsClicked : HomeAction
    data object CreatePartyClicked : HomeAction
    data object JoinPartyClicked : HomeAction
    data object OpenRoomClicked : HomeAction
}

@Inject
internal class HomeViewModel(
    private val profileRepository: ProfileRepository,
    private val sessionRepository: SessionRepository,
    private val roomRepository: RoomRepository,
) : ViewModel() {
    private val report = MutableStateFlow(HomeBugReportState())
    private val lastRoom = MutableStateFlow<HomeRoomPreview?>(null)
    private var refreshJob: Job? = null

    fun onReportAction(action: RoomAction) {
        when (action) {
            RoomAction.BugReportClicked -> report.update { it.copy(bugReportOpen = true, bugSent = false) }
            RoomAction.BugReportDismissed -> if (!report.value.bugSending) report.update { it.copy(bugReportOpen = false) }
            is RoomAction.BugDescriptionChanged -> if (!report.value.bugSending) report.update { it.copy(bugDescription = action.description.take(8000), bugError = null, bugSent = false) }
            is RoomAction.BugScreenshotsAdded -> if (!report.value.bugSending) report.update {
                val images = it.bugScreenshots + action.screenshots
                if (images.size > top.roomio.domain.party.REPORT_SCREENSHOT_MAX_COUNT || images.sumOf { image -> image.byteSize } > top.roomio.domain.party.REPORT_SCREENSHOT_MAX_BYTES) it.copy(bugScreenshotError = "SCREENSHOTS_TOO_LARGE")
                else it.copy(bugScreenshots = images, bugScreenshotError = null, bugSent = false)
            }
            is RoomAction.BugScreenshotRemoved -> if (!report.value.bugSending) report.update { it.copy(bugScreenshots = it.bugScreenshots.filterIndexed { index, _ -> index != action.index }, bugScreenshotError = null) }
            is RoomAction.BugScreenshotFailed -> if (!report.value.bugSending) report.update { it.copy(bugScreenshotError = action.code) }
            RoomAction.BugReportSend -> sendBugReport()
            else -> Unit
        }
    }

    private fun sendBugReport() {
        val current = report.value
        if (current.bugSending || current.bugDescription.isBlank() || current.bugSent) return
        report.update { it.copy(bugSending = true, bugError = null) }
        viewModelScope.launch {
            try {
                val profile = profileRepository.currentProfile()
                sessionRepository.ensureSession(profile.name, profile.avatar.name, profile.language.tag)
                roomRepository.reportBug(null, current.bugDescription, current.bugScreenshots)
                report.update { it.copy(bugSending = false, bugDescription = "", bugScreenshots = emptyList(), bugScreenshotError = null, bugSent = true) }
            } catch (cancelled: CancellationException) { logHandledException("HomeViewModel.sendBugReport.cancelled", cancelled);  throw cancelled
            } catch (error: Throwable) {
                logHandledException("HomeViewModel.sendBugReport", error)
                report.update { it.copy(bugSending = false, bugError = (error as? PartyException)?.code ?: "UNAVAILABLE") }
            }
        }
    }

    fun refreshLastRoom() {
        refreshJob?.cancel()
        refreshJob = viewModelScope.launch {
            try {
                fun top.roomio.domain.party.Room.toCard() = HomeRoomPreview(title, 0, true, code)
                lastRoom.value = roomRepository.lastRoom()?.toCard()
                val profile = profileRepository.currentProfile()
                sessionRepository.ensureSession(profile.name, profile.avatar.name, profile.language.tag)
                val saved = roomRepository.lastRoom() ?: return@launch
                lastRoom.value = saved.toCard()
                val preview = roomRepository.preview(saved.code)
                lastRoom.value = if (preview.availability == RoomAvailability.ENDED) null else saved.toCard().copy(title = preview.title)
            } catch (cancelled: CancellationException) {
                logHandledException("HomeViewModel.catch1", cancelled)
                throw cancelled
            } catch (error: Exception) {
                logHandledException("HomeViewModel.catch2", error)
                if (error is PartyException && error.code in setOf("ROOM_ENDED", "ROOM_NOT_FOUND")) lastRoom.value = null
                // Keep the cached card offline; opening it offers preview retry.
            }
        }
    }

    val state: StateFlow<HomeUiState> = combine(profileRepository.observeProfile(), lastRoom, report) { profile, room, reportState ->
            HomeUiState(
                identityName = profile.name,
                identityAvatar = profile.avatar.toPresentationAvatar(),
                roomPreview = room,
                report = reportState,
            )
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = profileRepository.currentProfile().let { profile ->
                HomeUiState(
                    identityName = profile.name,
                    identityAvatar = profile.avatar.toPresentationAvatar(),
                )
            },
        )
}
