package top.roomio.app.room

import top.roomio.app.diagnostics.loggedRunCatching

import android.content.Intent
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext

@Composable
internal actual fun rememberPlatformInviteShare(): ((String) -> Boolean)? {
    val context = LocalContext.current
    return remember(context) {
        { link: String ->
            loggedRunCatching("PlatformInviteShare.android.run1") {
                val send = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_TEXT, link)
                }
                context.startActivity(Intent.createChooser(send, null))
            }.isSuccess
        }
    }
}
