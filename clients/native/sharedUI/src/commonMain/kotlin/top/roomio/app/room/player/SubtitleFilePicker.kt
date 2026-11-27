package top.roomio.app.room.player

import androidx.compose.runtime.Composable

@Composable
internal expect fun rememberPlatformSubtitlePicker(
    onSubtitlePicked: (SubtitleFile) -> Unit,
): (() -> Unit)?
