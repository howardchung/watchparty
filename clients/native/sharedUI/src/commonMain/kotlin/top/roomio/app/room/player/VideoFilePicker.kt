package top.roomio.app.room.player

import androidx.compose.runtime.Composable

/** This handle stays on this device and never crosses the repository boundary. */
internal data class LocalVideoFile(val uri: String, val name: String, val release: () -> Unit = {})

@Composable
internal expect fun rememberPlatformVideoPicker(onPicked: (LocalVideoFile) -> Unit, onError: () -> Unit): () -> Unit
