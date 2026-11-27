import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState
import java.awt.Dimension
import top.roomio.app.App

fun main() {
    // Keep the themed countdown and controls above the lightweight VLC video surface.
    System.setProperty("compose.interop.blending", "true")
    application {
    Window(
        title = "watchparty",
        state = rememberWindowState(width = 800.dp, height = 600.dp),
        onCloseRequest = ::exitApplication,
    ) {
        window.minimumSize = Dimension(350, 600)
        App(onAppNameChanged = { window.title = it })
    }
}

}
