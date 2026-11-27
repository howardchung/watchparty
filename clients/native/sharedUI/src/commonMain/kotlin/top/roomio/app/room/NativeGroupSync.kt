package top.roomio.app.room

import top.roomio.app.diagnostics.logHandledException
import top.roomio.app.diagnostics.loggedRunCatching

import kotlinx.coroutines.*
import kotlin.math.abs
import kotlin.time.Clock
import kotlin.time.TimeSource
import top.roomio.domain.party.*
import top.roomio.app.room.player.VideoPlayerState
import top.roomio.app.room.player.VideoPlayerStatus

/** Presentation coordinator; owns no transport or platform resources. */
internal class NativeGroupSync(
    private val scope: CoroutineScope,
    private val state: () -> RoomUiState,
    private val update: ((RoomUiState) -> RoomUiState) -> Unit,
    private val session: () -> RealtimeSession?,
    private val stream: () -> String?,
    private val self: () -> String?,
    private val effect: (RoomEffect) -> Unit,
) {
    private var saved: Pair<Long, RoomPlaybackState>? = null
    private var requestId = ""
    private var prepared = ""
    private var readySent: Boolean? = null
    private var failedRequest = ""
    private var startJob: Job? = null
    private var watchdog: Job? = null
    private var serverBase = 0L
    private var serverMark = TimeSource.Monotonic.markNow()
    private var bestRtt = Long.MAX_VALUE
    private fun now() = if (serverBase == 0L) Clock.System.now().toEpochMilliseconds() else serverBase + serverMark.elapsedNow().inWholeMilliseconds
    suspend fun calibrate(transport: RealtimeSession) {
        repeat(4) {
            val start = TimeSource.Monotonic.markNow()
            val time = loggedRunCatching("NativeGroupSync.run3") { transport.syncClock() }.getOrNull() ?: return
            val rtt = start.elapsedNow().inWholeMilliseconds
            if (rtt <= bestRtt) { bestRtt = rtt; serverBase = time + rtt / 2; serverMark = TimeSource.Monotonic.markNow() }
        }
    }
    fun open() { if(state().groupSync?.phase==GroupSyncPhase.SCHEDULED)return; update { it.copy(syncDialogOpen = true) } }
    fun dismiss() { update { it.copy(syncDialogOpen = false) } }
    private fun capture() { if (saved == null) saved = state().positionMs to state().playback; update { it.copy(syncLocked = true, playback = RoomPlaybackState.PAUSED) }; effect(RoomEffect.PlayerPlaying(false)) }
    private fun restore(play: Boolean? = null) {
        val before = saved; saved = null; startJob?.cancel(); watchdog?.cancel(); prepared = ""; readySent = null
        if(before==null){update { it.copy(syncLocked=false,syncCountdown=null) };return}
        update { it.copy(syncLocked = false, syncCountdown = null, positionMs = before?.first ?: it.positionMs, playback = if(play==true) RoomPlaybackState.PLAYING else before?.second ?: RoomPlaybackState.PAUSED) }
        before?.let { effect(RoomEffect.SeekTo(it.first)) }
        effect(RoomEffect.PlayerPlaying(state().playback == RoomPlaybackState.PLAYING))
    }
    private fun send(action: String, response: String? = null, ready: Boolean? = null, reason: String? = null, after: (() -> Unit)? = null) {
        if (state().syncBusy && action !in setOf("ready","failed")) return
        val transport = session() ?: return unavailable()
        val streamId = stream() ?: return unavailable()
        val id = if(action=="invite") requestId else state().groupSync?.requestId ?: return unavailable()
        update { it.copy(syncBusy = true) }
        scope.launch {
            try { transport.groupSync(action,streamId,id,if(action=="invite")state().positionMs else null,response,ready,reason); after?.invoke() }
            catch (error: CancellationException) { logHandledException("NativeGroupSync.catch1", error);  throw error }
            catch (handledError: Throwable) { logHandledException("NativeGroupSync.catch2", handledError);  if(action=="ready")readySent=null; if (state().groupSync?.active != true) restore(); effect(RoomEffect.GroupSyncNotice(GroupSyncNotice.UNAVAILABLE)) }
            finally { update { it.copy(syncBusy = false) } }
        }
    }
    fun ask() { if(state().syncBusy)return; capture(); requestId="sync-"+kotlin.random.Random.nextLong().toULong().toString(16); send("invite") }
    fun respond(response: GroupSyncResponse) {
        if(state().syncBusy)return
        if(response==GroupSyncResponse.ACCEPTED)capture()
        send("respond",response=response.name,after={if(response==GroupSyncResponse.WITHDRAWN){restore(if(state().localSource) false else true);dismiss()}
            if(state().localSource && response in setOf(GroupSyncResponse.WITHDRAWN,GroupSyncResponse.DECLINED)) {update { it.copy(videoUrl="",selectedFileName="",playback=RoomPlaybackState.WAITING_FOR_OWNER,syncLocked=false) };effect(RoomEffect.StopPlayer);dismiss()}
            else if(response==GroupSyncResponse.DECLINED)dismiss()})
    }
    fun commit()=send("commit")
    fun cancel(after: (() -> Unit)? = null)=send("cancel",after=after)
    private fun reportFailure(reason: String) { val id=state().groupSync?.requestId ?: return; if(failedRequest==id)return;failedRequest=id;send("failed",reason=reason) }
    fun playerUnavailable() { if(state().syncLocked)reportFailure("PLAYER_UNAVAILABLE") }
    fun reset() { startJob?.cancel();watchdog?.cancel();saved=null;prepared="";readySent=null;failedRequest="";update { it.copy(groupSync=null,syncLocked=false,syncDialogOpen=false,syncCountdown=null) } }
    fun disconnected() { if(state().syncLocked){restore();dismiss();effect(RoomEffect.GroupSyncNotice(if(state().localSource)GroupSyncNotice.FILE_SYNC_FAILED else GroupSyncNotice.STOPPED))} }
    private fun unavailable() { restore(); effect(RoomEffect.GroupSyncNotice(GroupSyncNotice.UNAVAILABLE)) }
    fun apply(value: GroupSyncAttempt?, serverTimeMs: Long) {
        if(serverBase==0L){serverBase=serverTimeMs;serverMark=TimeSource.Monotonic.markNow()}
        if(value!=null&&value.streamSessionId!=stream())return
        val old=state().groupSync
        if(value!=null&&old!=null){if(value.requestId==old.requestId&&value.revision<=old.revision)return;if(value.requestId!=old.requestId&&value.createdAtMs<old.createdAtMs)return}
        update { it.copy(groupSync=value) }
        if(value==null){if(saved!=null)restore();return}
        val mine=value.participants.find { it.membershipId==self() }
        val included=mine?.response==GroupSyncResponse.ACCEPTED
        if(value.phase==GroupSyncPhase.PREPARING&&included&&old?.requestId!=value.requestId)open()
        if(value.phase==GroupSyncPhase.INVITING){if(old?.requestId!=value.requestId)open();if(included&&saved==null&&(!value.localFile||state().videoUrl.isNotBlank()))capture()}
        if(mine?.response==GroupSyncResponse.EXCLUDED&&saved!=null){restore();dismiss();effect(RoomEffect.GroupSyncNotice(GroupSyncNotice.EXCLUDED))}
        when(value.phase){
            GroupSyncPhase.PREPARING -> if(included&&prepared!=value.requestId){capture();prepared=value.requestId;readySent=null;failedRequest="";update { it.copy(positionMs=value.targetPositionMs) };effect(RoomEffect.SeekTo(value.targetPositionMs))}
            GroupSyncPhase.SCHEDULED -> if(included && (old?.phase!=GroupSyncPhase.SCHEDULED || old.requestId!=value.requestId)){
                dismiss();startJob?.cancel();startJob=scope.launch {
                    val at=value.startAtMs ?: return@launch
                    if(at-now()<0){send("failed",reason="LATE_START");unavailable();return@launch}
                    while(at-now()>0){update { it.copy(syncCountdown=((at-now()+999)/1000).coerceAtMost(3).toString()) };delay(minOf(50L,(at-now()).coerceAtLeast(1)))}
                    if(!value.localFile)saved=null;update { it.copy(syncLocked=false,syncCountdown="Action",playback=RoomPlaybackState.PLAYING) };effect(RoomEffect.PlayerPlaying(true));delay(500);update { it.copy(syncCountdown=null) }
                }
            }
            GroupSyncPhase.CANCELLED -> {restore();dismiss();effect(RoomEffect.GroupSyncNotice(GroupSyncNotice.CANCELLED))}
            GroupSyncPhase.FAILED -> {if(value.localFile&&value.reason=="STREAM_CHANGED"){reset();return};restore();dismiss();effect(RoomEffect.GroupSyncNotice(if(value.localFile)GroupSyncNotice.FILE_SYNC_FAILED else GroupSyncNotice.STOPPED))}
            GroupSyncPhase.COMPLETED -> {saved=null;watchdog?.cancel();update { it.copy(syncLocked=false) };if(!value.localFile&&state().isOwner&&value.participants.any{it.response==GroupSyncResponse.EXCLUDED})effect(RoomEffect.GroupSyncNotice(GroupSyncNotice.OWNER_RECOVERY))}
            else -> Unit
        }
        watchdog?.cancel()
        if(value.active&&state().syncLocked){watchdog=scope.launch {delay(((value.deadlineMs?:now()+15000)-now()+5000).coerceAtLeast(1000));restore();dismiss();effect(RoomEffect.GroupSyncNotice(GroupSyncNotice.STOPPED))}}
    }
    fun player(value: VideoPlayerState) {
        val attempt=state().groupSync?:return
        if(attempt.phase !in setOf(GroupSyncPhase.PREPARING,GroupSyncPhase.SCHEDULED))return
        if(!state().syncLocked && !(attempt.localFile && attempt.phase==GroupSyncPhase.SCHEDULED && value.status==VideoPlayerStatus.ERROR))return
        if(value.status==VideoPlayerStatus.ERROR||(value.isLive&&value.status in setOf(VideoPlayerStatus.READY,VideoPlayerStatus.PAUSED,VideoPlayerStatus.PLAYING))){reportFailure("UNSUPPORTED_PLAYER");return}
        val needed=minOf(2000L,(value.durationMs-attempt.targetPositionMs).coerceAtLeast(0))
        val ready=value.durationMs>0&&value.status in setOf(VideoPlayerStatus.PAUSED,VideoPlayerStatus.READY)&&abs(value.positionMs-attempt.targetPositionMs)<500&&(value.bufferedMs>=attempt.targetPositionMs+needed || value.immediatelyPlayable)
        if(value.status==VideoPlayerStatus.PLAYING)effect(RoomEffect.PlayerPlaying(false))
        if(attempt.phase==GroupSyncPhase.PREPARING&&readySent!=ready){readySent=ready;send("ready",ready=ready)}
        else if(attempt.phase==GroupSyncPhase.SCHEDULED&&!ready)reportFailure("READINESS_LOST")
    }
}
internal enum class GroupSyncNotice { FILE_FAILED, FILE_SYNC_FAILED, CANCELLED, STOPPED, EXCLUDED, OWNER_RECOVERY, UNAVAILABLE }
