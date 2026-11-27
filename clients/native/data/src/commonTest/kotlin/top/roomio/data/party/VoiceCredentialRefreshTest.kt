package top.roomio.data.party

import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.launch
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.test.*
import kotlin.test.*
import top.roomio.domain.party.VoiceConfiguration

@OptIn(ExperimentalCoroutinesApi::class)
class VoiceCredentialRefreshTest {
    @Test
    fun failedRefreshRetriesAfterThirtySecondsThenReturnsToNormalSchedule() = runTest {
        var calls = 0
        val job = backgroundScope.launch {
            refreshVoiceCredentials({ true }) {
                calls++
                if (calls == 1) error("transient outage")
            }
        }
        runCurrent()
        advanceTimeBy(300_000)
        runCurrent()
        assertEquals(1, calls)
        advanceTimeBy(29_999)
        runCurrent()
        assertEquals(1, calls)
        advanceTimeBy(1)
        runCurrent()
        assertEquals(2, calls)
        advanceTimeBy(299_999)
        runCurrent()
        assertEquals(2, calls)
        advanceTimeBy(1)
        runCurrent()
        assertEquals(3, calls)
        job.cancel()
    }

    @Test
    fun delayedResponseCannotFailFreshJoinOrOverwriteNewerResumeCredentials() = runTest {
        val original = descriptor("old-session", "old-ticket", "old-ice")
        for (replacement in listOf(
            descriptor("new-session", "new-ticket", "new-ice"),
            original.copy(ticket = "resume-ticket", iceExpiresAt = "newer-ice"),
            original.copy(),
        )) {
            val owner = Mutex()
            var current = original
            val received = CompletableDeferred<VoiceConfiguration>()
            val snapshotTaken = CompletableDeferred<Unit>()
            var failures = 0
            var applied = 0
            val job = launch {
                val expected = owner.withLock { current }
                snapshotTaken.complete(Unit)
                val incoming = received.await()
                owner.withLock {
                    when (voiceRefreshDisposition(expected, current, incoming, closed = false)) {
                        VoiceRefreshDisposition.STALE -> Unit
                        VoiceRefreshDisposition.REPLACED -> failures++
                        VoiceRefreshDisposition.APPLY -> { current = incoming; applied++ }
                    }
                }
            }
            snapshotTaken.await()
            owner.withLock { current = replacement }
            received.complete(original.copy(iceExpiresAt = "late-ice"))
            job.join()
            assertSame(replacement, current)
            assertEquals(0, failures)
            assertEquals(0, applied)
        }
    }

    @Test
    fun onlyTheCurrentDescriptorCanApplyRefreshOrReportReplacement() {
        val current = descriptor("session", "ticket", "ice")
        assertEquals(VoiceRefreshDisposition.APPLY, voiceRefreshDisposition(current, current, current.copy(iceExpiresAt = "refreshed"), false))
        assertEquals(VoiceRefreshDisposition.REPLACED, voiceRefreshDisposition(current, current, current.copy(voiceSessionId = "foreign-session"), false))
        assertEquals(VoiceRefreshDisposition.REPLACED, voiceRefreshDisposition(current, current, current.copy(membershipId = "foreign-member"), false))
        assertEquals(VoiceRefreshDisposition.STALE, voiceRefreshDisposition(current, current.copy(), current.copy(voiceSessionId = "foreign-session"), false))
        assertEquals(VoiceRefreshDisposition.STALE, voiceRefreshDisposition(current, current, current.copy(voiceSessionId = "foreign-session"), true))
    }

    private fun descriptor(session: String, ticket: String, ice: String) = VoiceConfiguration(
        mode = "MESH", roomId = "room", membershipId = "member", voiceSessionId = session,
        namespace = "/watchparty/voice/room", ticket = ticket, iceServers = emptyList(), iceExpiresAt = ice,
    )
}
