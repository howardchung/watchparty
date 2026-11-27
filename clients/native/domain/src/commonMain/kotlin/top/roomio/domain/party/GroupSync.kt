package top.roomio.domain.party

enum class GroupSyncPhase { INVITING, PREPARING, SCHEDULED, COMPLETED, CANCELLED, FAILED }
enum class GroupSyncResponse { PENDING, ACCEPTED, DECLINED, WITHDRAWN, EXCLUDED }
data class GroupSyncParticipant(val membershipId: String, val response: GroupSyncResponse, val ready: Boolean = false, val reason: String? = null)
data class GroupSyncAttempt(
    val requestId: String,
    val streamSessionId: String,
    val streamRevision: Long,
    val ownerMembershipId: String,
    val targetPositionMs: Long,
    val createdAtMs: Long,
    val revision: Long,
    val phase: GroupSyncPhase,
    val participants: List<GroupSyncParticipant>,
    val deadlineMs: Long? = null,
    val startAtMs: Long? = null,
    val reason: String? = null,
    val localFile: Boolean = false,
) {
    val active: Boolean get() = phase == GroupSyncPhase.INVITING || phase == GroupSyncPhase.PREPARING || phase == GroupSyncPhase.SCHEDULED
}
