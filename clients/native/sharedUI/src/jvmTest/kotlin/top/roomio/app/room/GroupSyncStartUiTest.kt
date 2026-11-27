package top.roomio.app.room

import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.test.*
import top.roomio.app.locale.AppLanguageEnvironment
import top.roomio.app.theme.WatchPartyTheme
import top.roomio.domain.party.*
import top.roomio.domain.profile.AppLanguage
import kotlin.test.Test
import kotlin.test.assertEquals

@OptIn(ExperimentalTestApi::class)
class GroupSyncStartUiTest {
    @Test fun startCountsViewersAndRequiresAcceptance() = runComposeUiTest {
        val model = RoomScreenModel("Movie night", "ABCD2345", RoomRole.OWNER, "Nika", true, RoomPlaybackState.PAUSED, emptyList())
        fun attempt(vararg responses: GroupSyncResponse) = GroupSyncAttempt(
            requestId="attempt", streamSessionId="stream", streamRevision=1, ownerMembershipId="owner",
            targetPositionMs=1000, createdAtMs=0, revision=1, phase=GroupSyncPhase.INVITING,
            participants=listOf(GroupSyncParticipant("owner", GroupSyncResponse.ACCEPTED)) +
                responses.mapIndexed { index, response -> GroupSyncParticipant("viewer$index", response) },
        )
        val state = mutableStateOf(RoomUiState(model, groupSync=attempt(GroupSyncResponse.PENDING), syncDialogOpen=true,
            syncSelfId="owner", chat=RoomChatState(connected=true)))
        val actions = mutableListOf<RoomAction>()
        setContent {
            AppLanguageEnvironment(AppLanguage.ENGLISH) {
                WatchPartyTheme(darkTheme=false) { GroupSyncDialog(state.value) { actions += it } }
            }
        }
        onNodeWithText("Start with 0").assertIsNotEnabled()
        runOnIdle { state.value=state.value.copy(groupSync=attempt(GroupSyncResponse.DECLINED, GroupSyncResponse.WITHDRAWN)) }
        onNodeWithText("Start with 0").assertIsNotEnabled()
        runOnIdle { state.value=state.value.copy(groupSync=attempt(GroupSyncResponse.ACCEPTED, GroupSyncResponse.PENDING)) }
        onNodeWithText("Start with 1").assertIsEnabled()
        runOnIdle { state.value=state.value.copy(groupSync=attempt(GroupSyncResponse.ACCEPTED, GroupSyncResponse.ACCEPTED)) }
        onNodeWithText("Start with 2").assertIsEnabled()
        runOnIdle { state.value=state.value.copy(groupSync=attempt(GroupSyncResponse.WITHDRAWN, GroupSyncResponse.WITHDRAWN)) }
        onNodeWithText("Start with 0").assertIsNotEnabled()
        runOnIdle { state.value=state.value.copy(groupSync=attempt(GroupSyncResponse.ACCEPTED), syncBusy=true) }
        onNodeWithText("Start with 1").assertIsNotEnabled()
        runOnIdle { state.value=state.value.copy(syncBusy=false, chat=RoomChatState(connected=false)) }
        onNodeWithText("Start with 1").assertIsNotEnabled()
        runOnIdle { state.value=state.value.copy(chat=RoomChatState(connected=true)) }
        onNodeWithText("Start with 1").assertIsEnabled().performClick()
        runOnIdle { assertEquals(listOf<RoomAction>(RoomAction.SyncCommit), actions) }
    }
}
