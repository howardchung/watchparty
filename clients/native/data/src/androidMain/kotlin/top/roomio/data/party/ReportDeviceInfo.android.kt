package top.roomio.data.party

import android.os.Build
import java.util.UUID

internal actual fun reportDeviceInfo(): Map<String, String> {
    val context = AppContextHolder.appContext
    val info = context.packageManager.getPackageInfo(context.packageName, 0)
    return mapOf("platform" to "Android",
        "osVersion" to Build.VERSION.RELEASE.substringBefore('.'), "sdk" to Build.VERSION.SDK_INT.toString(),
        "appVersion" to (info.versionName ?: "unknown"), "appVersionCode" to (if (Build.VERSION.SDK_INT >= 28) info.longVersionCode else @Suppress("DEPRECATION") info.versionCode.toLong()).toString())
}
internal actual fun newReportId(): String = UUID.randomUUID().toString()
