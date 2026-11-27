package top.roomio.app.room.player

import top.roomio.app.diagnostics.loggedRunCatching

import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.awt.SwingPanel
import kotlinx.coroutines.delay
import uk.co.caprica.vlcj.factory.discovery.NativeDiscovery
import uk.co.caprica.vlcj.player.base.MediaPlayer
import uk.co.caprica.vlcj.player.base.MediaPlayerEventAdapter
import uk.co.caprica.vlcj.player.component.CallbackMediaPlayerComponent
import java.io.File
import javax.swing.JFileChooser
import javax.swing.filechooser.FileNameExtensionFilter
import org.jetbrains.compose.resources.stringResource
import watchparty.sharedui.generated.resources.*

/** Software callback surface keeps Compose overlays above desktop video. Requires VLC 3.x. */
internal class DesktopPlayer(private val changed: (VideoPlayerState) -> Unit) : VideoPlayerHandle {
    val component = CallbackMediaPlayerComponent()
    private val player get() = component.mediaPlayer()
    @Volatile private var bufferedReady = false
    @Volatile private var failed = false
    @Volatile private var loading = false
    private var closed = false
    init {
        player.events().addMediaPlayerEventListener(object : MediaPlayerEventAdapter() {
            override fun buffering(mediaPlayer: MediaPlayer, newCache: Float) { bufferedReady = newCache >= 100f }
            override fun error(mediaPlayer: MediaPlayer) { failed = true }
            override fun playing(mediaPlayer: MediaPlayer) { loading = false }
            override fun paused(mediaPlayer: MediaPlayer) { loading = false }
        })
    }
    fun publish() {
        if (closed) return
        val position = player.status().time().coerceAtLeast(0)
        val duration = player.status().length().coerceAtLeast(0)
        val status = when { failed -> VideoPlayerStatus.ERROR; loading -> VideoPlayerStatus.BUFFERING; player.status().isPlaying -> VideoPlayerStatus.PLAYING; duration > 0 -> VideoPlayerStatus.PAUSED; else -> VideoPlayerStatus.IDLE }
        changed(VideoPlayerState(status,position,duration,position,isLive=duration<=0 && !loading,error=if(failed)"PLAYER_FAILED"else null, immediatelyPlayable=bufferedReady && player.status().isSeekable,
            audioTracks=player.audio().trackDescriptions().filter{it.id()>=0}.map{AudioTrack(it.id().toString(),it.description())},
            subtitles=player.subpictures().trackDescriptions().filter{it.id()>=0}.map{SubtitleTrack(it.id().toString(),it.description(),player.subpictures().track()==it.id())}))
    }
    override fun load(url:String) { failed=false;bufferedReady=false;loading=true;if(url.startsWith("file:"))player.media().play(url,":start-paused",":file-caching=3000")else player.media().play(url,":start-paused",":network-caching=3000",":file-caching=3000");publish() }
    override fun play() { if(!closed)player.controls().play() }
    override fun pause() { if(!closed)player.controls().setPause(true) }
    override fun togglePlayPause() { if(player.status().isPlaying)pause()else play() }
    override fun seekTo(positionMs:Long) {bufferedReady=false;player.controls().setTime(positionMs.coerceAtLeast(0))}
    override fun seekBy(deltaMs:Long)=seekTo(player.status().time()+deltaMs)
    override fun setVolume(volume:Float) {player.audio().setVolume((volume.coerceIn(0f,1f)*100).toInt())}
    override fun selectSubtitle(trackId:String?) {player.subpictures().setTrack(trackId?.toIntOrNull()?:-1)}
    override fun selectAudioTrack(trackId:String?) {val id=trackId?.toIntOrNull()?:player.audio().trackDescriptions().firstOrNull{it.id()>=0}?.id();if(id!=null)player.audio().setTrack(id)}
    override fun addSubtitle(file:SubtitleFile) {player.subpictures().setSubTitleFile(File(java.net.URI(file.uri)))}
    override fun stop() {if(!closed)player.controls().stop()}
    fun close() {if(!closed){closed=true;component.release()}}
}
@Composable
internal actual fun rememberPlatformVideoPlayer(onStateChanged:(VideoPlayerState)->Unit):VideoPlayerHandle? {
    val latest by rememberUpdatedState(onStateChanged)
    val error=stringResource(Res.string.group_sync_desktop_player)
    val handle=remember {loggedRunCatching("DesktopVideoPlayer.run1") {check(NativeDiscovery().discover());DesktopPlayer {latest(it)}}.getOrNull()}
    LaunchedEffect(handle){if(handle==null)latest(VideoPlayerState(VideoPlayerStatus.ERROR,error=error))else while(true){handle.publish();delay(100)}}
    DisposableEffect(handle){onDispose{handle?.close()}}
    return handle
}
@Composable
internal actual fun VideoPlayerSurface(handle:VideoPlayerHandle?,modifier:Modifier) {
    val player=handle as? DesktopPlayer?:return
    SwingPanel(factory={player.component},modifier=modifier)
}
@Composable
internal actual fun rememberPlatformSubtitlePicker(onSubtitlePicked:(SubtitleFile)->Unit):(() -> Unit)? {
    val current by rememberUpdatedState(onSubtitlePicked)
    return {val chooser=JFileChooser().apply{fileFilter=FileNameExtensionFilter("Subtitles","srt","vtt","ass","ssa","ttml")};if(chooser.showOpenDialog(null)==JFileChooser.APPROVE_OPTION){val file=chooser.selectedFile;current(SubtitleFile(file.toURI().toString(),null,file.name))}}
}
