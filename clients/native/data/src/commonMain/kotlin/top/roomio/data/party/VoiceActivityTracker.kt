package top.roomio.data.party

/** Applies short attack and release windows to WebRTC audio levels. */
internal class VoiceActivityTracker(
    private val attackSamples: Int = DEFAULT_ATTACK_SAMPLES,
    private val releaseMillis: Long = DEFAULT_RELEASE_MILLIS,
) {
    private val active = linkedSetOf<String>()
    private val aboveSamples = mutableMapOf<String, Int>()
    private val belowSince = mutableMapOf<String, Long>()

    fun sample(membershipId: String, aboveThreshold: Boolean, nowMillis: Long): Boolean {
        if (aboveThreshold) {
            belowSince.remove(membershipId)
            val samples = (aboveSamples[membershipId] ?: 0) + 1
            aboveSamples[membershipId] = samples
            return samples >= attackSamples && active.add(membershipId)
        }
        aboveSamples.remove(membershipId)
        if (membershipId !in active) return false
        val since = belowSince.getOrPut(membershipId) { nowMillis }
        return nowMillis - since >= releaseMillis && active.remove(membershipId)
    }

    fun clear(membershipId: String): Boolean {
        aboveSamples.remove(membershipId)
        belowSince.remove(membershipId)
        return active.remove(membershipId)
    }

    fun clearAll(): Boolean {
        val changed = active.isNotEmpty()
        active.clear()
        aboveSamples.clear()
        belowSince.clear()
        return changed
    }

    fun speakers(): Set<String> = active.toSet()

    companion object {
        const val DEFAULT_ATTACK_SAMPLES = 2
        const val DEFAULT_RELEASE_MILLIS = 500L
    }
}

/** Derives an RMS level from successive WebRTC energy counters when audioLevel is absent. */
internal class AudioEnergyDelta {
    private val previous = mutableMapOf<String, Pair<Double, Double>>()

    fun level(
        statId: String,
        audioLevel: Double?,
        totalAudioEnergy: Double?,
        totalSamplesDuration: Double?,
    ): Double {
        if (audioLevel != null && audioLevel.isFinite() && audioLevel >= 0.0)
            return audioLevel.coerceIn(0.0, 1.0)
        if (totalAudioEnergy == null || totalSamplesDuration == null ||
            !totalAudioEnergy.isFinite() || !totalSamplesDuration.isFinite() ||
            totalAudioEnergy < 0.0 || totalSamplesDuration <= 0.0
        ) return 0.0
        val current = totalAudioEnergy to totalSamplesDuration
        val prior = previous.put(statId, current) ?: return 0.0
        val energyDelta = totalAudioEnergy - prior.first
        val durationDelta = totalSamplesDuration - prior.second
        if (energyDelta < 0.0 || durationDelta <= 0.0) return 0.0
        return kotlin.math.sqrt(energyDelta / durationDelta).coerceIn(0.0, 1.0)
    }
}

/** Fences SDP, ICE, and restart messages to one local/remote peer-connection pair. */
internal class PeerGenerationFence(val localGeneration: Long) {
    var remoteGeneration: Long? = null
        private set

    private fun permitsOffer(senderGeneration: Long, targetGeneration: Long): Boolean =
        senderGeneration > 0L && (targetGeneration == 0L || targetGeneration == localGeneration) &&
            (remoteGeneration == null || senderGeneration > remoteGeneration!!)

    fun acceptOffer(senderGeneration: Long, targetGeneration: Long): Boolean {
        if (!permitsOffer(senderGeneration, targetGeneration)) return false
        remoteGeneration = senderGeneration
        return true
    }

    /** A fresh authorized offer replaces the PC independently of local retry exhaustion. */
    fun acceptRemoteOffer(senderGeneration: Long, targetGeneration: Long, replace: () -> PeerGenerationFence): Boolean {
        if (!permitsOffer(senderGeneration, targetGeneration)) return false
        return if (remoteGeneration == null) acceptOffer(senderGeneration, targetGeneration)
        else replace().acceptOffer(senderGeneration, 0L)
    }

    fun acceptAnswer(senderGeneration: Long, targetGeneration: Long): Boolean {
        if (senderGeneration <= 0L || targetGeneration != localGeneration) return false
        if (remoteGeneration != null && senderGeneration != remoteGeneration) return false
        remoteGeneration = senderGeneration
        return true
    }

    fun acceptCandidate(senderGeneration: Long, targetGeneration: Long): Boolean =
        senderGeneration > 0L && (targetGeneration == 0L || targetGeneration == localGeneration) &&
            (remoteGeneration == null || senderGeneration == remoteGeneration)

    fun acceptRestart(senderGeneration: Long, targetGeneration: Long): Boolean =
        targetGeneration == localGeneration && remoteGeneration == senderGeneration
}
