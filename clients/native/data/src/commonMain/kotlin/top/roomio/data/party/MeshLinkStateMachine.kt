package top.roomio.data.party

import top.roomio.domain.party.VoicePeerStatus

/** Platform-neutral link policy. Its caller serializes commands; epochs fence native callbacks. */
internal class MeshLinkStateMachine(private val maxRetries: Int = 3) {
    private data class Link(val generation: String, val epoch: Long, var attempt: Int, var status: VoicePeerStatus, var lastOfferRequest: Long = 0)
    private val links = linkedMapOf<String, Link>()

    fun opened(id: String, generation: String, epoch: Long, attempt: Int) {
        val lastRequest = links[id]?.takeIf { it.generation == generation }?.lastOfferRequest ?: 0L
        links[id] = Link(generation, epoch, attempt, if (attempt == 0) VoicePeerStatus.CONNECTING else VoicePeerStatus.RECONNECTING, lastRequest)
    }

    fun connected(id: String, epoch: Long): Boolean {
        val link = links[id]?.takeIf { it.epoch == epoch } ?: return false
        link.status = VoicePeerStatus.CONNECTED
        link.attempt = 0
        return true
    }

    fun needsRecovery(id: String, epoch: Long): Boolean = links[id]?.let {
        it.epoch == epoch && it.status != VoicePeerStatus.CONNECTED && it.status != VoicePeerStatus.UNAVAILABLE
    } == true

    fun disconnected(id: String, epoch: Long) {
        links[id]?.takeIf { it.epoch == epoch }?.status = VoicePeerStatus.RECONNECTING
    }

    /** One retry decision per epoch. Exhaustion never disposes other links. */
    fun retry(id: String, epoch: Long): Int? {
        val link = links[id]?.takeIf { it.epoch == epoch } ?: return null
        if (link.status == VoicePeerStatus.CONNECTED) return null
        if (link.attempt >= maxRetries) { link.status = VoicePeerStatus.UNAVAILABLE; return null }
        return link.attempt + 1
    }

    /** Explicit retry replaces one failed pair, including an asymmetric remote failure. */
    fun acceptOfferRequest(id: String, generation: String, senderEpoch: Long, targetEpoch: Long, remoteEpoch: Long?): Boolean {
        val link = links[id]?.takeIf { it.generation == generation } ?: return false
        if (senderEpoch <= 0 || senderEpoch <= link.lastOfferRequest ||
            targetEpoch != 0L && targetEpoch != link.epoch ||
            remoteEpoch != null && senderEpoch < remoteEpoch) return false
        // Remember even ignored requests so a delayed duplicate cannot later
        // reset a healthy replacement after its state changes.
        link.lastOfferRequest = senderEpoch
        // A newer remote epoch proves that the other half of this pair was
        // replaced, even while our ICE callback still reports connected.
        if (link.status == VoicePeerStatus.CONNECTED && (remoteEpoch == null || senderEpoch <= remoteEpoch)) return false
        link.attempt = 0
        link.status = VoicePeerStatus.RECONNECTING
        return true
    }

    fun remove(id: String) { links.remove(id) }
    fun snapshot(): Map<String, VoicePeerStatus> = links.mapValues { it.value.status }
}
