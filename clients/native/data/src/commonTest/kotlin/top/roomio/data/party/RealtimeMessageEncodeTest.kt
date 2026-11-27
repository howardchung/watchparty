package top.roomio.data.party

import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import top.roomio.data.party.dto.PlaybackReportMessage
import top.roomio.data.party.dto.SyncRequestMessage
import top.roomio.domain.party.RealtimeEvent
import top.roomio.domain.party.SyncStatus

class RealtimeMessageEncodeTest {

    // Mirrors the production Json config (PartyDataBindings.provideJson), which
    // does not enable encodeDefaults.
    private val json = Json {
        ignoreUnknownKeys = true
        explicitNulls = false
    }

    @Test
    fun playbackReportAlwaysEncodesItsTypeField() {
        val encoded = json.encodeToString(
            PlaybackReportMessage.serializer(),
            PlaybackReportMessage(streamSessionId = "s1", positionMs = 1234, playing = true),
        )
        assertTrue(
            encoded.contains("\"type\":\"playback.report\""),
            "playback.report frame must carry its type so the server can dispatch: $encoded",
        )
    }

    @Test
    fun syncRequestAlwaysEncodesItsTypeField() {
        val encoded = json.encodeToString(
            SyncRequestMessage.serializer(),
            SyncRequestMessage(streamSessionId = "s1", positionMs = 2345, requestId = "sync-abc"),
        )
        assertTrue(
            encoded.contains("\"type\":\"sync.request\""),
            "sync.request frame must carry its type so the server can dispatch: $encoded",
        )
        assertTrue(
            encoded.contains("\"requestId\":\"sync-abc\""),
            "sync.request frame must carry its correlation id: $encoded",
        )
    }

    @Test
    fun syncResultPreservesTheRequestCorrelationId() {
        val event = parseRealtimeFrame(
            json,
            """{"type":"sync.result","status":"APPLIED","targetPositionMs":4200,"requestId":"sync-abc"}""",
        )
        assertEquals(
            RealtimeEvent.SyncResult(SyncStatus.APPLIED, 4200, "sync-abc"),
            event,
            "the correlation id must survive parsing so stale replies can be ignored",
        )
    }
}