package top.roomio.data.party

import co.touchlab.kermit.LogWriter
import co.touchlab.kermit.Logger
import co.touchlab.kermit.Severity
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.longOrNull
import kotlinx.serialization.json.put
import kotlin.time.Clock
import kotlin.time.ExperimentalTime
import kotlin.time.TimeSource

fun initializeAppLogging() = AppSessionLog.install()

private val events = """
    http.start http.response http.cancelled http.failure http.decode_failure exception.handled
    auth.create auth.refresh auth.reset auth.profile auth.failure room.connect room.connected room.close
    room.snapshot room.disconnected room.retry_scheduled room.reconnected room.auth_refresh
    player.state player.playing player.tracks player.failure player.lifecycle player.released player.load
    player.decoder_recovery player.retry player.subtitle voice.microphone voice.peer_ice voice.disconnect
    service.command service.start_failed service.destroyed service.task_removed report.send report.accepted
""".trimIndent().split(Regex("\\s+")).toSet()
private val frame = Regex("""(?:HttpDiagnostics|Http|KtorRoomRepository|MeshVoiceClient|RoomViewModel|AndroidVideoPlayer|AppObservability):\d{1,7}:0""")
private val numeric = setOf("status", "operation", "elapsedMs", "mediaError", "attempt", "generation", "retries", "peers", "groups", "state")
private val boolKeys = setOf("enabled","retry","value","muted")
private val labelKeys = setOf("code","type","method","state","operation","causeType")
private val values = setOf("GET","POST","PATCH","DELETE","UNKNOWN","NETWORK","TRANSPORT_ERROR","IllegalStateException",
    "IllegalArgumentException","CancellationException","IOException","RuntimeException","SocketTimeoutException",
    "ERROR_CODE_DECODING_RESOURCES_RECLAIMED","ERROR_CODE_FAILED_RUNTIME_CHECK","ERROR_CODE_DECODING_FAILED",
    "native","player","room","http","auth","voice","service","report","realtime","connected","disconnected","failed","checking","new","closed")

/** Only fixed application event names and typed fields enter session logs and crash history. */
private fun record(message: String, severity: Severity): JsonObject? {
    val name = message.substringBefore(' ')
    val event = when {
        name in events -> name
        severity >= Severity.Error -> "native.error"
        severity >= Severity.Warn -> "native.warning"
        else -> return null
    }
    return buildJsonObject {
        put("event", event)
        if (name !in events) return@buildJsonObject
        for (part in message.take(1024).split(' ').drop(1)) {
            val key = part.substringBefore('=')
            val value = part.substringAfter('=', "")
            val number = value.toLongOrNull()
            when {
                key in numeric && number != null && number >= 0 -> put(key, number)
                key in boolKeys && value in setOf("true","false") -> put(key, value.toBoolean())
                key in labelKeys && value in values -> put(key,value)
                key == "frame" && frame.matches(value) -> put(key,value)
                key == "route" -> put(key, if (value == "[socket-handshake]") value else diagnosticRoute(value))
            }
        }
    }
}

@OptIn(ExperimentalTime::class)
object AppSessionLog : LogWriter() {
    private val started = Clock.System.now()
    val startedAt = started.toString()
    val startedMillis = started.toEpochMilliseconds()
    private val start = TimeSource.Monotonic.markNow()
    private val installed = MutableStateFlow(false)
    private class Entry(val json: JsonObject, val previous: Entry?)
    private val lines = MutableStateFlow(Entry(buildJsonObject { put("event","app.started") }, null))
    private var localWriters: List<LogWriter> = emptyList()
    fun install() {
        if (installed.compareAndSet(false, true)) {
            localWriters = Logger.config.logWriterList.filter { it !== this }
            Logger.setLogWriters(listOf(this))
        }
    }
    override fun log(severity: Severity, message: String, tag: String, throwable: Throwable?) {
        val safe = record(message, severity) ?: return
        val json = buildJsonObject { safe.forEach { (k,v) -> put(k,v) }; put("elapsedSec",start.elapsedNow().inWholeSeconds) }
        lines.update { Entry(json, it) }
        localWriters.forEach { writer -> writer.log(severity, json.toString(), "watchparty", null) }
    }
    private fun recent(limit: Int): List<JsonObject> {
        val result = mutableListOf<JsonObject>()
        var entry: Entry? = lines.value
        while (entry != null && result.size < limit) {
            result.add(entry.json)
            entry = entry.previous
        }
        return result.asReversed()
    }
    fun crashTrail(): List<String> {
        val earliest = start.elapsedNow().inWholeSeconds - 120
        return recent(12).filter { (it["elapsedSec"]?.jsonPrimitive?.longOrNull ?: 0) >= earliest }.map { it.toString() }
    }
    fun snapshot() = recent(Int.MAX_VALUE).joinToString("\n")
}

internal expect fun reportDeviceInfo(): Map<String, String>
internal expect fun newReportId(): String
