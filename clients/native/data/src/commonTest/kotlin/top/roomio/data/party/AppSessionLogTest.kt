package top.roomio.data.party

import co.touchlab.kermit.Severity
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class AppSessionLogTest {
    @Test fun onlyApprovedFieldsEnterTheSessionAndCrashHistory() {
        AppSessionLog.log(Severity.Warn, "private-chat /private-file.mkv", "private-tag", Exception("private-name"))
        repeat(14) { AppSessionLog.log(Severity.Info, "player.state state=2 positionMs=87654321", "Player", null) }
        val saved = AppSessionLog.snapshot()
        assertTrue(saved.contains("native.warning"))
        assertTrue(saved.contains("player.state"))
        assertTrue(AppSessionLog.crashTrail().size == 12)
        assertFalse(saved.contains("private-"))
        assertFalse(saved.contains("87654321"))
    }
}
