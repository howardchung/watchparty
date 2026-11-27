package top.roomio.data.party

import java.util.UUID

internal actual fun reportDeviceInfo(): Map<String, String> = mapOf(
    "platform" to "Desktop", "os" to System.getProperty("os.name").let { when { it.startsWith("Windows") -> "Windows"; it.startsWith("Mac") -> "macOS"; it == "Linux" -> "Linux"; else -> "Other" } }, "osVersion" to System.getProperty("os.version").substringBefore('.'),
    "appVersion" to (System.getProperty("roomio.version") ?: "development"))
internal actual fun newReportId(): String = UUID.randomUUID().toString()
