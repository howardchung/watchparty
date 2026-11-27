package top.roomio.app.room

import android.graphics.BitmapFactory
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.platform.LocalContext
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import top.roomio.app.diagnostics.logHandledException
import top.roomio.domain.party.REPORT_SCREENSHOT_MAX_BYTES
import top.roomio.domain.party.ReportScreenshot
import java.io.ByteArrayOutputStream
import kotlin.io.encoding.Base64

@Composable
internal actual fun rememberReportScreenshotPicker(
    onPicked: (ReportScreenshot) -> Unit,
    onError: (String) -> Unit,
    onBusy: (Boolean) -> Unit,
): ReportScreenshotActions? {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val picked by rememberUpdatedState(onPicked)
    val error by rememberUpdatedState(onError)
    val busy by rememberUpdatedState(onBusy)
    val readImage: (android.net.Uri) -> Unit = { uri ->
        scope.launch {
            busy(true)
            try {
                val screenshot = withContext(Dispatchers.IO) {
                    val bytes = context.contentResolver.openInputStream(uri)?.use { input ->
                        val output = ByteArrayOutputStream()
                        val buffer = ByteArray(8192)
                        while (true) {
                            val count = input.read(buffer)
                            if (count < 0) break
                            if (output.size() + count > REPORT_SCREENSHOT_MAX_BYTES) throw ScreenshotTooLarge()
                            output.write(buffer, 0, count)
                        }
                        output.toByteArray()
                    } ?: throw IllegalArgumentException("Unreadable screenshot")
                    val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                    BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)
                    val mime = options.outMimeType
                    require(options.outWidth > 0 && options.outHeight > 0 && mime in listOf("image/png", "image/jpeg", "image/webp"))
                    ReportScreenshot(mime, Base64.encode(bytes))
                }
                picked(screenshot)
            } catch (cancelled: CancellationException) { logHandledException("ReportScreenshotPicker.cancelled", cancelled); throw cancelled
            } catch (failure: ScreenshotTooLarge) { logHandledException("ReportScreenshotPicker.limit", failure); error("SCREENSHOTS_TOO_LARGE")
            } catch (failure: Exception) {
                logHandledException("ReportScreenshotPicker.read", failure)
                error("SCREENSHOT_UNREADABLE")
            } finally { busy(false) }
        }
    }
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) readImage(uri)
    }
    return ReportScreenshotActions(
        pick = { launcher.launch(arrayOf("image/png", "image/jpeg", "image/webp")) },
        paste = {
            try {
                val clipboard = context.getSystemService(android.content.Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                val clip = clipboard.primaryClip
                val uri = if (clip != null && clip.itemCount > 0) clip.getItemAt(0).uri else null
                if (uri == null || uri.scheme != "content") error("SCREENSHOT_CLIPBOARD_EMPTY") else readImage(uri)
            } catch (failure: Exception) {
                logHandledException("ReportScreenshotPicker.paste", failure)
                error("SCREENSHOT_UNREADABLE")
            }
        },
    )
}

private class ScreenshotTooLarge : Exception()
