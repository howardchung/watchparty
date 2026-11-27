package top.roomio.app.room

import kotlin.test.*
import top.roomio.app.room.player.*
import uk.co.caprica.vlcj.factory.discovery.NativeDiscovery
import java.io.File

class DesktopSyncPlayerTest {
 @Test fun desktopPrerollAndPausedSeekProduceActualReadiness() {
  if(System.getenv("WATCHPARTY_DESKTOP_PLAYER_TEST")!="1")return
  assertTrue(NativeDiscovery().discover())
  var state=VideoPlayerState()
  val player=DesktopPlayer {state=it}
  fun await(check:()->Boolean) {val deadline=System.currentTimeMillis()+12000;while(System.currentTimeMillis()<deadline){player.publish();if(check())return;Thread.sleep(100)};fail("Timed out: $state")}
  try {
   val fixture=generateSequence(File(System.getProperty("user.dir")).canonicalFile){it.parentFile}.map{File(it,"clients/web/e2e/fixtures/player-mkv/movie.mp4")}.first{it.isFile}
   player.load(fixture.canonicalPath);player.play()
   await {state.status==VideoPlayerStatus.PLAYING&&state.positionMs>500}
   player.pause();await {state.status==VideoPlayerStatus.PAUSED}
   player.seekTo(3000);await {kotlin.math.abs(state.positionMs-3000)<500&&state.immediatelyPlayable}
  } finally {player.close()}
 }
}
