package top.roomio.app.room

import top.roomio.domain.party.ChatMessage

internal enum class ChatSendState { SENDING, FAILED }
internal data class PendingChatMessage(val id: String, val text: String, val state: ChatSendState = ChatSendState.SENDING, val error: String? = null)
internal data class RoomChatState(
    val identityId: String = "",
    val messages: List<ChatMessage> = emptyList(),
    val pending: List<PendingChatMessage> = emptyList(),
    val draft: String = "",
    val open: Boolean = true,
    val atLatest: Boolean = true,
    val unread: Int = 0,
    val connected: Boolean = false,
    val loading: Boolean = true,
    val loadingMore: Boolean = false,
    val hasMore: Boolean = false,
    val error: String? = null,
) {
    fun receive(message: ChatMessage): RoomChatState {
        val isNew = messages.none { it.id == message.id }
        val combined = (messages.filterNot { it.id == message.id } + message).sortedBy { it.sequence }
        return copy(
            messages = combined.takeLast(500),
            hasMore = hasMore || combined.size > 500,
            pending = pending.filterNot { it.id == message.id },
            unread = unread + if (isNew && message.identityId != identityId && (!open || !atLatest)) 1 else 0,
        )
    }
}
