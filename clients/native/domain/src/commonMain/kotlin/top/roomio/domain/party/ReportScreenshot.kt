package top.roomio.domain.party

/** Explicitly selected image. File names and platform URIs stay on the device. */
data class ReportScreenshot(val contentType: String, val data: String) {
    val byteSize: Int get() = data.length * 3 / 4 - when { data.endsWith("==") -> 2; data.endsWith("=") -> 1; else -> 0 }
}

const val REPORT_SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024
const val REPORT_SCREENSHOT_MAX_COUNT = 3
