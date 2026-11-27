package top.roomio.app.components

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.unit.dp

/** Lucide 1.24.0 artwork shared with the browser's visual language.
 * Vendored vector paths; no runtime dependency on the browser client.
 * ISC/MIT notices are bundled in composeResources/files/lucide-license.txt.
 * Directional navigation/send icons retain native RTL mirroring.
 */
internal object WatchPartyIcons {
    val Pencil: ImageVector by lazy { outline("pencil", false,
        "m15 5 4 4", "M3 21l4-1 13-13a2.8 2.8 0 0 0-4-4L3 16z"
    ) }
    val FolderOpen: ImageVector by lazy { outline("folder-open", false,
        "m6 14 1.5-3a2 2 0 0 1 1.8-1H20a2 2 0 0 1 1.9 2.6l-2.3 7a2 2 0 0 1-1.9 1.4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v2"
    ) }
    val Block: ImageVector by lazy { outline("ban", false,
        "M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0",
        "M4.929 4.929 19.07 19.071"
    ) }
    val Add: ImageVector by lazy { outline("plus", false,
        "M5 12h14",
        "M12 5v14"
    ) }
    val ArrowBack: ImageVector by lazy { outline("arrow-left", true,
        "m12 19-7-7 7-7",
        "M19 12H5"
    ) }
    val ArrowDownward: ImageVector by lazy { outline("arrow-down", false,
        "M12 5v14",
        "m19 12-7 7-7-7"
    ) }
    val ArrowForward: ImageVector by lazy { outline("arrow-right", true,
        "M5 12h14",
        "m12 5 7 7-7 7"
    ) }
    val BugReport: ImageVector by lazy { outline("bug", false,
        "M12 20v-9",
        "M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z",
        "M14.12 3.88 16 2",
        "M21 21a4 4 0 0 0-3.81-4",
        "M21 5a4 4 0 0 1-3.55 3.97",
        "M22 13h-4",
        "M3 21a4 4 0 0 1 3.81-4",
        "M3 5a4 4 0 0 0 3.55 3.97",
        "M6 13H2",
        "m8 2 1.88 1.88",
        "M9 7.13V6a3 3 0 1 1 6 0v1.13"
    ) }
    val ChatBubbleOutline: ImageVector by lazy { outline("message-circle", false,
        "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"
    ) }
    val Check: ImageVector by lazy { outline("check", false,
        "M20 6 9 17l-5-5"
    ) }
    val Close: ImageVector by lazy { outline("x", false,
        "M18 6 6 18",
        "m6 6 12 12"
    ) }
    val ConfirmationNumber: ImageVector by lazy { outline("ticket", false,
        "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",
        "M13 5v2",
        "M13 17v2",
        "M13 11v2"
    ) }
    val ContentCopy: ImageVector by lazy { outline("clipboard", false,
        "M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1Z",
        "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
    ) }
    val ContentPaste: ImageVector by lazy { outline("clipboard", false,
        "M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1Z",
        "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
    ) }
    val DarkMode: ImageVector by lazy { outline("moon", false,
        "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
    ) }
    val ExpandLess: ImageVector by lazy { outline("chevron-up", false,
        "m18 15-6-6-6 6"
    ) }
    val ExpandMore: ImageVector by lazy { outline("chevron-down", false,
        "m6 9 6 6 6-6"
    ) }
    val FastForward: ImageVector by lazy { outline("fast-forward", false,
        "M12 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 12 18z",
        "M2 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 2 18z"
    ) }
    val FastRewind: ImageVector by lazy { outline("rewind", false,
        "M12 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 12 18z",
        "M22 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 22 18z"
    ) }
    val Fullscreen: ImageVector by lazy { outline("maximize", false,
        "M8 3H5a2 2 0 0 0-2 2v3",
        "M21 8V5a2 2 0 0 0-2-2h-3",
        "M3 16v3a2 2 0 0 0 2 2h3",
        "M16 21h3a2 2 0 0 0 2-2v-3"
    ) }
    val FullscreenExit: ImageVector by lazy { outline("minimize", false,
        "M8 3v3a2 2 0 0 1-2 2H3",
        "M21 8h-3a2 2 0 0 1-2-2V3",
        "M3 16h3a2 2 0 0 1 2 2v3",
        "M16 21v-3a2 2 0 0 1 2-2h3"
    ) }
    val GraphicEq: ImageVector by lazy { outline("audio-lines", false,
        "M2 10v3",
        "M6 6v11",
        "M10 3v18",
        "M14 8v7",
        "M18 5v13",
        "M22 10v3"
    ) }
    val Groups: ImageVector by lazy { outline("users", false,
        "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
        "M16 3.128a4 4 0 0 1 0 7.744",
        "M22 21v-2a4 4 0 0 0-3-3.87",
        "M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"
    ) }
    val Language: ImageVector by lazy { outline("languages", false,
        "m5 8 6 6",
        "m4 14 6-6 2-3",
        "M2 5h12",
        "M7 2h1",
        "m22 22-5-10-5 10",
        "M14 18h6"
    ) }
    val LightMode: ImageVector by lazy { outline("sun", false,
        "M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0",
        "M12 2v2",
        "M12 20v2",
        "m4.93 4.93 1.41 1.41",
        "m17.66 17.66 1.41 1.41",
        "M2 12h2",
        "M20 12h2",
        "m6.34 17.66-1.41 1.41",
        "m19.07 4.93-1.41 1.41"
    ) }
    val Link: ImageVector by lazy { outline("link-2", false,
        "M9 17H7A5 5 0 0 1 7 7h2",
        "M15 7h2a5 5 0 1 1 0 10h-2",
        "M8 12L16 12"
    ) }
    val LocalActivity: ImageVector by lazy { outline("ticket", false,
        "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",
        "M13 5v2",
        "M13 17v2",
        "M13 11v2"
    ) }
    val Lock: ImageVector by lazy { outline("lock-keyhole", false,
        "M11 16a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
        "M5 10h14a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2Z",
        "M7 10V7a5 5 0 0 1 10 0v3"
    ) }
    val Logout: ImageVector by lazy { outline("log-out", false,
        "m16 17 5-5-5-5",
        "M21 12H9",
        "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
    ) }
    val MeetingRoom: ImageVector by lazy { outline("door-open", false,
        "M11 20H2",
        "M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z",
        "M11 4H8a2 2 0 0 0-2 2v14",
        "M14 12h.01",
        "M22 20h-3"
    ) }
    val Mic: ImageVector by lazy { outline("mic", false,
        "M12 19v3",
        "M19 10v2a7 7 0 0 1-14 0v-2",
        "M12 2h0a3 3 0 0 1 3 3v7a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3v-7a3 3 0 0 1 3 -3Z"
    ) }
    val MicOff: ImageVector by lazy { outline("mic-off", false,
        "M12 19v3",
        "M15 9.34V5a3 3 0 0 0-5.68-1.33",
        "M16.95 16.95A7 7 0 0 1 5 12v-2",
        "M18.89 13.23A7 7 0 0 0 19 12v-2",
        "m2 2 20 20",
        "M9 9v3a3 3 0 0 0 5.12 2.12"
    ) }
    val Palette: ImageVector by lazy { outline("palette", false,
        "M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z",
        "M13 6.5a0.5 0.5 0 1 0 1 0a0.5 0.5 0 1 0 -1 0",
        "M17 10.5a0.5 0.5 0 1 0 1 0a0.5 0.5 0 1 0 -1 0",
        "M6 12.5a0.5 0.5 0 1 0 1 0a0.5 0.5 0 1 0 -1 0",
        "M8 7.5a0.5 0.5 0 1 0 1 0a0.5 0.5 0 1 0 -1 0"
    ) }
    val Pause: ImageVector by lazy { outline("pause", false,
        "M15 3h3a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-16a1 1 0 0 1 1 -1Z",
        "M6 3h3a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-16a1 1 0 0 1 1 -1Z"
    ) }
    val PersonAdd: ImageVector by lazy { outline("user-plus", false,
        "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
        "M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0",
        "M19 8L19 14",
        "M22 11L16 11"
    ) }
    val PlayArrow: ImageVector by lazy { outline("play", false,
        "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"
    ) }
    val Schedule: ImageVector by lazy { outline("clock", false,
        "M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0",
        "M12 6v6l4 2"
    ) }
    val Search: ImageVector by lazy { outline("search", false,
        "m21 21-4.34-4.34",
        "M3 11a8 8 0 1 0 16 0a8 8 0 1 0 -16 0"
    ) }
    val Send: ImageVector by lazy { outline("send", true,
        "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
        "m21.854 2.147-10.94 10.939"
    ) }
    val SentimentSatisfiedAlt: ImageVector by lazy { outline("smile", false,
        "M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0",
        "M8 14s1.5 2 4 2 4-2 4-2",
        "M9 9L9.01 9",
        "M15 9L15.01 9"
    ) }
    val Settings: ImageVector by lazy { outline("settings", false,
        "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
        "M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"
    ) }
    val Share: ImageVector by lazy { outline("share-2", false,
        "M15 5a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
        "M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
        "M15 19a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
        "M8.59 13.51L15.42 17.49",
        "M15.41 6.51L8.59 10.49"
    ) }
    val Stop: ImageVector by lazy { outline("square", false,
        "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2Z"
    ) }
    val Subtitles: ImageVector by lazy { outline("subtitles", false,
        "M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2Z",
        "M7 15h4M15 15h2M7 11h2M13 11h4"
    ) }
    val Sync: ImageVector by lazy { outline("refresh-cw", false,
        "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",
        "M21 3v5h-5",
        "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
        "M8 16H3v5"
    ) }
    val VolumeOff: ImageVector by lazy { outline("volume-x", false,
        "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
        "M22 9L16 15",
        "M16 9L22 15"
    ) }
    val VolumeUp: ImageVector by lazy { outline("volume-2", false,
        "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
        "M16 9a5 5 0 0 1 0 6",
        "M19.364 18.364a9 9 0 0 0 0-12.728"
    ) }
    val WifiOff: ImageVector by lazy { outline("wifi-off", false,
        "M12 20h.01",
        "M8.5 16.429a5 5 0 0 1 7 0",
        "M5 12.859a10 10 0 0 1 5.17-2.69",
        "M19 12.859a10 10 0 0 0-2.007-1.523",
        "M2 8.82a15 15 0 0 1 4.177-2.643",
        "M22 8.82a15 15 0 0 0-11.288-3.764",
        "m2 2 20 20"
    ) }
}

private fun outline(name: String, mirrored: Boolean, vararg paths: String): ImageVector =
    ImageVector.Builder(name, 24.dp, 24.dp, 24f, 24f, autoMirror = mirrored).apply {
        paths.forEach { data ->
            addPath(
                pathData = PathParser().parsePathString(data).toNodes(),
                stroke = SolidColor(Color.Black), strokeLineWidth = 2.1f,
                strokeLineCap = StrokeCap.Round, strokeLineJoin = StrokeJoin.Round,
            )
        }
    }.build()
