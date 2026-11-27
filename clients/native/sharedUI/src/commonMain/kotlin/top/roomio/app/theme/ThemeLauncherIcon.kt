package top.roomio.app.theme

import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import org.jetbrains.compose.resources.stringResource
import watchparty.sharedui.generated.resources.Res
import watchparty.sharedui.generated.resources.launcher_icon_update_failed
import watchparty.sharedui.generated.resources.launcher_icon_retry
import top.roomio.domain.launcher.LauncherIconController
import top.roomio.domain.launcher.launcherIconColor
import top.roomio.domain.profile.ThemeColor

/** Lives above navigation so a saved theme is reconciled on every app launch. */
@Composable
internal fun BoxScope.ThemeLauncherIcon(
    themeColor: ThemeColor,
    controller: LauncherIconController,
) {
    val snackbar = remember(controller) { SnackbarHostState() }
    val errorMessage = stringResource(Res.string.launcher_icon_update_failed)
    val retryLabel = stringResource(Res.string.launcher_icon_retry)
    LaunchedEffect(controller, themeColor) {
        synchronizeThemeLauncherIcon(themeColor, controller) {
            snackbar.showSnackbar(
                message = errorMessage,
                actionLabel = retryLabel,
                withDismissAction = true,
                duration = SnackbarDuration.Indefinite,
            ) == SnackbarResult.ActionPerformed
        }
    }
    SnackbarHost(
        hostState = snackbar,
        modifier = Modifier.align(Alignment.BottomCenter)
            .windowInsetsPadding(WindowInsets.safeDrawing).padding(16.dp),
    )
}

/** Failures affect only the icon; the already saved theme remains selected. */
internal suspend fun synchronizeThemeLauncherIcon(
    themeColor: ThemeColor,
    controller: LauncherIconController,
    retryAfterFailure: suspend () -> Boolean,
) {
    if (!controller.isSupported) return
    do {
        currentCoroutineContext().ensureActive()
        val result = controller.selectColor(themeColor.launcherIconColor())
        currentCoroutineContext().ensureActive()
        if (result.isSuccess) return
    } while (retryAfterFailure())
}
