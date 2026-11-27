package top.roomio.data.launcher

import top.roomio.domain.launcher.LauncherIconController

internal actual fun createLauncherIconController(): LauncherIconController = UnsupportedLauncherIconController()
