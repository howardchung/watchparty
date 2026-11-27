package top.roomio.data.party

import kotlinx.serialization.json.*
import top.roomio.domain.party.*

internal fun parseGroupSync(element: JsonElement?): GroupSyncAttempt? {
    if (element == null || element == JsonNull) return null
    val o = element.jsonObject
    fun str(key: String) = o[key]?.jsonPrimitive?.contentOrNull ?: error("Missing sync field $key")
    fun long(key: String) = str(key).toLong()
    return GroupSyncAttempt(
        requestId = str("requestId"), streamSessionId = str("streamSessionId"), streamRevision = long("streamRevision"),
        ownerMembershipId = str("ownerMembershipId"), targetPositionMs = long("targetPositionMs"), createdAtMs = long("createdAtMs"), revision = long("revision"),
        phase = GroupSyncPhase.valueOf(str("phase")),
        participants = o.getValue("participants").jsonArray.map { entry ->
            val p = entry.jsonObject
            GroupSyncParticipant(p.getValue("membershipId").jsonPrimitive.content, GroupSyncResponse.valueOf(p.getValue("response").jsonPrimitive.content), p["ready"]?.jsonPrimitive?.booleanOrNull ?: false, p["reason"]?.jsonPrimitive?.contentOrNull)
        },
        deadlineMs = o["deadlineMs"]?.jsonPrimitive?.longOrNull,
        startAtMs = o["startAtMs"]?.jsonPrimitive?.longOrNull,
        localFile = o["localFile"]?.jsonPrimitive?.booleanOrNull ?: false,
        reason = o["reason"]?.jsonPrimitive?.contentOrNull,
    )
}
