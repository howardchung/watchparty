package top.roomio.data.party

import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import kotlin.test.assertEquals
import kotlin.test.assertNull

class PeerGenerationFenceTest {
    @Test
    fun offerAnswerAndIceAreBoundToCurrentPeerEpochs() {
        val fence = PeerGenerationFence(localGeneration = 4)
        assertTrue(fence.acceptOffer(senderGeneration = 9, targetGeneration = 0))
        assertTrue(fence.acceptCandidate(senderGeneration = 9, targetGeneration = 0))
        assertTrue(fence.acceptAnswer(senderGeneration = 9, targetGeneration = 4))
        assertTrue(fence.acceptCandidate(senderGeneration = 9, targetGeneration = 4))
        assertFalse(fence.acceptCandidate(senderGeneration = 8, targetGeneration = 4))
        assertFalse(fence.acceptAnswer(senderGeneration = 10, targetGeneration = 4))
        assertFalse(fence.acceptAnswer(senderGeneration = 9, targetGeneration = 3))
    }

    @Test
    fun restartAndNewOfferRejectStalePeerGenerations() {
        val fence = PeerGenerationFence(localGeneration = 7)
        assertTrue(fence.acceptOffer(senderGeneration = 2, targetGeneration = 0))
        assertTrue(fence.acceptRestart(senderGeneration = 2, targetGeneration = 7))
        val replacementPeer = PeerGenerationFence(localGeneration = 8)
        assertFalse(replacementPeer.acceptOffer(senderGeneration = 2, targetGeneration = 7))
        assertTrue(replacementPeer.acceptOffer(senderGeneration = 3, targetGeneration = 0))
        assertFalse(replacementPeer.acceptRestart(senderGeneration = 2, targetGeneration = 7))
    }

    @Test
    fun freshRemoteOfferRecoversExhaustedResponderAndDuplicateDoesNotReplaceAgain() {
        val links = MeshLinkStateMachine()
        links.opened("peer", "voice", 4, 3)
        assertNull(links.retry("peer", 4))
        var current = PeerGenerationFence(4)
        assertTrue(current.acceptOffer(9, 0))
        var replacements = 0
        assertTrue(current.acceptRemoteOffer(10, 0) {
            replacements++
            current = PeerGenerationFence(5)
            links.opened("peer", "voice", 5, 0)
            current
        })
        assertEquals(1, replacements)
        assertEquals(10L, current.remoteGeneration)
        assertFalse(current.acceptRemoteOffer(10, 0) { error("duplicate must not replace") })
        assertEquals(1, links.retry("peer", 5))
        assertTrue(current.acceptCandidate(10, 5))
        assertFalse(current.acceptCandidate(9, 4))
    }

    @Test
    fun explicitAnswererRequestRecoversExhaustedInitialPairOnlyOnceAndPreservesHealthyLinks() {
        val links = MeshLinkStateMachine()
        links.opened("broken", "voice", 4, 3)
        assertNull(links.retry("broken", 4))
        links.opened("healthy", "voice", 7, 0)
        links.connected("healthy", 7)
        // The answerer has also exhausted retries and starts epoch 5; it never
        // received an SDP and therefore cannot name the offerer's epoch.
        assertTrue(links.acceptOfferRequest("broken", "voice", 5, 0, null))
        links.opened("broken", "voice", 5, 0) // exactly one replacement/offer
        assertEquals(1, links.retry("broken", 5))
        assertFalse(links.acceptOfferRequest("broken", "voice", 5, 0, null))
        assertFalse(links.acceptOfferRequest("broken", "voice", 4, 0, null))
        assertFalse(links.acceptOfferRequest("broken", "voice", 6, 4, null))
        assertFalse(links.acceptOfferRequest("broken", "old-voice", 6, 0, null))
        assertFalse(links.acceptOfferRequest("healthy", "voice", 8, 0, 8))
        assertEquals(top.roomio.domain.party.VoicePeerStatus.CONNECTED, links.snapshot()["healthy"])
        // Even an ignored request cannot be replayed to reset a later failure.
        links.disconnected("healthy", 7)
        assertFalse(links.acceptOfferRequest("healthy", "voice", 8, 0, 8))
        assertTrue(links.acceptOfferRequest("healthy", "voice", 9, 7, 8))
    }

    @Test
    fun newerAnswererEpochRepairsAsymmetricFailureWithoutResettingOtherHealthyLinks() {
        val links = MeshLinkStateMachine()
        links.opened("asymmetric", "voice", 7, 0)
        links.connected("asymmetric", 7)
        links.opened("other", "voice", 9, 0)
        links.connected("other", 9)
        // Equal/stale epochs cannot reset a connected replacement.
        assertFalse(links.acceptOfferRequest("asymmetric", "voice", 4, 7, 4))
        assertFalse(links.acceptOfferRequest("asymmetric", "voice", 3, 7, 4))
        // The remote user's failed PC has been replaced by epoch 5. Our ICE
        // state can still say connected; only this pair must offer again.
        assertTrue(links.acceptOfferRequest("asymmetric", "voice", 5, 7, 4))
        links.opened("asymmetric", "voice", 8, 0)
        assertFalse(links.acceptOfferRequest("asymmetric", "voice", 5, 0, null))
        assertEquals(top.roomio.domain.party.VoicePeerStatus.CONNECTED, links.snapshot()["other"])
        // A new remote voice session starts its own request epoch sequence.
        links.opened("asymmetric", "new-voice", 9, 0)
        assertTrue(links.acceptOfferRequest("asymmetric", "new-voice", 1, 0, null))
    }
}
