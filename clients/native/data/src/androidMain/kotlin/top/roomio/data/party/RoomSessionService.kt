package top.roomio.data.party

import top.roomio.data.diagnostics.logHandledException

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.graphics.drawable.Icon
import android.os.Build
import android.os.IBinder
import android.os.Binder
import top.roomio.domain.party.RoomSession
import top.roomio.data.R
import top.roomio.domain.party.RoomSessionExtras
import top.roomio.domain.party.SessionAction

/**
 * Foreground service that keeps the room session alive while the app is in the
 * background: the realtime socket and the WebRTC voice mesh keep running, and a
 * persistent notification shows that the party is still active.
 *
 * It runs for as long as the user is inside a room and stops on leave. The
 * notification returns the user to the room on tap and exposes microphone and
 * leave actions handled through its bound interface.
 */
class RoomSessionService : Service() {
    private val log = co.touchlab.kermit.Logger.withTag("RoomService")

    private var roomId: String? = null
    private var asOwner: Boolean = false
    private var voiceActive: Boolean = false
    private var micMuted: Boolean = true
    private var foregroundStarted: Boolean = false

    private var commandHandler: ((SessionAction) -> Unit)? = null
    private var startupFailure: Throwable? = null
    private val localBinder = SessionBinder()

    /** Same-process local Binder, as documented by Android bound-services guidance. */
    inner class SessionBinder : Binder() {
        fun register(handler: ((SessionAction) -> Unit)?) { commandHandler = handler }
        fun update(room: RoomSession) {
            roomId = room.roomId
            asOwner = room.asOwner
            voiceActive = room.voiceActive
            micMuted = room.micMuted
            startForegroundCompat()
            startupFailure = null
        }
        fun confirmMicrophone(room: RoomSession) {
            // startForeground itself enforces while-in-use/background restrictions.
            // https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start
            check(hasMicrophonePermission()) { "Microphone permission required" }
            update(room.copy(voiceActive = true))
            check(foregroundStarted && voiceActive) { "Microphone service not active" }
        }
    }

    override fun onBind(intent: Intent?): IBinder = localBinder

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = when (intent?.action) {
            ACTION_START -> "start"
            ACTION_STOP -> "stop"
            ACTION_TOGGLE_MIC -> "toggle_microphone"
            ACTION_LEAVE -> "leave"
            else -> "unknown"
        }
        log.i("service.command action=$action foreground=$foregroundStarted voice=$voiceActive muted=$micMuted")
        when (intent?.action) {
            ACTION_STOP -> stopSession()
            ACTION_TOGGLE_MIC -> {
                // Display follows acknowledged capture state returned by the coordinator.
                commandHandler?.invoke(if (micMuted) SessionAction.UnmuteVoice else SessionAction.MuteVoice)
            }
            ACTION_LEAVE -> commandHandler?.invoke(SessionAction.Leave) ?: stopSession()
            ACTION_START -> {
                val id = intent.getStringExtra(EXTRA_ROOM_ID)
                if (id == null) { stopSession(); return START_NOT_STICKY }
                try {
                    localBinder.update(RoomSession(id,
                        intent.getBooleanExtra(EXTRA_ROOM_AS_OWNER, false),
                        intent.getBooleanExtra(EXTRA_VOICE_ACTIVE, false),
                        intent.getBooleanExtra(EXTRA_MIC_MUTED, true)))
                } catch (error: Throwable) {
                    logHandledException("RoomSessionService.catch1", error)
                    log.e("service.start_failed type=${error::class.simpleName}")
                    startupFailure = error
                    voiceActive = false
                    micMuted = true
                    commandHandler?.invoke(SessionAction.MicrophoneServiceLost)
                    if (!foregroundStarted) stopSelf()
                }
            }
            else -> stopSession()
        }
        // Never restore microphone capture or room context after process death.
        return START_NOT_STICKY
    }

    override fun onDestroy() {
        log.i("service.destroyed")
        commandHandler?.invoke(SessionAction.MicrophoneServiceLost)
        commandHandler = null
        stopForegroundCompat()
        super.onDestroy()
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        log.i("service.task_removed")
        commandHandler?.invoke(SessionAction.Leave) ?: stopSession()
        super.onTaskRemoved(rootIntent)
    }

    private fun startForegroundCompat() {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        ensureChannel(manager)
        val notification = buildNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (voiceActive) check(hasMicrophonePermission()) { "Microphone permission required" }
            // No data-sync fallback may claim microphone protection on failure.
            startForeground(NOTIFICATION_ID, notification, foregroundServiceType())
        } else startForeground(NOTIFICATION_ID, notification)
        foregroundStarted = true
    }

    private fun notifyForeground() {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        ensureChannel(manager)
        manager.notify(NOTIFICATION_ID, buildNotification())
    }

    private fun stopSession() {
        foregroundStarted = false
        stopForegroundCompat()
        stopSelf()
    }

    private fun stopForegroundCompat() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
    }

    private fun foregroundServiceType(): Int {
        val microphone = voiceActive && hasMicrophonePermission()
        return if (microphone) {
            ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE or
                ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
        } else {
            ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
        }
    }

    private fun localizedString(id: Int): String {
        val configuration = android.content.res.Configuration(resources.configuration).apply {
            setLocale(java.util.Locale.getDefault())
        }
        return createConfigurationContext(configuration).getString(id)
    }

    private fun buildNotification(): Notification {
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }
        builder
            .setSmallIcon(R.drawable.ic_roomio_session)
            .setContentTitle(localizedString(R.string.session_notification_title))
            .setContentText(
                localizedString(
                    if (voiceActive) {
                        R.string.session_notification_text_voice
                    } else {
                        R.string.session_notification_text
                    },
                ),
            )
            .setOngoing(true)
            .setCategory(Notification.CATEGORY_SERVICE)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
        launchIntent()?.let { builder.setContentIntent(it) }
        if (voiceActive) {
            builder.addAction(microphoneAction())
        }
        builder.addAction(leaveAction())
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            @Suppress("DEPRECATION")
            builder.setPriority(Notification.PRIORITY_LOW)
        }
        return builder.build()
    }

    private fun microphoneAction(): Notification.Action {
        val icon = if (micMuted) R.drawable.ic_roomio_unmute else R.drawable.ic_roomio_mute
        val title = localizedString(
            if (micMuted) R.string.session_action_unmute else R.string.session_action_mute,
        )
        return action(icon, title, REQUEST_TOGGLE_MIC, ACTION_TOGGLE_MIC)
    }

    private fun leaveAction(): Notification.Action =
        action(
            R.drawable.ic_roomio_leave,
            localizedString(R.string.session_action_leave),
            REQUEST_LEAVE,
            ACTION_LEAVE,
        )

    private fun action(iconRes: Int, title: String, requestCode: Int, action: String): Notification.Action {
        val pendingIntent = PendingIntent.getService(
            this,
            requestCode,
            Intent(this, RoomSessionService::class.java).setAction(action),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        return Notification.Action.Builder(Icon.createWithResource(this, iconRes), title, pendingIntent).build()
    }

    private fun launchIntent(): PendingIntent? {
        val launch = packageManager.getLaunchIntentForPackage(packageName) ?: return null
        launch.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        roomId?.let { id ->
            launch.putExtra(RoomSessionExtras.ROOM_ID, id)
            launch.putExtra(RoomSessionExtras.AS_OWNER, asOwner)
        }
        return PendingIntent.getActivity(
            this,
            REQUEST_OPEN,
            launch,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    private fun ensureChannel(manager: NotificationManager) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        if (manager.getNotificationChannel(CHANNEL_ID) != null) return
        val channel = NotificationChannel(
            CHANNEL_ID,
            localizedString(R.string.session_channel_name),
            NotificationManager.IMPORTANCE_LOW,
        ).apply {
            description = localizedString(R.string.session_channel_description)
            setShowBadge(false)
        }
        manager.createNotificationChannel(channel)
    }

    private fun hasMicrophonePermission(): Boolean =
        checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) ==
            PackageManager.PERMISSION_GRANTED

    companion object {
        const val ACTION_START = "top.roomio.data.party.action.START_SESSION"
        const val ACTION_STOP = "top.roomio.data.party.action.STOP_SESSION"
        const val ACTION_TOGGLE_MIC = "top.roomio.data.party.action.TOGGLE_MIC"
        const val ACTION_LEAVE = "top.roomio.data.party.action.LEAVE"
        const val EXTRA_ROOM_ID = "roomId"
        const val EXTRA_ROOM_AS_OWNER = "roomAsOwner"
        const val EXTRA_VOICE_ACTIVE = "voiceActive"
        const val EXTRA_MIC_MUTED = "micMuted"
        private const val CHANNEL_ID = "roomio_session"
        private const val NOTIFICATION_ID = 4701
        private const val REQUEST_OPEN = 1
        private const val REQUEST_TOGGLE_MIC = 2
        private const val REQUEST_LEAVE = 3
    }
}
