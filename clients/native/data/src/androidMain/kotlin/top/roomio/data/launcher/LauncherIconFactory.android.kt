package top.roomio.data.launcher

import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import top.roomio.data.party.AppContextHolder
import top.roomio.domain.launcher.LauncherIconColor
import top.roomio.domain.launcher.LauncherIconController

internal actual fun createLauncherIconController(): LauncherIconController =
    SwitchingLauncherIconController(AndroidLauncherComponents(AppContextHolder.appContext))

internal class AndroidLauncherComponents(context: Context) : LauncherComponents {
    private val packageName = context.packageName
    private val packageManager = context.packageManager
    override val supportsAtomicChanges: Boolean get() = Build.VERSION.SDK_INT >= 33

    // applicationId can differ from the Kotlin namespace. Match manifest placeholders.
    private fun component(color: LauncherIconColor) =
        ComponentName(packageName, "$packageName.launcher.${color.aliasSuffix}")

    override fun isEnabled(color: LauncherIconColor): Boolean =
        when (packageManager.getComponentEnabledSetting(component(color))) {
            PackageManager.COMPONENT_ENABLED_STATE_ENABLED -> true
            PackageManager.COMPONENT_ENABLED_STATE_DEFAULT -> color == LauncherIconColor.BASIL
            else -> false
        }

    override fun setEnabled(color: LauncherIconColor, enabled: Boolean) {
        packageManager.setComponentEnabledSetting(component(color), state(enabled), PackageManager.DONT_KILL_APP)
    }

    override fun selectAtomically(color: LauncherIconColor) {
        check(Build.VERSION.SDK_INT >= 33)
        packageManager.setComponentEnabledSettings(LauncherIconColor.entries.map { candidate ->
            PackageManager.ComponentEnabledSetting(
                component(candidate), state(candidate == color), PackageManager.DONT_KILL_APP,
            )
        })
    }

    private fun state(enabled: Boolean): Int = if (enabled)
        PackageManager.COMPONENT_ENABLED_STATE_ENABLED else PackageManager.COMPONENT_ENABLED_STATE_DISABLED
}
