A watch party mobile app where users can stream from a direct URL.


The app has several sections:

In home page, users can either:
1. Enter setting, where they can choose English or Persian (فارسی), an avatar, and their own display name. Saving the profile applies and remembers the language; Persian uses right-to-left layout in both browser and Android. Video links, room codes, other users’ saved names, and subtitle content retain their original values. The pencil beside the profile name opens its editor. Settings also offers the 24 named color seeds listed in docs/theme-palettes.md; selecting one immediately applies its full light/dark Material palette and remembers it on the current device. The avatar picker uses the selected “In the spotlight” design: larger character previews, with the selected character enlarged in a prominent tile spanning two columns. Use Color garden for theme colors and a focused, searchable language picker that opens as a compact sheet or expanded dialog. Include only English and Persian in the language list; support future expansion without exposing untranslated language fixtures. Confirming a language in the picker updates the Settings draft; saving the profile applies it.
2. A party manager page, where they can either create or join a party (via ID)

after they join or create a party, we have the party screen.

In party screen:
1. There is an input field where the URL must be pasted and then played.
2. The URL then becomes a video player

Inside that screen users can see their own icon and other users in party.

Syncronization rules:
1. Only the room owner can past URLs to start streaming.
2. Only room owner can fully abort the stream for everyone and start with another URL in that same room.
2. When a stream is started, everyone can pause, play, forward/backward for themselves. This does not
effect the streaming process for others (streaming is done on device for each client.)
3. Sync has role-specific behavior. A non-owner privately catches up to the owner's playback position without interrupting anyone else; this may move the requester forward or backward.
4. For a manually requested sync, opening the owner's Sync together dialog shows a live Meet at timestamp and Ask for sync, without a participant list or pausing playback. Only pressing Ask for sync sends the group request. When the owner sends that request, the owner's playback pauses and that position becomes the fixed invitation target. Other viewers continue normally until they accept. The invitation identifies the owner and target timestamp.
5. Accepting pauses that viewer's playback. Until the owner starts synchronization, viewers can withdraw acceptance and resume local playback; the owner sees live pending, accepted, declined, and withdrawn responses and can cancel the invitation. Declined and unanswered viewers remain unaffected.
6. The owner may start once at least one other viewer has accepted, without requiring everyone to accept. The Start button counts accepted viewers only, excluding the owner, and is disabled when that count is zero. Starting atomically locks the currently accepted participant list, including the owner, and ends manual cancellation/withdrawal for that attempt. Late responses do not add participants to the committed attempt.
7. Included players seek to the fixed target, buffer, and report readiness. When all remaining included players are ready, show a countdown over their playback screens using the app's theme and font: 3, 2, 1, Action, followed by coordinated playback. Declined, unanswered, and withdrawn viewers keep their normal local playback throughout.
8. Committed preparation has a finite deadline and automatic failure recovery. Disconnected or failed players must not block the room indefinitely: explain their exclusion and continue with ready participants when coordination remains possible, or automatically end the attempt with an explanation and recovery path. Manual cancellation being unavailable must never prevent automatic recovery.
9. Starting a new shared stream automatically includes the owner and all currently connected room viewers, seeks to the beginning, prepares, and runs the shared 3, 2, 1, Action countdown without asking for acceptance or Start. When the owner is alone, skip group preparation and countdown and use normal playback. Existing readiness deadlines and failure recovery still apply.
10. Joining an active party automatically catches up only the joining viewer to the owner’s current timestamp and playing/paused state once their player is ready. If a committed group start already includes them, that start takes precedence. Missing owner telemetry is retried for a bounded period with manual Sync available for recovery; other participants are never interrupted.
Other notes:
1. Users are able to speak in the chatroom and when they do so there should be an indicator on their icon.
2. Video playback has play/pause forware/backward and volume set capabilities.

Confirmed additions:
1. Party members can invite others by copying the party ID or sharing an invite link. Android provides a Share button in the Invite friends dialog that opens the Android share sheet with the invite link.
2. Before joining, users see a room preview with the party title, owner status, participant count, and current stream status, then confirm or cancel joining.
3. If the room owner leaves, the room stays active without an owner. Remaining users keep their local playback controls but cannot start, replace, or abort the shared video. Ownership does not transfer; owner controls return only when the same owner rejoins.
4. Android viewers can select soft subtitle tracks provided by a video URL or choose a local subtitle file for their own playback. Hardcoded subtitles remain part of the video image. Subtitle selection is local to each viewer and does not change other participants’ playback.
5. Android viewers can switch between audio tracks provided by a video URL, or restore automatic track selection. Audio-track selection is local to each viewer and does not change other participants’ playback.
6. Browser viewers can select supported embedded text subtitles and audio tracks when the source permits direct browser access and the browser supports its codecs. Integrated playback should share media reads rather than separately download video data to extract subtitles. Unsupported sources retain local subtitle-file selection and a browser-playback recovery option. Selection stays local to each viewer. Browser playback automatically tries a compatible fallback when its preferred player fails or cannot start, retaining local playback settings where supported and offering Retry if recovery fails.

Confirmed guest identity requirements (2026-10-23):
1. Users receive an automatic durable guest identity from our own backend, without registration or login screens. All authentication, credential refresh, verification, and revocation are owned by our backend; neither client requires Firebase or Google authentication services.
2. A saved guest identity restores the same profile and room ownership after refresh or restart. Temporary connection or service failures retain the saved identity and offer retry; they must not create a replacement guest. Permanently unusable credentials have an explicit, confirmed identity-reset recovery action.
3. New profiles start with their localized avatar character name. Users can choose their own name and retain it when changing avatar or language. Names may repeat, including within one room. Stable internal IDs distinguish users and preserve ownership. Existing profiles adopt their avatar’s name without resetting identity; historical chat messages retain their original snapshots.
4. The Firebase-removal release starts with fresh backend guest identities. Existing identities and room ownership are not migrated; local non-secret preferences remain.

Confirmed last-room shortcut (2026-11-11):
1. Home shows a Last room card for every viewer, whether they created the room or joined as a guest. Remember the most recently successfully joined or created room for the current guest identity on that device/browser, including across app restarts or browser sessions.
2. Returning opens the existing room preview and normal join flow without retyping the code. The backend determines availability and restores the original owner's permissions; the shortcut does not bypass admission rules.
3. Keep the shortcut after leaving a room that remains open. Hide it when no room has been saved or the saved room is confirmed ended/unavailable. Temporary network/service failures retain it and offer retry through the normal preview flow.

Confirmed Android voice routing (2026-11-11):
1. Voice uses the loudspeaker by default from joining voice, including before movie playback. Prefer connected headphones or a Bluetooth communication device when available, and respond to device connection/removal.
2. Starting or pausing a movie preserves the voice output choice. Voice and movie play concurrently with separate call and media volume controls. Release voice routing settings when the voice session ends.

Confirmed room bug reports (2026-11-11):
1. Both clients show a bug icon button beside Share/Invite in the room top app bar. It opens a simple dialog with one large description input and Send. As confirmed on 2026-11-13, also show the bug icon in the home page controls when outside a party; home reports have no room association.
2. Sending includes the description, available device/browser information, and the saved application log from this app session's startup through submission. Reports go to our backend; show success only after durable acceptance and retain the draft on failure for retry.
3. As confirmed on 2026-11-12, omit the diagnostic storage and Sentry delivery notice from both clients' report dialogs in English and Persian.
4. Android and web bug reports support optional screenshot selection and clipboard paste, preview and removal. Keep selected screenshots with the draft on failure and send them with the report to private storage and Sentry. Never capture screenshots automatically.

Confirmed speaking-indicator semantics (2026-11-11):
1. Browser and Android self-profile highlights show local microphone activity while voice is joined and the microphone is authorized and unmuted, including when alone in voice. They do not certify remote delivery or audibility.
2. Silence releases the highlight after a short hold; mute, capture suspension, and leaving clear it immediately. Microphone samples used for the indicator are transient and are not stored or uploaded.


Confirmed Android launcher icon foundation (2026-11-11):
1. Use the approved Shared Screen app icon, with bundled variants for all 24 named theme seed colors. Each background uses the exact supplied seed color with a contrasting foreground.
2. Android launcher icon color follows the selected named theme, including restoration at app launch. The app default theme uses Shared Screen in Basil, matching the approved concept. Light/dark mode does not change the chosen icon color. Keep the saved theme if switching fails and offer Retry.

Confirmed product naming (2026-11-26):
1. Use the official name watchparty in all languages, including application text, browser metadata, launcher labels, and desktop display names.
2. The Persian home headline is «با هم ببینید». The English headline remains “Stream and chill”.


Confirmed application typography (2026-11-12):
1. Use Pofak as the application typeface in both the browser and Android clients, including English and Persian. Bundle the fonts with each client; users must not need to install them or access a third-party font service. Preserve text scaling, RTL support, and the existing typography hierarchy.

Confirmed observability (2026-11-12):
1. Use PostHog EU for visitor/product analytics and Sentry for application errors and manual bug reports across browser, native clients and backend.
2. Preserve backend-owned durable report submission and retry behavior; forward new reports and redacted diagnostics to Sentry asynchronously without making user acknowledgement depend on that service.
3. Keep session replay and automatic content capture disabled. Exclude chat contents, media and invitation URLs, credentials, microphone audio and screenshots from usage analytics and automatic error capture.
4. Automatic failures retain application source coordinates, known error classifications and a bounded history of application-defined operations. Exclude raw exception messages, arbitrary console arguments, resource paths, user identifiers and payloads from generated diagnostics. Use coarse platform and browser information. Explicit reports may include the reporter’s description, including web links they intentionally paste, and selected screenshots.

Confirmed consecutive chat messages (2026-11-12):
1. Consecutive messages from the same person appear as separate, closely spaced bubbles with the sender name/“You” and time only above the first bubble, and “Sent” only after the last bubble. Changing sender begins a new group.

Confirmed product voice and information (2026-11-12):
1. Use short, friendly, casual English and Persian throughout all clients, including future UI copy.
2. Omit overly informative or redundant helper sentences, captions and cards when the interface already communicates the meaning. Do not reintroduce explanations the stakeholder removed.
3. Retain concise action consequences and recovery guidance when needed to make a meaningful decision. Prefer clear action labels and brief, recipient-specific feedback over explanatory paragraphs. See `docs/design-principles.md` and DD-067.

Confirmed party/chat refinements (2026-11-12):
1. Automatic Persian party titles use «دورهمی {name}». Preserve explicit custom titles.
2. Empty chat uses a chat icon and a short heading, without the extra conversation-starting helper sentence in either language.
3. Keep the party invitation/share action in the top bar and omit its duplicate below voice chat.

Confirmed local video files — design preview requested (2026-11-13):
1. The owner may choose a local video file and ask room members to choose their own copy, following the owner-requested mutual-sync flow. Share the owner's file name so members know what to select; do not upload the video.
2. Do not enforce that members selected the same file. Different videos are allowed, and synchronization must handle unavailable timestamps, unreadable media and preparation failures with a recovery path.
3. Members may decline file selection; they remain in the room without video. When other viewers are present, the owner sees who is ready and explicitly starts playback. An owner alone sees no readiness dialog and can use normal local playback. The exact start quorum and late-join behavior remain review questions in `docs/open-questions.md`.
4. The integrated browser design is approved: preserve the cinema background and equally prominent URL/file entry actions; Choose file opens the system picker directly. Owner Change opens the selected side-by-side Local file / Stream URL tiles. Implement across web, Android and desktop using device-only file access. Failed local-file group sync restores previous playback with a brief snackbar for everyone. URL starts retain automatic synchronization; local sources await selection and explicit owner Start.

Confirmed chat connection recovery (2026-11-13):
1. Do not show the persistent chat-offline/draft banner. Users can submit messages while disconnected; each message shows Sending while waiting for connectivity and retries automatically on recovery.
2. Bound each send/manual retry to 30 seconds, then show an individual error with Retry/Discard. Retain the original message ID/text across retries, deduplicate confirmed acceptance, and preserve newer composer drafts. Unsent messages stay in memory for the room screen lifetime only.
