package top.roomio.data.launcher

import dev.zacsweers.metro.BindingContainer
import dev.zacsweers.metro.Provides
import top.roomio.domain.launcher.LauncherIconController

@BindingContainer
interface LauncherIconDataBindings {
    companion object {
        @Provides
        fun provideLauncherIconController(): LauncherIconController = createLauncherIconController()
    }
}

internal expect fun createLauncherIconController(): LauncherIconController
