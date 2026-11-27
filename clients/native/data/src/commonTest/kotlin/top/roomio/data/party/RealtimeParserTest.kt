package top.roomio.data.party

import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertIs
import kotlin.test.assertTrue
import top.roomio.domain.party.RealtimeEvent

class RealtimeParserTest {

    // Mirrors the production Json config (PartyDataBindings.provideJson).
    private val json = Json {
        ignoreUnknownKeys = true
        explicitNulls = false
    }

    @Test
    fun memberAbsentCarriesTheMemberMarkedNotPresent() {
        val event = parseRealtimeFrame(
            json,
            """{"type":"event","topic":"member.absent","eventId":"e1","payload":{"member":{"membershipId":"m1","identityId":"i1","displayName":"Mira","avatar":"MINT","isOwner":true,"present":false}}}""",
        )

        val absent = assertIs<RealtimeEvent.MemberAbsent>(event)
        assertEquals("m1", absent.member.membershipId)
        assertEquals("Mira", absent.member.displayName)
        assertTrue(absent.member.isOwner)
        assertFalse(absent.member.present)
    }

    @Test
    fun memberReturnedCarriesTheMemberMarkedPresent() {
        val event = parseRealtimeFrame(
            json,
            """{"type":"event","topic":"member.returned","eventId":"e2","payload":{"member":{"membershipId":"m1","identityId":"i1","displayName":"Mira","avatar":"MINT","isOwner":true,"present":true}}}""",
        )

        val returned = assertIs<RealtimeEvent.MemberReturned>(event)
        assertTrue(returned.member.present)
    }

    @Test
    fun memberLeftStillCarriesOnlyTheMembershipId() {
        val event = parseRealtimeFrame(
            json,
            """{"type":"event","topic":"member.left","eventId":"e3","payload":{"member":{"membershipId":"m2","identityId":"i2","displayName":"Ellis","avatar":"SUNNY","isOwner":false,"present":false}}}""",
        )

        assertEquals("m2", assertIs<RealtimeEvent.MemberLeft>(event).membershipId)
    }

    @Test
    fun ownerPresenceReadsThePresentFlag() {
        val event = parseRealtimeFrame(
            json,
            """{"type":"event","topic":"owner.presence","eventId":"e4","payload":{"present":false,"ownerName":"Mira"}}""",
        )

        assertEquals(false, assertIs<RealtimeEvent.OwnerPresence>(event).present)
    }
}
