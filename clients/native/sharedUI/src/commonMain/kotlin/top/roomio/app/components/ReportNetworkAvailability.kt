package top.roomio.app.components

import androidx.compose.runtime.Composable

/** Null when the host has no network observer; reporting can still be attempted. */
@Composable
internal expect fun rememberReportNetworkAvailable(): Boolean?
