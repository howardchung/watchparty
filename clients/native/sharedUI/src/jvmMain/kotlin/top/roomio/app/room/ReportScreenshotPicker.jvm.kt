package top.roomio.app.room

import androidx.compose.runtime.Composable
import top.roomio.domain.party.ReportScreenshot

@Composable
internal actual fun rememberReportScreenshotPicker(
    onPicked: (ReportScreenshot) -> Unit,
    onError: (String) -> Unit,
    onBusy: (Boolean) -> Unit,
): ReportScreenshotActions? = null
