# Party text chat

Accepted with the side-by-side design on 2026-11-12 (DD-052). Applies to the browser and shared native Android/desktop clients. Chat is available to every active room member independently of voice membership, microphone permission, stream state and owner presence.

## Content and lifecycle

Plain text and emoji only; no HTML/Markdown rendering, link previews, attachments, edits, deletion, typing indicators, read receipts or notifications. Normalize CRLF to LF and trim leading/trailing whitespace before sending. The normalized text is 1–500 UTF-16 code units (the shared JavaScript/Kotlin string-length convention). Reject C0 control characters other than LF/tab, unpaired UTF-16 surrogates, and blank input. Sender identity/name/avatar and creation time are assigned by the server, never accepted from client input. Historical names/avatars are snapshots at send time.

All current members, including newcomers and rejoining members, can read the room history while it is open. Leaving/revocation ends access. Ending a stream or owner departure does not delete chat. Closing a room ends access immediately; messages and outbox payloads are deleted by the existing room tombstone purge (24 hours after room closure). No chat contents are written to application/session diagnostics. Local unsent drafts and pending sends remain in memory for the room screen lifetime; no background sending or persistence across app restart/reload.

## HTTP

Bearer authentication and active room membership are mandatory. Responses use `Cache-Control: no-store`.

`POST /v1/rooms/{roomId}/chat/messages`

Request: `{ "messageId": "client-generated UUID", "text": "Hello 🍿" }`.
Response: `201 { "message": ChatMessage }`, including unchanged retries. Generate a fresh UUID per deliberate send and retain it with the original normalized text for automatic and explicit retries. The `(roomId,messageId)` key is durable for the room lifetime. Replaying identical text from the same identity returns the original message, even after a profile change; changing text or sender returns `409 CHAT_MESSAGE_CONFLICT`. Authorization is checked before replay. The message, room sequence increment and `chat.message` outbox event commit atomically. Success means durable backend acceptance, not that anyone has read it.

Each identity may create at most 10 new messages in a sliding 10-second window in a room. Replays do not consume the chat budget. `429 RATE_LIMITED` requires waiting before explicit retry; existing general HTTP limits also apply. Invalid input: `400 INVALID_CHAT_MESSAGE`. Usual auth/membership/ended/not-found/service errors apply.

`GET /v1/rooms/{roomId}/chat/messages?before={sequence}`

Returns `{ "messages": [ChatMessage], "hasMore": false }`. Maximum 50 messages, ordered by ascending room event sequence. Without `before`, returns the latest 50. `before` is an exclusive positive safe-integer cursor; invalid cursors return `400 INVALID_CHAT_CURSOR`. Fetch earlier pages using the first displayed message's sequence. New incoming messages cannot shift a cursor page.

ChatMessage: `{ "id": "UUID", "roomId": "UUID", "identityId": "UUID", "membershipId": "UUID", "displayName": "Nika", "avatar": "comet", "text": "Hello 🍿", "createdAt": "ISO-8601 UTC", "sequence": 12 }`.

## Realtime and recovery

HTTP and Socket.IO room snapshots include `chat: { messages: [latest 50 ChatMessage], hasMore: boolean }` under the same room lock as the authoritative snapshot sequence. The existing authenticated room namespace emits topic `chat.message` with payload `{ message: ChatMessage }`; the envelope's sequence equals the message sequence. There is no separate chat socket, voice data channel or protocol-version bump: this is an additive event/snapshot contract. Older clients ignore the new topic while advancing sequence.

Clients deduplicate by message ID, sort by sequence, and reconcile optimistic sends against either the HTTP response or their room event. Sequence gaps trigger the existing fresh-snapshot recovery. A reconnect snapshot replaces the displayed remote window with the latest 50; earlier history remains retrievable, so messages missed during a long outage cannot create a silently merged gap. Explicit history requests are ignored if their snapshot/cursor became stale. Clients bound a visible conversation to 500 messages and up to 20 pending sends; older remote messages remain on the server and are reachable after refreshing the room history window. This is a memory bound, not retention truncation.

## Presentation

The selected side-by-side panel sits beside the player at expanded widths and below the player/sync controls at compact widths. Participant presence and voice controls remain available. Use original message text/direction, localized application labels, semantic Material colors, keyboard access, visible focus and safe-area/IME handling. The panel supports populated, loading, empty, failed-send/retry, history-error/retry, queued offline sends, disabled-send, collapsed/unread and latest-message states. Ctrl + Enter sends on hardware keyboards; Enter and Shift+Enter insert a line break. Emoji insertion is optional convenience, not a separate message type. There is no persistent offline banner. Sending remains available while disconnected: show each submitted message as sending, retain its ID/text, and retry after the room connection recovers. Each deliberate send or manual retry has a 30-second total deadline including waiting, HTTP requests and automatic retries. Network failures retry with a one-second minimum backoff while connected; terminal service/auth/validation/rate-limit errors fail immediately. At the deadline show a message-specific error with Retry/Discard; no further automatic attempts occur until manual Retry starts a fresh deadline with the same ID/text. Reconcile snapshot/event/HTTP acceptance by ID to avoid duplicates. Pending messages are in memory only and sending stops when the room screen is disposed. Reaching the 500-message view limit offers a return to the latest window.

Consecutive displayed messages from the same stable sender identity form a visual group: show the avatar and name/“You” with the first message's time only above its first bubble, and show “Sent” only beneath its last confirmed bubble. A different sender starts a new group even when names or avatars match. Do not split groups by elapsed time. Pending outgoing messages continue the current self group; keep individual sending/failure feedback and retry/discard controls, and suppress the preceding “Sent” while that group ends in a pending message. History loading and realtime reconciliation recompute group boundaries from the displayed order.
