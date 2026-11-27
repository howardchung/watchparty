package top.roomio.app.room

import top.roomio.app.components.WatchPartyIcons
import top.roomio.app.diagnostics.loggedRunCatching

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import watchparty.sharedui.generated.resources.*
import top.roomio.app.profile.ProfileAvatar
import top.roomio.domain.party.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun GroupSyncDialog(state: RoomUiState, chooseFile: () -> Unit = {}, onAction: (RoomAction) -> Unit) {
    if (!state.syncDialogOpen) return
    val attempt=state.groupSync?.takeIf { it.active }
    val acceptedViewerCount=attempt?.participants?.count { it.membershipId!=attempt.ownerMembershipId && it.response==GroupSyncResponse.ACCEPTED } ?: 0
    val draft=attempt==null
    val preparing=attempt?.phase==GroupSyncPhase.PREPARING
    val response=attempt?.participants?.find { it.membershipId==state.syncSelfId }?.response
    val title=stringResource(if(draft)Res.string.group_sync_together else if(state.isOwner)Res.string.group_sync_who else Res.string.group_sync_request)
    val fileRequest=state.localSource && (attempt?.requestId?.startsWith("source-")==true || state.videoUrl.isEmpty())
    val content: @Composable () -> Unit = {
        Column(Modifier.padding(24.dp).heightIn(max=620.dp).verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(16.dp)) {
            Row(verticalAlignment=Alignment.CenterVertically) { Text(if(fileRequest)stringResource(if(state.isOwner)Res.string.local_who_ready else Res.string.local_watch_file)else title,Modifier.weight(1f),style=MaterialTheme.typography.headlineSmall);IconButton(onClick={onAction(RoomAction.SyncDismiss)}){Icon(WatchPartyIcons.Close,stringResource(Res.string.close))} }
            if(state.localSource)Surface(color=MaterialTheme.colorScheme.primaryContainer,shape=MaterialTheme.shapes.large){Column(Modifier.fillMaxWidth().padding(20.dp)){Text(stringResource(Res.string.local_file_to_choose));Text(state.sharedFileName,style=MaterialTheme.typography.titleMedium);if(state.fileLoading)LinearProgressIndicator(Modifier.fillMaxWidth())}}
            if(!draft&&!state.isOwner)Row(horizontalArrangement=Arrangement.spacedBy(12.dp),verticalAlignment=Alignment.CenterVertically){Icon(WatchPartyIcons.Sync,null);Text(stringResource(Res.string.group_sync_inviter,state.model.ownerName),style=MaterialTheme.typography.titleMedium)}
            Surface(color=MaterialTheme.colorScheme.primaryContainer,shape=MaterialTheme.shapes.extraLarge,modifier=Modifier.fillMaxWidth()) {
                Column(Modifier.padding(24.dp),horizontalAlignment=Alignment.CenterHorizontally) {
                    Text(stringResource(Res.string.group_sync_meet))
                    val seconds=(attempt?.targetPositionMs?:state.positionMs)/1000
                    Text("${seconds/60}:${(seconds%60).toString().padStart(2,'0')}",style=MaterialTheme.typography.displayLarge)
                }
            }
            if(preparing)Column(Modifier.fillMaxWidth(),horizontalAlignment=Alignment.CenterHorizontally){LoadingIndicator();Text(stringResource(Res.string.group_sync_preparing))}
            else if(attempt!=null)attempt.participants.filter{it.membershipId!=attempt.ownerMembershipId}.forEach { person ->
                val member=state.syncMembers.find{it.membershipId==person.membershipId}
                val accepted=person.response==GroupSyncResponse.ACCEPTED;val declined=person.response==GroupSyncResponse.DECLINED
                val color=if(accepted)MaterialTheme.colorScheme.secondaryContainer else if(declined)MaterialTheme.colorScheme.errorContainer else MaterialTheme.colorScheme.surfaceContainerLow
                val ink=if(accepted)MaterialTheme.colorScheme.onSecondaryContainer else if(declined)MaterialTheme.colorScheme.onErrorContainer else MaterialTheme.colorScheme.onSurface
                Surface(color=color,contentColor=ink,shape=MaterialTheme.shapes.large,modifier=Modifier.fillMaxWidth()) {
                    Row(Modifier.padding(12.dp),horizontalArrangement=Arrangement.spacedBy(12.dp),verticalAlignment=Alignment.CenterVertically) {
                        val avatar=loggedRunCatching("GroupSyncDialog.run1"){ProfileAvatar.valueOf(member?.avatar.orEmpty().uppercase())}.getOrDefault(ProfileAvatar.COMET)
                        Image(painterResource(avatar.resource),null,Modifier.size(40.dp).clip(CircleShape))
                        Column(Modifier.weight(1f)) {
                            Text(if(person.membershipId==state.syncSelfId)stringResource(Res.string.chat_you) else member?.displayName.orEmpty(),style=MaterialTheme.typography.titleSmall)
                            Text(stringResource(when(person.response){GroupSyncResponse.ACCEPTED->if(fileRequest)Res.string.local_ready else Res.string.group_sync_accepted;GroupSyncResponse.DECLINED->if(fileRequest)Res.string.local_not_watching else Res.string.group_sync_declined;GroupSyncResponse.WITHDRAWN->Res.string.group_sync_withdrawn;else->if(person.membershipId==state.syncSelfId)Res.string.group_sync_pending_you else Res.string.group_sync_pending}),style=MaterialTheme.typography.bodySmall)
                        }
                        if(accepted)Icon(WatchPartyIcons.Check,null)else if(declined)Icon(WatchPartyIcons.Close,null)
                    }
                }
            }
            if(!preparing)FlowRow(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(8.dp,Alignment.End),verticalArrangement=Arrangement.spacedBy(8.dp)) {
                if(draft&&state.localSource&&state.videoUrl.isEmpty())Button(enabled=!state.fileLoading&&state.chat.connected,onClick=chooseFile){Text(stringResource(Res.string.local_choose_file))}
                else if(draft)Button(enabled=!state.syncBusy && state.chat.connected,onClick={onAction(RoomAction.SyncAsk)}){Text(stringResource(Res.string.group_sync_ask))}
                else if(state.isOwner){TextButton(enabled=!state.syncBusy && state.chat.connected,onClick={onAction(RoomAction.SyncCancel)}){Text(stringResource(Res.string.group_sync_cancel))};Button(enabled=!state.syncBusy && state.chat.connected && !state.fileLoading && acceptedViewerCount>0,onClick={onAction(RoomAction.SyncCommit)}){Text(stringResource(Res.string.group_sync_start,acceptedViewerCount))}}
                else if(response==GroupSyncResponse.ACCEPTED) {
                    if(attempt?.phase==GroupSyncPhase.INVITING)Row(
                        Modifier.widthIn(max=240.dp).align(Alignment.CenterVertically).semantics { liveRegion=LiveRegionMode.Polite },
                        horizontalArrangement=Arrangement.spacedBy(10.dp),
                        verticalAlignment=Alignment.CenterVertically,
                    ) {
                        CircularProgressIndicator(Modifier.size(18.dp),strokeWidth=2.dp)
                        Text(stringResource(Res.string.group_sync_waiting_owner),style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    OutlinedButton(enabled=!state.syncBusy && state.chat.connected,onClick={onAction(RoomAction.SyncRespond(GroupSyncResponse.WITHDRAWN))}){Text(stringResource(if(state.localSource)Res.string.local_sit_out else Res.string.group_sync_withdraw))}
                }
                else {TextButton(enabled=!state.syncBusy && state.chat.connected,onClick={onAction(RoomAction.SyncRespond(GroupSyncResponse.DECLINED))}){Text(stringResource(if(state.localSource)Res.string.local_skip else Res.string.group_sync_no))};Button(enabled=!state.syncBusy && state.chat.connected,onClick={if(state.localSource&&state.selectedFileName.isEmpty())chooseFile()else onAction(RoomAction.SyncRespond(GroupSyncResponse.ACCEPTED))}){Text(stringResource(if(state.localSource&&state.selectedFileName.isEmpty())Res.string.local_choose_file else Res.string.group_sync_accept))}}
            }
        }
    }
    BoxWithConstraints(Modifier.fillMaxSize()) {
        if(maxWidth<600.dp)ModalBottomSheet(onDismissRequest={onAction(RoomAction.SyncDismiss)},sheetState=rememberModalBottomSheetState(skipPartiallyExpanded=true)){content()}
        else Dialog(onDismissRequest={onAction(RoomAction.SyncDismiss)}){Surface(shape=MaterialTheme.shapes.extraLarge,color=MaterialTheme.colorScheme.surfaceContainerHigh){content()}}
    }
}
@Composable
internal fun GroupSyncCountdown(value: String?) {
    if(value==null)return
    Box(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.scrim.copy(alpha=.55f)),contentAlignment=Alignment.Center){
        Surface(shape=MaterialTheme.shapes.extraLarge,color=MaterialTheme.colorScheme.primaryContainer){Text(if(value=="Action")stringResource(Res.string.group_sync_action)else value,Modifier.padding(32.dp),style=MaterialTheme.typography.displayLarge,textAlign=TextAlign.Center)}
    }
}
