package top.roomio.data.party

import kotlinx.serialization.json.*
import kotlin.test.*
import top.roomio.domain.party.*

class GroupSyncContractTest {
 @Test fun scheduledAttemptPreservesLockedResponsesAndServerEpoch() {
  val attempt=parseGroupSync(Json.parseToJsonElement("""{"requestId":"request","streamSessionId":"stream","streamRevision":4,"ownerMembershipId":"owner","targetPositionMs":12000,"createdAtMs":1000,"revision":5,"phase":"SCHEDULED","startAtMs":9000,"deadlineMs":10000,"participants":[{"membershipId":"owner","response":"ACCEPTED","ready":true},{"membershipId":"guest","response":"EXCLUDED","ready":false,"reason":"PREPARATION_TIMEOUT"}]}"""))!!
  assertEquals(GroupSyncPhase.SCHEDULED,attempt.phase);assertEquals(9000,attempt.startAtMs)
  assertEquals(GroupSyncResponse.EXCLUDED,attempt.participants[1].response)
  assertEquals("PREPARATION_TIMEOUT",attempt.participants[1].reason)
  assertTrue(attempt.active)
 }
 @Test fun explicitNullClearsAttemptAndMalformedAttemptIsRejected() {
  assertNull(parseGroupSync(JsonNull));assertFails{parseGroupSync(Json.parseToJsonElement("""{"phase":"SCHEDULED"}"""))}
 }
}
