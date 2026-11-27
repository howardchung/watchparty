package top.roomio.domain.diagnostics

private val operations = setOf("http", "auth", "room", "voice", "player", "report", "service", "realtime")

private val location = Regex("""\bat top\.roomio\.[^(]*\((HttpDiagnostics|Http|KtorRoomRepository|MeshVoiceClient|RoomViewModel|AndroidVideoPlayer|AppObservability)\.kt:(\d{1,7})\)""")

/** Keep a source-owned subsystem and throwable class, never the throwable's free-form text. */
fun handledExceptionDetails(operation: String, error: Throwable): String {
    val family = operations.firstOrNull { operation.contains(it, ignoreCase = true) } ?: "native"
    val cause = error.cause?.let { " causeType=${it::class.simpleName}" }.orEmpty()
    val frame = error.stackTraceToString().lineSequence().drop(1).take(24)
        .mapNotNull { location.find(it) }.firstOrNull()
    val source = frame?.let { " frame=${it.groupValues[1]}:${it.groupValues[2]}:0" }.orEmpty()
    return "exception.handled operation=$family type=${error::class.simpleName}$cause$source"
}
