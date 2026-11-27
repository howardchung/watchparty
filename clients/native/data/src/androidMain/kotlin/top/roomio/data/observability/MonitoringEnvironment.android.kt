package top.roomio.data.observability

import android.content.pm.ApplicationInfo
import top.roomio.data.party.AppContextHolder

internal actual fun monitoringEnvironment(): String =
    if (AppContextHolder.appContext.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0) "development" else "production"
