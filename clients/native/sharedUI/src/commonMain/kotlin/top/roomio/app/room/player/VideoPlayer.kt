package top.roomio.app.room.player

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

internal enum class VideoPlayerStatus {
    IDLE,
    BUFFERING,
    READY,
    PLAYING,
    PAUSED,
    ENDED,
    ERROR,
}

internal data class VideoPlayerState(
    val status: VideoPlayerStatus = VideoPlayerStatus.IDLE,
    val positionMs: Long = 0L,
    val durationMs: Long = 0L,
    val bufferedMs: Long = 0L,
    val isLive: Boolean = false,
    val videoAspectRatio: Float = 0f,
    val error: String? = null,
    val subtitles: List<SubtitleTrack> = emptyList(),
    val audioTracks: List<AudioTrack> = emptyList(),
    val audioTrackSelectionId: String? = null,
    /** Platform decoder/cache confirms immediate playback when no buffer-end timestamp is exposed. */
    val immediatelyPlayable: Boolean = false,
) {
    val hasDuration: Boolean
        get() = durationMs > 0L
}

internal data class SubtitleTrack(
    val id: String,
    val label: String,
    val selected: Boolean,
)

internal data class AudioTrack(
    val id: String,
    val label: String,
)

internal data class SubtitleFile(
    val uri: String,
    val mimeType: String?,
    val label: String,
)

internal interface VideoPlayerHandle {
    fun load(url: String)

    /** Retry the current source, preserving local playback settings where supported. */
    fun retry(url: String) { load(url) }

    fun play()

    fun pause()

    fun togglePlayPause()

    fun seekTo(positionMs: Long)

    fun seekBy(deltaMs: Long)

    fun setVolume(volume: Float)

    fun selectSubtitle(trackId: String?)

    fun selectAudioTrack(trackId: String?)

    fun addSubtitle(file: SubtitleFile)

    fun stop()
}

@Composable
internal expect fun rememberPlatformVideoPlayer(
    onStateChanged: (VideoPlayerState) -> Unit,
): VideoPlayerHandle?

@Composable
internal expect fun VideoPlayerSurface(
    handle: VideoPlayerHandle?,
    modifier: Modifier,
)
