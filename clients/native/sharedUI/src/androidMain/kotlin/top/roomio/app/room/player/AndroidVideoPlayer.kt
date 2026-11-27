package top.roomio.app.room.player

import top.roomio.app.diagnostics.loggedRunCatching
import top.roomio.app.diagnostics.logHandledException

import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Format
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.VideoSize
import androidx.media3.common.util.UnstableApi
import androidx.media3.common.TrackSelectionOverride
import androidx.media3.common.audio.ChannelMixingAudioProcessor
import androidx.media3.common.audio.ChannelMixingMatrix
import androidx.media3.exoplayer.DefaultRenderersFactory
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.audio.AudioCapabilities
import androidx.media3.exoplayer.audio.AudioSink
import androidx.media3.exoplayer.audio.DefaultAudioSink
import androidx.media3.ui.PlayerView
import co.touchlab.kermit.Logger
import kotlinx.coroutines.delay
import kotlinx.coroutines.CoroutineScope
import android.content.ContentResolver
import android.media.MediaCodec
import android.net.Uri
import android.provider.OpenableColumns

private val log = Logger.withTag("AndroidPlayer")

@Composable
internal actual fun rememberPlatformVideoPlayer(
    onStateChanged: (VideoPlayerState) -> Unit,
): VideoPlayerHandle? {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val currentOnStateChanged by rememberUpdatedState(onStateChanged)

    val player = remember(context) {
        val appContext = context.applicationContext
        val mediaAudioAttributes = AudioAttributes.Builder()
            .setUsage(C.USAGE_MEDIA)
            .setContentType(C.AUDIO_CONTENT_TYPE_MOVIE)
            .build()
        ExoPlayer.Builder(appContext, StereoAudioRenderersFactory(appContext))
            // Voice and shared video audio are concurrent room outputs. Video
            // playback must not take focus away from the room's voice audio
            // session.
            .setAudioAttributes(mediaAudioAttributes, /* handleAudioFocus= */ false)
            .build()
    }
    val scope = rememberCoroutineScope()
    val handle = remember(player, scope) { ExoPlayerVideoPlayerHandle(player, scope) }

    DisposableEffect(player, lifecycleOwner) {
        val listener = object : Player.Listener {
            override fun onPlaybackStateChanged(playbackState: Int) {
                log.i("player.state state=$playbackState positionMs=${player.currentPosition} bufferedMs=${player.bufferedPosition}")
                currentOnStateChanged(handle.toVideoPlayerState())
            }

            override fun onIsPlayingChanged(isPlaying: Boolean) {
                log.i("player.playing value=$isPlaying positionMs=${player.currentPosition}")
                currentOnStateChanged(handle.toVideoPlayerState())
            }

            override fun onVideoSizeChanged(videoSize: VideoSize) {
                currentOnStateChanged(handle.toVideoPlayerState())
            }

            override fun onTracksChanged(tracks: androidx.media3.common.Tracks) {
                log.i("player.tracks groups=${tracks.groups.size}")
                handle.selectPendingSubtitle()
                currentOnStateChanged(handle.toVideoPlayerState())
            }

            override fun onPlayerError(error: PlaybackException) {
                log.e("player.failure code=${error.errorCodeName} mediaError=${error.errorCode}", error)
                logHandledException("AndroidVideoPlayer.onPlayerError", error)
                handle.recoverDecoder(error)
                currentOnStateChanged(handle.toVideoPlayerState())
            }
        }
        val lifecycleObserver = LifecycleEventObserver { _, event ->
            log.i("player.lifecycle event=$event")
            if (event == Lifecycle.Event.ON_STOP) {
                player.pause()
            }
        }
        player.addListener(listener)
        lifecycleOwner.lifecycle.addObserver(lifecycleObserver)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(lifecycleObserver)
            player.removeListener(listener)
            handle.cancelRecovery()
            log.i("player.released")
            player.release()
        }
    }

    LaunchedEffect(player) {
        while (true) {
            if (player.mediaItemCount > 0) {
                currentOnStateChanged(handle.toVideoPlayerState())
            }
            delay(POSITION_POLL_MS)
        }
    }

    return handle
}

@Composable
internal actual fun rememberPlatformSubtitlePicker(
    onSubtitlePicked: (SubtitleFile) -> Unit,
): (() -> Unit)? {
    val context = LocalContext.current
    val currentOnSubtitlePicked by rememberUpdatedState(onSubtitlePicked)
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        uri ?: return@rememberLauncherForActivityResult
        loggedRunCatching("AndroidVideoPlayer.run1") {
            context.contentResolver.takePersistableUriPermission(uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        val name = uri.displayName(context.contentResolver)
        val mimeType = uri.subtitleMimeType(context.contentResolver, name)
        currentOnSubtitlePicked(SubtitleFile(uri.toString(), mimeType, name))
    }
    return remember(launcher) { { launcher.launch(arrayOf("*/*")) } }
}

@OptIn(UnstableApi::class)
@Composable
internal actual fun VideoPlayerSurface(
    handle: VideoPlayerHandle?,
    modifier: Modifier,
) {
    val exoPlayer = (handle as? ExoPlayerVideoPlayerHandle)?.player ?: return
    AndroidView(
        modifier = modifier,
        factory = { context ->
            PlayerView(context).apply {
                useController = false
                player = exoPlayer
                subtitleView?.apply {
                    setUserDefaultStyle()
                    setUserDefaultTextSize()
                }
            }
        },
        update = { view -> view.player = exoPlayer },
    )
}

private const val POSITION_POLL_MS = 500L

/**
 * Normalizes multichannel media to stereo before it reaches Android's output
 * device. Emulator speaker routes advertise surround layouts that the host
 * output cannot reliably render alongside the voice mesh audio stream.
 */
private class StereoAudioRenderersFactory(context: android.content.Context) : DefaultRenderersFactory(context) {
    override fun buildAudioSink(
        context: android.content.Context,
        enableFloatOutput: Boolean,
        enableAudioTrackPlaybackParams: Boolean,
    ): AudioSink {
        val downmixToStereo = ChannelMixingAudioProcessor().apply {
            (1..6).forEach { inputChannels ->
                putChannelMixingMatrix(ChannelMixingMatrix.createForConstantPower(inputChannels, 2))
            }
        }
        return DefaultAudioSink.Builder(context)
            .setAudioCapabilities(AudioCapabilities.getCapabilities(context))
            .setAudioProcessors(arrayOf(downmixToStereo))
            .setEnableFloatOutput(enableFloatOutput)
            .setEnableAudioTrackPlaybackParams(enableAudioTrackPlaybackParams)
            .build()
    }
}

private fun PlaybackException.canRetryDecoder(): Boolean {
    if (errorCode == PlaybackException.ERROR_CODE_DECODING_RESOURCES_RECLAIMED) return true
    if (errorCode != PlaybackException.ERROR_CODE_FAILED_RUNTIME_CHECK) return false

    // Media3 wraps a codec failure during a seek-time flush as an unexpected runtime error.
    // Match Android framework frames, which also survive release-build obfuscation.
    val codecError = cause as? MediaCodec.CodecException ?: return false
    return codecError.stackTrace.any { frame ->
        frame.className == MediaCodec::class.java.name &&
            (frame.methodName == "flush" || frame.methodName == "native_flush")
    }
}

internal class ExoPlayerVideoPlayerHandle(
    internal val player: ExoPlayer,
    scope: CoroutineScope,
) : VideoPlayerHandle {
    private val decoderRecovery = DecoderResourceRecovery(scope)

    override fun load(url: String) {
        log.i("player.load requested")
        decoderRecovery.reset()
        audioTrackSelectionId = null
        baseMediaItem = MediaItem.fromUri(url)
        externalSubtitle = null
        pendingSubtitleLabel = null
        player.setMediaItem(baseMediaItem!!)
        player.trackSelectionParameters = player.trackSelectionParameters.buildUpon()
            .clearOverridesOfType(C.TRACK_TYPE_TEXT)
            .clearOverridesOfType(C.TRACK_TYPE_AUDIO)
            .setTrackTypeDisabled(C.TRACK_TYPE_TEXT, false)
            .setTrackTypeDisabled(C.TRACK_TYPE_AUDIO, false)
            .build()
        player.prepare()
    }

    private var baseMediaItem: MediaItem? = null
    private var externalSubtitle: MediaItem.SubtitleConfiguration? = null
    private var pendingSubtitleLabel: String? = null
    private var audioTrackSelectionId: String? = null

    internal fun toVideoPlayerState(): VideoPlayerState {
        val state = player.toVideoPlayerState(audioTrackSelectionId)
        return if (decoderRecovery.isPending && player.playerError?.canRetryDecoder() == true) {
            state.copy(status = VideoPlayerStatus.BUFFERING, error = null)
        } else state
    }

    internal fun recoverDecoder(error: PlaybackException) {
        if (player.mediaItemCount == 0 || !error.canRetryDecoder()) return
        decoderRecovery.schedule {
            if (player.playerError === error) {
                log.i("player.decoder_recovery code=${error.errorCodeName} positionMs=${player.currentPosition} playWhenReady=${player.playWhenReady}")
                // Re-prepare the existing source. Do not reset its position, tracks, volume, or
                // playWhenReady: a pause or sync command during the delay must still win.
                loggedRunCatching("AndroidVideoPlayer.decoderRecovery") { player.prepare() }
            }
        }
    }

    internal fun cancelRecovery() = decoderRecovery.reset()

    override fun retry(url: String) {
        decoderRecovery.reset()
        if (baseMediaItem?.localConfiguration?.uri == Uri.parse(url) && player.mediaItemCount > 0) {
            log.i("player.retry positionMs=${player.currentPosition}")
            player.prepare()
        } else load(url)
    }

    override fun selectSubtitle(trackId: String?) {
        val parameters = player.trackSelectionParameters.buildUpon()
            .clearOverridesOfType(C.TRACK_TYPE_TEXT)
            .setTrackTypeDisabled(C.TRACK_TYPE_TEXT, trackId == null)
        if (trackId != null) {
            val indices = trackId.split(':').mapNotNull(String::toIntOrNull)
            val groupIndex = indices.getOrNull(0)
            val trackIndex = indices.getOrNull(1)
            val group = groupIndex?.let(player.currentTracks.groups::getOrNull)
            if (group != null && trackIndex != null && trackIndex in 0 until group.length) {
                parameters.setTrackTypeDisabled(C.TRACK_TYPE_TEXT, false)
                    .addOverride(TrackSelectionOverride(group.mediaTrackGroup, listOf(trackIndex)))
            }
        }
        player.trackSelectionParameters = parameters.build()
    }

    override fun selectAudioTrack(trackId: String?) {
        val parameters = player.trackSelectionParameters.buildUpon()
            .clearOverridesOfType(C.TRACK_TYPE_AUDIO)
            .setTrackTypeDisabled(C.TRACK_TYPE_AUDIO, false)
        if (trackId == null) {
            audioTrackSelectionId = null
        } else {
            val indices = trackId.split(':').mapNotNull(String::toIntOrNull)
            val groupIndex = indices.getOrNull(0)
            val trackIndex = indices.getOrNull(1)
            val group = groupIndex?.let(player.currentTracks.groups::getOrNull)
            if (group != null && group.type == C.TRACK_TYPE_AUDIO && trackIndex != null &&
                trackIndex in 0 until group.length && group.isTrackSupported(trackIndex)
            ) {
                audioTrackSelectionId = trackId
                parameters.addOverride(TrackSelectionOverride(group.mediaTrackGroup, listOf(trackIndex)))
            } else {
                audioTrackSelectionId = null
            }
        }
        player.trackSelectionParameters = parameters.build()
    }

    override fun addSubtitle(file: SubtitleFile) {
        val source = baseMediaItem ?: player.currentMediaItem ?: return
        val builder = MediaItem.SubtitleConfiguration.Builder(Uri.parse(file.uri))
            .setSelectionFlags(C.SELECTION_FLAG_DEFAULT)
            .setLabel(file.label)
        file.mimeType?.let(builder::setMimeType)
        externalSubtitle = builder.build()
        pendingSubtitleLabel = file.label
        val mediaItem = source.buildUpon()
            .setSubtitleConfigurations(listOfNotNull(externalSubtitle))
            .build()
        val position = player.currentPosition.coerceAtLeast(0L)
        val shouldPlay = player.playWhenReady
        player.trackSelectionParameters = player.trackSelectionParameters.buildUpon()
            .clearOverridesOfType(C.TRACK_TYPE_TEXT)
            .setTrackTypeDisabled(C.TRACK_TYPE_TEXT, false)
            .build()
        player.setMediaItem(mediaItem, position)
        player.prepare()
        selectPendingSubtitle()
        player.playWhenReady = shouldPlay
        log.i("player.subtitle loaded")
    }

    internal fun selectPendingSubtitle() {
        val expectedLabel = pendingSubtitleLabel ?: return
        player.currentTracks.groups.forEachIndexed { groupIndex, group ->
            if (group.type != C.TRACK_TYPE_TEXT) return@forEachIndexed
            val trackIndex = (0 until group.length).firstOrNull { index ->
                group.isTrackSupported(index) && group.getTrackFormat(index).label == expectedLabel
            } ?: return@forEachIndexed
            player.trackSelectionParameters = player.trackSelectionParameters.buildUpon()
                .clearOverridesOfType(C.TRACK_TYPE_TEXT)
                .setTrackTypeDisabled(C.TRACK_TYPE_TEXT, false)
                .addOverride(TrackSelectionOverride(group.mediaTrackGroup, listOf(trackIndex)))
                .build()
            pendingSubtitleLabel = null
            log.i("player.subtitle selected group=$groupIndex track=$trackIndex")
            return
        }
    }

    override fun play() {
        log.i("play pos=${player.currentPosition}ms state=${player.playbackState}")
        player.play()
    }

    override fun pause() {
        log.i("pause pos=${player.currentPosition}ms state=${player.playbackState}")
        player.pause()
    }

    override fun togglePlayPause() {
        if (player.isPlaying) player.pause() else player.play()
    }

    override fun seekTo(positionMs: Long) {
        val target = positionMs.coerceAtLeast(0L)
        log.i("seekTo requested=${positionMs}ms target=${target}ms before=${player.currentPosition}ms state=${player.playbackState} playing=${player.isPlaying}")
        player.seekTo(target)
    }

    override fun seekBy(deltaMs: Long) {
        player.seekTo((player.currentPosition + deltaMs).coerceAtLeast(0L))
    }

    override fun setVolume(volume: Float) {
        player.volume = volume.coerceIn(0f, 1f)
    }

    override fun stop() {
        log.i("stop")
        decoderRecovery.reset()
        player.stop()
        player.clearMediaItems()
        baseMediaItem = null
        externalSubtitle = null
        pendingSubtitleLabel = null
        audioTrackSelectionId = null
    }
}

private fun ExoPlayer.toVideoPlayerState(audioTrackSelectionId: String?): VideoPlayerState {
    val rawDuration = duration
    val isLive = isCurrentMediaItemLive || rawDuration == C.TIME_UNSET
    val durationMs = if (rawDuration == C.TIME_UNSET || rawDuration < 0L) 0L else rawDuration
    val status = when {
        playerError != null -> VideoPlayerStatus.ERROR
        playbackState == Player.STATE_BUFFERING -> VideoPlayerStatus.BUFFERING
        playbackState == Player.STATE_READY && playWhenReady -> VideoPlayerStatus.PLAYING
        playbackState == Player.STATE_READY -> VideoPlayerStatus.PAUSED
        playbackState == Player.STATE_ENDED -> VideoPlayerStatus.ENDED
        else -> VideoPlayerStatus.IDLE
    }
    val aspectRatio = videoSize.let { size ->
        if (size.height > 0) {
            (size.width * size.pixelWidthHeightRatio) / size.height
        } else {
            0f
        }
    }
    return VideoPlayerState(
        status = status,
        positionMs = currentPosition.coerceAtLeast(0L),
        durationMs = durationMs,
        bufferedMs = bufferedPosition.coerceAtLeast(0L),
        isLive = isLive,
        videoAspectRatio = aspectRatio,
        error = playerError?.errorCodeName,
        subtitles = currentTracks.groups.flatMapIndexed { groupIndex, group ->
            if (group.type != C.TRACK_TYPE_TEXT) return@flatMapIndexed emptyList()
            (0 until group.length).mapNotNull { trackIndex ->
                if (!group.isTrackSupported(trackIndex)) return@mapNotNull null
                val format = group.getTrackFormat(trackIndex)
                SubtitleTrack(
                    id = "$groupIndex:$trackIndex",
                    label = format.subtitleLabel(trackIndex),
                    selected = group.isTrackSelected(trackIndex),
                )
            }
        },
        audioTracks = currentTracks.groups.flatMapIndexed { groupIndex, group ->
            if (group.type != C.TRACK_TYPE_AUDIO) return@flatMapIndexed emptyList()
            (0 until group.length).mapNotNull { trackIndex ->
                if (!group.isTrackSupported(trackIndex)) return@mapNotNull null
                AudioTrack(
                    id = "$groupIndex:$trackIndex",
                    label = group.getTrackFormat(trackIndex).audioTrackLabel(trackIndex),
                )
            }
        },
        audioTrackSelectionId = audioTrackSelectionId,
    )
}

private fun Format.subtitleLabel(index: Int): String = label
    ?.takeIf(String::isNotBlank)
    ?: language?.takeIf(String::isNotBlank)
    ?: "Subtitle ${index + 1}"

private fun Format.audioTrackLabel(index: Int): String = label
    ?.takeIf(String::isNotBlank)
    ?: language?.takeIf(String::isNotBlank)
    ?: "Audio ${index + 1}"

private fun Uri.displayName(resolver: ContentResolver): String {
    resolver.query(this, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
        if (cursor.moveToFirst()) {
            val column = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            if (column >= 0) cursor.getString(column)?.takeIf(String::isNotBlank)?.let { return it }
        }
    }
    return lastPathSegment?.substringAfterLast('/')?.takeIf(String::isNotBlank) ?: "Subtitle file"
}

private fun Uri.subtitleMimeType(resolver: ContentResolver, name: String): String? {
    val extension = name.substringAfterLast('.', "").lowercase()
    return when (extension) {
        "srt" -> "application/x-subrip"
        "vtt" -> "text/vtt"
        "ass", "ssa" -> "text/x-ssa"
        "ttml", "dfxp", "xml" -> "application/ttml+xml"
        else -> resolver.getType(this)
    }
}
