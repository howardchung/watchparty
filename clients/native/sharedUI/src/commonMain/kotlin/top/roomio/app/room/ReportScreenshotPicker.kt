package top.roomio.app.room

import androidx.compose.runtime.Composable
import top.roomio.domain.party.ReportScreenshot

internal data class ReportScreenshotActions(val pick: () -> Unit, val paste: () -> Unit)

/** Null on platforms without screenshot selection support. */
@Composable
internal expect fun rememberReportScreenshotPicker(
    onPicked: (ReportScreenshot) -> Unit,
    onError: (String) -> Unit,
    onBusy: (Boolean) -> Unit,
): ReportScreenshotActions?
