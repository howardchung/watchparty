package top.roomio.app.components

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import top.roomio.app.diagnostics.loggedRunCatching

@Composable
internal actual fun rememberReportNetworkAvailable(): Boolean? {
    val context = LocalContext.current.applicationContext
    val manager = remember(context) { context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager }
    fun available() = manager.getNetworkCapabilities(manager.activeNetwork)?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
    var online by remember(manager) { mutableStateOf(available()) }
    DisposableEffect(manager) {
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) { online = available() }
            override fun onLost(network: Network) { online = available() }
            override fun onCapabilitiesChanged(network: Network, capabilities: NetworkCapabilities) { online = available() }
        }
        manager.registerDefaultNetworkCallback(callback)
        online = available()
        onDispose { loggedRunCatching("ReportNetworkAvailability.unregister") { manager.unregisterNetworkCallback(callback) } }
    }
    return online
}
