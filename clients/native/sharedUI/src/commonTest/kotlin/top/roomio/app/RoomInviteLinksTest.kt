package top.roomio.app

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import top.roomio.app.navigation.RoomInviteLinks

class RoomInviteLinksTest {
    @Test
    fun generatedLinkUsesProductionOriginAndRoundTrips() {
        assertEquals("https://watchparty.top/?invite=ABCD2345", RoomInviteLinks.create("ABCD2345"))
        assertEquals("ABCD-2345", RoomInviteLinks.codeFrom(RoomInviteLinks.create("ABCD-2345")))
        assertEquals("abcd 2345", RoomInviteLinks.codeFrom("https://watchparty.top/?invite=abcd%202345"))
    }

    @Test
    fun unrelatedAndAmbiguousLinksAreRejected() {
        listOf(
            "https://other.example/?invite=ABCD2345",
            "https://watchparty.top.evil.example/?invite=ABCD2345",
            "http://watchparty.top/?invite=ABCD2345",
            "https://user@watchparty.top/?invite=ABCD2345",
            "https://watchparty.top:444/?invite=ABCD2345",
            "https://watchparty.top/v1/rooms?invite=ABCD2345",
            "https://watchparty.top/",
            "https://watchparty.top/?invite=",
            "https://watchparty.top/?invite=ABCD2345&invite=WXYZ2345",
            "https://watchparty.top/?invite=ABCD%0A2345",
            "https://watchparty.top/?invite=" + "A".repeat(65),
            "not a url",
        ).forEach { assertNull(RoomInviteLinks.codeFrom(it), it) }
    }
}
