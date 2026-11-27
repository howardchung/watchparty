package top.roomio.app.room

import top.roomio.app.components.WatchPartyIcons
import top.roomio.app.components.desktopChatInput
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalWindowInfo
import top.roomio.app.diagnostics.loggedRunCatching

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.input.key.*
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource
import watchparty.sharedui.generated.resources.*
import top.roomio.app.theme.WatchPartyDesignSystem
import top.roomio.domain.party.ChatMessage
import top.roomio.domain.party.normalizeChatText
import top.roomio.domain.party.validChatText

@Composable
internal fun RoomChatPanel(state: RoomChatState, onAction: (RoomAction) -> Unit, modifier: Modifier = Modifier, desktopInput: Boolean = desktopChatInput) {
    val list = rememberLazyListState()
    val feedHeight = with(LocalDensity.current) { LocalWindowInfo.current.containerSize.height.toDp() * .38f }.coerceIn(260.dp, 420.dp)
    val canSend = state.pending.size < 20 && validChatText(normalizeChatText(state.draft))
    var composerFocused by remember { mutableStateOf(false) }
    val headerFocus = remember { FocusRequester() }
    val focus = LocalFocusManager.current
    var emojis by remember { mutableStateOf(false) }
    var field by remember { mutableStateOf(TextFieldValue(state.draft)) }
    LaunchedEffect(state.draft) {
        if (field.text != state.draft) field = TextFieldValue(state.draft, TextRange(state.draft.length))
    }
    LaunchedEffect(state.open) {
        if (state.open) snapshotFlow { list.isScrollInProgress to !list.canScrollForward }.distinctUntilChanged().collect { (scrolling, latest) ->
            if (scrolling || latest) onAction(RoomAction.ChatAtLatest(latest))
        }
    }
    LaunchedEffect(state.messages.lastOrNull()?.id, state.pending.size, state.open, state.atLatest) {
        val count = state.messages.size + state.pending.size + if (state.hasMore) 1 else 0
        if (state.open && state.atLatest && count > 0) list.scrollToItem(count - 1)
    }
    val collapse: () -> Unit = {
        emojis = false
        focus.clearFocus()
        onAction(RoomAction.ChatToggle)
        headerFocus.requestFocus()
    }
    BoxWithConstraints(modifier) {
    val showMark = maxWidth >= 400.dp
    Surface(
        modifier = Modifier.fillMaxWidth().onPreviewKeyEvent { event ->
            if (event.key == Key.Escape && event.type == KeyEventType.KeyDown && state.open) { collapse(); true } else false
        },
        shape = MaterialTheme.shapes.extraLarge,
        color = MaterialTheme.colorScheme.surfaceContainerLowest,
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
    ) {
        Column {
            Row(Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surfaceContainer).padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                if (showMark) Surface(shape = RoundedCornerShape(16.dp), color = MaterialTheme.colorScheme.secondaryContainer) {
                    Icon(WatchPartyIcons.ChatBubbleOutline, null, Modifier.padding(10.dp).size(22.dp), tint = MaterialTheme.colorScheme.onSecondaryContainer)
                }
                Column(Modifier.weight(1f)) {
                    Text(stringResource(Res.string.chat_title), style = MaterialTheme.typography.titleMedium)
                }
                if (state.unread > 0) {
                    val unread = stringResource(Res.string.chat_unread, state.unread)
                    Surface(shape = CircleShape, color = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary,
                        modifier = Modifier.semantics { contentDescription = unread; liveRegion = LiveRegionMode.Polite }) {
                        Box(Modifier.defaultMinSize(minWidth = 24.dp, minHeight = 24.dp).padding(horizontal = 6.dp), contentAlignment = Alignment.Center) {
                            Text(state.unread.toString(), style = MaterialTheme.typography.labelMedium)
                        }
                    }
                }
                IconButton(onClick = collapse, modifier = Modifier.focusRequester(headerFocus)) {
                    Icon(if (state.open) WatchPartyIcons.ExpandMore else WatchPartyIcons.ExpandLess, stringResource(if (state.open) Res.string.chat_collapse else Res.string.chat_open))
                }
            }
            if (state.open) {
                Box {
                    LazyColumn(
                        state = list, modifier = Modifier.fillMaxWidth().height(feedHeight),
                        contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        if (state.hasMore) item(key = "history") {
                            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                                TextButton(enabled = state.connected && !state.loadingMore, onClick = { onAction(if (state.messages.size >= 500) RoomAction.ChatRefresh else RoomAction.ChatLoadEarlier) }) {
                                    Text(stringResource(if (state.loadingMore) Res.string.chat_history_loading else if (state.messages.size >= 500) Res.string.chat_refresh else Res.string.chat_earlier))
                                }
                            }
                        }
                        if (state.loading) item(key = "loading") {
                            Column(Modifier.fillMaxWidth().padding(vertical = 48.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(16.dp)) {
                                CircularProgressIndicator(Modifier.size(28.dp))
                                Text(stringResource(Res.string.chat_loading), style = MaterialTheme.typography.bodyMedium)
                            }
                        } else if (state.messages.isEmpty() && state.pending.isEmpty()) item(key = "empty") {
                            Column(Modifier.fillMaxWidth().padding(vertical = 40.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                Surface(shape = RoundedCornerShape(28.dp), color = MaterialTheme.colorScheme.tertiaryContainer) { Icon(WatchPartyIcons.ChatBubbleOutline, null, Modifier.padding(20.dp).size(30.dp)) }
                                Text(stringResource(Res.string.chat_empty_title), style = MaterialTheme.typography.titleMedium)
                            }
                        }
                        itemsIndexed(state.messages, key = { _, message -> "message-${message.id}" }) { index, message ->
                            val first = state.messages.getOrNull(index - 1)?.identityId != message.identityId
                            val last = state.messages.getOrNull(index + 1)?.identityId != message.identityId &&
                                !(message.identityId == state.identityId && index == state.messages.lastIndex && state.pending.isNotEmpty())
                            ChatMessageRow(message, message.identityId == state.identityId, first, last)
                        }
                        itemsIndexed(state.pending, key = { _, message -> "pending-${message.id}" }) { index, message ->
                            val first = index == 0 && state.messages.lastOrNull()?.identityId != state.identityId
                            Column(Modifier.fillMaxWidth().padding(top = if (first) 10.dp else 0.dp), horizontalAlignment = Alignment.End) {
                                if (first) Text(stringResource(Res.string.chat_you), style = MaterialTheme.typography.labelMedium)
                                ChatBubble(message.text, true)
                                if (message.state == ChatSendState.FAILED) {
                                    Text(chatError(message.error, sending = true), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.error, modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite })
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(stringResource(Res.string.chat_not_sent), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.error)
                                        TextButton(onClick = { onAction(RoomAction.ChatRetry(message.id)) }) { Text(stringResource(Res.string.chat_retry)) }
                                        TextButton(onClick = { onAction(RoomAction.ChatDiscard(message.id)) }) { Text(stringResource(Res.string.chat_discard)) }
                                    }
                                } else Text(stringResource(Res.string.chat_sending), style = MaterialTheme.typography.labelSmall)
                            }
                        }
                    }
                    if (!state.atLatest && (state.messages.isNotEmpty() || state.pending.isNotEmpty())) {
                        FilledTonalButton(onClick = { onAction(RoomAction.ChatAtLatest(true)) }, modifier = Modifier.align(Alignment.BottomCenter).padding(8.dp)) {
                            Icon(WatchPartyIcons.ArrowDownward, null, Modifier.size(16.dp)); Spacer(Modifier.width(6.dp)); Text(stringResource(Res.string.chat_latest))
                        }
                    }
                }
                if (state.error != null) {
                    Column(Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.errorContainer).padding(12.dp)) {
                        Text(chatError(state.error), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onErrorContainer)
                        TextButton(onClick = { onAction(RoomAction.ChatRefresh) }, enabled = !state.loadingMore) { Text(stringResource(Res.string.chat_retry)) }
                    }
                }
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                Column(Modifier.padding(horizontal = 16.dp, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Surface(
                        shape = WatchPartyDesignSystem.shapes.largeIncreased,
                        color = MaterialTheme.colorScheme.surfaceContainerLow,
                        border = BorderStroke(if (composerFocused) 2.dp else 1.dp,
                            if (composerFocused) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant),
                    ) {
                        Column(Modifier.padding(start = 8.dp, top = 12.dp, end = 8.dp, bottom = 8.dp)) {
                            val inputLabel = stringResource(Res.string.chat_message_label)
                            BasicTextField(
                                value = field,
                                onValueChange = { value -> if (value.text.length <= 500) { field = value; onAction(RoomAction.ChatDraftChanged(value.text)) } },
                                modifier = Modifier.fillMaxWidth().padding(horizontal = 6.dp).heightIn(min = 42.dp)
                                    .semantics { contentDescription = inputLabel }
                                    .onFocusChanged { composerFocused = it.isFocused }
                                    .onPreviewKeyEvent { event ->
                                        if (event.key == Key.Enter && event.type == KeyEventType.KeyDown && event.isCtrlPressed && !event.isShiftPressed && field.composition == null) {
                                            if (canSend) onAction(RoomAction.ChatSend)
                                            true
                                        } else false
                                    },
                                minLines = 2, maxLines = 4,
                                textStyle = MaterialTheme.typography.bodyMedium.copy(color = MaterialTheme.colorScheme.onSurface, textDirection = TextDirection.Content),
                                cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
                                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                                keyboardActions = KeyboardActions(onSend = { if (canSend && field.composition == null) onAction(RoomAction.ChatSend) }),
                                decorationBox = { editor ->
                                    Box {
                                        if (field.text.isEmpty()) Text(stringResource(Res.string.chat_placeholder),
                                            style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        editor()
                                    }
                                },
                            )
                            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                                Box {
                                    IconButton(onClick = { emojis = !emojis }) { Icon(WatchPartyIcons.SentimentSatisfiedAlt, stringResource(Res.string.chat_emoji)) }
                                    DropdownMenu(expanded = emojis, onDismissRequest = { emojis = false }, shape = MaterialTheme.shapes.extraLarge) {
                                        FlowRow(Modifier.widthIn(max = 280.dp).padding(horizontal = 8.dp), horizontalArrangement = Arrangement.Center) {
                                            listOf("🍿", "😂", "❤️", "✨", "😮").forEach { emoji ->
                                                TextButton(modifier = Modifier.sizeIn(minWidth = 48.dp, minHeight = 48.dp), onClick = {
                                                    val updated = field.text.replaceRange(field.selection.min, field.selection.max, emoji)
                                                    if (updated.length <= 500) {
                                                        field = TextFieldValue(updated, TextRange(field.selection.min + emoji.length))
                                                        onAction(RoomAction.ChatDraftChanged(updated))
                                                    }
                                                    emojis = false
                                                }) { Text(emoji) }
                                            }
                                        }
                                    }
                                }
                                Spacer(Modifier.weight(1f))
                                if (state.draft.length > 400) Text("${state.draft.length}/500", style = MaterialTheme.typography.labelSmall)
                                FilledIconButton(onClick = { if (canSend) onAction(RoomAction.ChatSend) }, enabled = canSend) {
                                    Icon(WatchPartyIcons.Send, stringResource(Res.string.chat_send))
                                }
                            }
                        }
                    }
                    if (state.pending.size >= 20 || desktopInput) Text(
                        stringResource(if (state.pending.size >= 20) Res.string.chat_pending_limit else Res.string.chat_hint),
                        modifier = Modifier.fillMaxWidth(), textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

}

@Composable
private fun ChatMessageRow(message: ChatMessage, self: Boolean, first: Boolean, last: Boolean) {
    Row(Modifier.fillMaxWidth().padding(top = if (first) 10.dp else 0.dp), horizontalArrangement = if (self) Arrangement.End else Arrangement.Start) {
        if (!self && first) {
            val avatar = when (message.avatar.uppercase()) {
                "MINT" -> Res.drawable.avatar_mint; "SUNNY" -> Res.drawable.avatar_sunny; "BERRY" -> Res.drawable.avatar_berry
                "CLOUD" -> Res.drawable.avatar_cloud; "EMBER" -> Res.drawable.avatar_ember; "NOVA" -> Res.drawable.avatar_nova
                "ORBIT" -> Res.drawable.avatar_orbit; "PRISM" -> Res.drawable.avatar_prism; "ECHO" -> Res.drawable.avatar_echo
                "SPARK" -> Res.drawable.avatar_spark; "BLOOM" -> Res.drawable.avatar_bloom; else -> Res.drawable.avatar_comet
            }
            Image(painterResource(avatar), message.displayName, Modifier.size(30.dp).clip(CircleShape), contentScale = ContentScale.Crop)
            Spacer(Modifier.width(10.dp))
        } else Spacer(Modifier.width(if (self) 30.dp else 40.dp))
        Column(Modifier.weight(1f), horizontalAlignment = if (self) Alignment.End else Alignment.Start, verticalArrangement = Arrangement.spacedBy(4.dp)) {
            if (first) Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(if (self) stringResource(Res.string.chat_you) else message.displayName, style = MaterialTheme.typography.labelMedium)
                val localTime = remember(message.createdAt) { loggedRunCatching("RoomChatPanel.run1") {
                    val value = kotlin.time.Instant.parse(message.createdAt).toLocalDateTime(TimeZone.currentSystemDefault())
                    "${value.hour.toString().padStart(2, '0')}:${value.minute.toString().padStart(2, '0')}"
                }.getOrDefault("") }
                Text(localTime, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            ChatBubble(message.text, self)
            if (self && last) Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Icon(WatchPartyIcons.Check, null, Modifier.size(13.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                Text(stringResource(Res.string.chat_sent), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun ChatBubble(text: String, self: Boolean) {
    Surface(shape = if (self) RoundedCornerShape(18.dp, 4.dp, 18.dp, 18.dp) else RoundedCornerShape(4.dp, 18.dp, 18.dp, 18.dp),
        color = if (self) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceContainer,
        contentColor = if (self) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface) {
        SelectionContainer { Text(text, Modifier.padding(horizontal = 14.dp, vertical = 10.dp), style = MaterialTheme.typography.bodyMedium.copy(textDirection = TextDirection.Content)) }
    }
}

@Composable
private fun chatError(code: String?, sending: Boolean = false): String = stringResource(when (code) {
    "INVALID_CHAT_MESSAGE" -> Res.string.chat_invalid
    "CHAT_MESSAGE_CONFLICT" -> Res.string.chat_conflict
    "RATE_LIMITED" -> Res.string.chat_rate_limited
    "NETWORK", "CHAT_SEND_TIMEOUT" -> if (sending) Res.string.chat_send_timeout else Res.string.chat_failed
    else -> Res.string.chat_failed
})
