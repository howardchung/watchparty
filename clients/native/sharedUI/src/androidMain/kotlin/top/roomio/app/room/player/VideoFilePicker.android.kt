package top.roomio.app.room.player

import android.provider.OpenableColumns
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import top.roomio.app.diagnostics.logHandledException
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext

@Composable
internal actual fun rememberPlatformVideoPicker(onPicked: (LocalVideoFile) -> Unit, onError: () -> Unit): () -> Unit {
    val context = LocalContext.current
    val picked by rememberUpdatedState(onPicked)
    val failed by rememberUpdatedState(onError)
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if(uri != null) try {
            val name = context.contentResolver.query(uri,arrayOf(OpenableColumns.DISPLAY_NAME),null,null,null)?.use { cursor ->
                if(cursor.moveToFirst()) cursor.getString(cursor.getColumnIndexOrThrow(OpenableColumns.DISPLAY_NAME)) else null
            } ?: "video"
            picked(LocalVideoFile(uri.toString(),name))
        } catch (error: Exception) { logHandledException("player.source.select", error); failed() }
    }
    return { try { launcher.launch(arrayOf("video/*", "application/octet-stream")) } catch (error: Exception) { logHandledException("player.source.select", error); failed() } }
}
