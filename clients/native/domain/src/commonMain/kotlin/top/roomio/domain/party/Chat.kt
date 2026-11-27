package top.roomio.domain.party

/** Canonical, server-assigned plain-text message. Sequence is the room event sequence. */
data class ChatMessage(
    val id: String,
    val roomId: String,
    val identityId: String,
    val membershipId: String,
    val displayName: String,
    val avatar: String,
    val text: String,
    val createdAt: String,
    val sequence: Long,
)

data class ChatPage(val messages: List<ChatMessage> = emptyList(), val hasMore: Boolean = false)

fun normalizeChatText(value: String): String = value.replace("\r\n", "\n").replace('\r', '\n').trim()

/** UTF-16 length matches the browser/backend; do not split emoji surrogate pairs. */
fun validChatText(value: String): Boolean {
    if (value.isBlank() || value.length > 500) return false
    var index = 0
    while (index < value.length) {
        val char = value[index]
        if ((char.code < 32 && char != '\n' && char != '\t') || char.code == 127) return false
        if (char.isHighSurrogate()) {
            if (index + 1 >= value.length || !value[index + 1].isLowSurrogate()) return false
            index++
        } else if (char.isLowSurrogate()) return false
        index++
    }
    return true
}
