package top.roomio.app.room

import kotlinx.coroutines.flow.emptyFlow
import kotlinx.coroutines.test.*
import kotlin.test.*
import top.roomio.domain.party.*
import top.roomio.app.room.player.*

@OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
class NativeGroupSyncTest {
 private class Transport : RealtimeSession {
  override val events = emptyFlow<RealtimeEvent>()
  val commands=mutableListOf<String>()
  override suspend fun reportPlayback(streamSessionId:String,positionMs:Long,playing:Boolean)=Unit
  override suspend fun requestSync(streamSessionId:String,positionMs:Long,requestId:String)=Unit
  override suspend fun close()=Unit
  override suspend fun groupSync(action:String,streamSessionId:String,requestId:String,positionMs:Long?,response:String?,ready:Boolean?,reason:String?):GroupSyncAttempt? {commands+="$action:${response?:ready?:reason?:""}";return null}
 }
 private fun attempt(phase:GroupSyncPhase=GroupSyncPhase.INVITING,revision:Long=1)=GroupSyncAttempt("request","stream",1,"owner",10000,1,revision,phase,listOf(GroupSyncParticipant("guest",GroupSyncResponse.ACCEPTED)))
 @Test fun withdrawRestoresSavedMomentAndStartsEvenPreviouslyPausedVideo()=runTest {
  var state=RoomUiState(joinedRoomModel("test"),positionMs=42000,playback=RoomPlaybackState.PAUSED)
  val effects=mutableListOf<RoomEffect>();val transport=Transport()
  val sync=NativeGroupSync(backgroundScope,{state},{state=it(state)},{transport},{"stream"},{"guest"},{effects+=it})
  sync.apply(attempt(),1);assertTrue(state.syncLocked);assertEquals(42000,state.positionMs)
  sync.respond(GroupSyncResponse.WITHDRAWN);runCurrent()
  assertFalse(state.syncLocked);assertFalse(state.syncDialogOpen);assertEquals(RoomPlaybackState.PLAYING,state.playback)
  assertTrue(effects.contains(RoomEffect.SeekTo(42000)));assertTrue(effects.contains(RoomEffect.PlayerPlaying(true)))
 }
 @Test fun readinessUsesRealBufferAndUnsupportedPlayerIsReportedOnlyOnce()=runTest {
  var state=RoomUiState(joinedRoomModel("test"),positionMs=42000)
  val transport=Transport();val sync=NativeGroupSync(backgroundScope,{state},{state=it(state)},{transport},{"stream"},{"guest"},{})
  sync.apply(attempt(GroupSyncPhase.PREPARING),1)
  val player=VideoPlayerState(VideoPlayerStatus.PAUSED,10000,60000,11000)
  sync.player(player);runCurrent();assertEquals("ready:false",transport.commands.last())
  sync.player(player.copy(bufferedMs=12000));runCurrent();assertEquals("ready:true",transport.commands.last())
  repeat(10){sync.player(player.copy(status=VideoPlayerStatus.ERROR))};runCurrent()
  assertEquals(1,transport.commands.count{it=="failed:UNSUPPORTED_PLAYER"})
  sync.reset();assertFalse(state.syncLocked);assertNull(state.groupSync)
 }
 @Test fun cancellationDoesNotPauseAViewerWhoDeclined()=runTest {
  var state=RoomUiState(joinedRoomModel("test"),positionMs=42000,playback=RoomPlaybackState.PLAYING)
  val effects=mutableListOf<RoomEffect>();val transport=Transport()
  val sync=NativeGroupSync(backgroundScope,{state},{state=it(state)},{transport},{"stream"},{"guest"},{effects+=it})
  val declined=attempt().copy(participants=listOf(GroupSyncParticipant("guest",GroupSyncResponse.DECLINED)))
  sync.apply(declined,1);sync.apply(declined.copy(phase=GroupSyncPhase.CANCELLED,revision=2),2)
  assertEquals(RoomPlaybackState.PLAYING,state.playback);assertEquals(42000,state.positionMs)
  assertFalse(effects.any{it is RoomEffect.PlayerPlaying || it is RoomEffect.SeekTo})
 }

 @Test fun localFileFailureRestoresPlaybackForParticipantsAndNotifiesDecliners()=runTest {
  var state=RoomUiState(joinedRoomModel("test"),localSource=true,selectedFileName="different.mp4",videoUrl="file:///private/movie",positionMs=42000,playback=RoomPlaybackState.PLAYING)
  val effects=mutableListOf<RoomEffect>();val transport=Transport()
  val sync=NativeGroupSync(backgroundScope,{state},{state=it(state)},{transport},{"stream"},{"guest"},{effects+=it})
  val local=attempt(GroupSyncPhase.PREPARING).copy(localFile=true)
  sync.apply(local,1);assertTrue(state.syncLocked)
  sync.apply(local.copy(phase=GroupSyncPhase.FAILED,revision=2),2)
  assertFalse(state.syncLocked);assertFalse(state.syncDialogOpen)
  assertEquals(42000,state.positionMs);assertEquals(RoomPlaybackState.PLAYING,state.playback)
  assertTrue(effects.contains(RoomEffect.GroupSyncNotice(GroupSyncNotice.FILE_SYNC_FAILED)))
  assertEquals("different.mp4",state.selectedFileName)
  effects.clear()
  val declined=local.copy(requestId="next",createdAtMs=3,revision=1,phase=GroupSyncPhase.FAILED,participants=listOf(GroupSyncParticipant("guest",GroupSyncResponse.DECLINED)))
  sync.apply(declined,3)
  assertTrue(effects.contains(RoomEffect.GroupSyncNotice(GroupSyncNotice.FILE_SYNC_FAILED)))
 }
 @Test fun localWithdrawalStopsVideoInsteadOfContinuingIt()=runTest {
  var state=RoomUiState(joinedRoomModel("test"),localSource=true,selectedFileName="movie.mp4",videoUrl="file:///private/movie",playback=RoomPlaybackState.PAUSED)
  val effects=mutableListOf<RoomEffect>();val transport=Transport()
  val sync=NativeGroupSync(backgroundScope,{state},{state=it(state)},{transport},{"stream"},{"guest"},{effects+=it})
  sync.apply(attempt().copy(localFile=true),1)
  sync.respond(GroupSyncResponse.WITHDRAWN);runCurrent()
  assertFalse(state.hasPlayer);assertEquals("",state.videoUrl);assertEquals("",state.selectedFileName)
  assertTrue(effects.contains(RoomEffect.StopPlayer))
 }

}
