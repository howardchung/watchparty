package top.roomio.app.room.player

import top.roomio.app.diagnostics.logHandledException
import androidx.compose.runtime.*
import javax.swing.JFileChooser
import javax.swing.SwingUtilities
import javax.swing.filechooser.FileNameExtensionFilter

@Composable
internal actual fun rememberPlatformVideoPicker(onPicked: (LocalVideoFile) -> Unit, onError: () -> Unit): () -> Unit {
    val picked by rememberUpdatedState(onPicked)
    val failed by rememberUpdatedState(onError)
    return { SwingUtilities.invokeLater {
        try {
            val picker = JFileChooser().apply { fileFilter=FileNameExtensionFilter("Video","mp4","mkv","webm","mov","avi","m4v") }
            if(picker.showOpenDialog(null)==JFileChooser.APPROVE_OPTION) picked(LocalVideoFile(picker.selectedFile.toURI().toString(),picker.selectedFile.name))
        } catch (error: Exception) { logHandledException("player.source.select", error); failed() }
    } }
}
