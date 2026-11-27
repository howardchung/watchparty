package top.roomio.app.androidApp

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowInsetsControllerCompat
import top.roomio.app.App

class AppActivity : ComponentActivity() {
    override fun onNewIntent(intent: Intent) {
        setIntent(intent)
        super.onNewIntent(intent)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (BuildConfig.DEBUG) {
            // Use the shared production defaults unless local development extras
            // explicitly select another backend environment.
            listOf("roomio.backendUrl").forEach { key ->
                val overrideValue = intent.getStringExtra(key)
                if (overrideValue != null) {
                    System.setProperty(key, overrideValue)
                } else {
                    System.clearProperty(key)
                }
            }
        }
        enableEdgeToEdge()
        setContent { 
            App(onThemeChanged = { ThemeChanged(it) }) 
        }
    }
}

@Composable
private fun ThemeChanged(isDark: Boolean) {
    val view = LocalView.current
    LaunchedEffect(isDark) {
        val window = (view.context as Activity).window
        WindowInsetsControllerCompat(window, window.decorView).apply {
            isAppearanceLightStatusBars = isDark
            isAppearanceLightNavigationBars = isDark
        }
    }
}
