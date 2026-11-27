package top.roomio.data.party

/** Serializes immediate capture mute with delayed signaling authorization. */
internal class MicrophoneIntent {
    data class Request(val revision: Long, val enabled: Boolean)
    private val lock = Any()
    private var revision = 0L
    private var wanted = false

    fun request(enabled: Boolean, applyCapture: (Boolean) -> Unit): Request = synchronized(lock) {
        wanted = enabled
        revision++
        if (!enabled) applyCapture(false)
        Request(revision, wanted)
    }

    fun latest(): Request = synchronized(lock) { Request(revision, wanted) }

    /** The capture action shares the intent lock: a late ACK cannot race a newer mute. */
    fun authorized(request: Request, signalingReady: Boolean, applyCapture: (Boolean) -> Unit) = synchronized(lock) {
        if (request.revision == revision && signalingReady) applyCapture(request.enabled)
    }

    fun suspendCapture(applyCapture: (Boolean) -> Unit) = synchronized(lock) { applyCapture(false) }
}
