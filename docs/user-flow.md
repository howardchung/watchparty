# User Flow

## Primary Flow: Create or Join a Watch Party

| Flow element | Definition |
| --- | --- |
| Entry point | The user starts at the home page, which gives access to settings and party manager. Supported by REQ-004, REQ-005, REQ-008. |
| User goal | The user wants to create or join a party, watch a direct video URL with others, and participate through voice chat. Supported by REQ-001, REQ-002, REQ-009, REQ-010, REQ-024. |
| Success outcome | The user reaches the party screen, sees participant avatars, watches the video player, can use local playback controls, can speak in voice chat, and can join owner-led synchronization or privately catch up to the owner (DD-059). Supported by REQ-011, REQ-013, REQ-017, REQ-020, REQ-021, REQ-022, REQ-023, REQ-024. |

## Main Steps

1. Start on the home page and choose either settings or party manager. Supported by REQ-004, REQ-005, REQ-008 and temporary decision based on ASM-003.
2. If identity setup is needed, choose language, simple name, and personal avatar from fun illustrated cartoonic options. Supported by REQ-006, REQ-007.
3. Open party manager and choose to create a party or join by party ID, or open a mock invite link shared by a current member. Supported by REQ-008, REQ-009, REQ-010, REQ-042.
4. Before joining, review the party title, owner status, participant count, and stream status, then confirm entry or cancel. Supported by REQ-043.
5. After creating or confirming the join, move to the party screen. Supported by REQ-011, REQ-043.
6. If the user is the room owner, paste or type a direct video URL with emphasis on easy pasting, then start playback. Supported by REQ-012, REQ-015.
7. If the user is not the owner, view, copy, or inspect the current URL without edit/start permission. Supported by REQ-032.
8. Invite others at any time by copying the party code or mock invite link. Supported by REQ-042.
9. Once playback is active, use custom Material 3 Expressive playback controls for play/pause, forward/backward, and volume. Supported by REQ-017, REQ-026, REQ-027, REQ-028, REQ-039.
10. Use voice chat; when users speak, their avatar shows a speaking indicator. Supported by REQ-023, REQ-024, REQ-025.
11. Use role-specific Sync (DD-059): the owner pauses and invites others to a fixed timestamp; accepting viewers pause and may withdraw until the owner starts with the current accepted set. Committed players prepare, then count down and restart together, with bounded automatic recovery. Non-owners can privately catch up to the owner. Declined/unanswered/withdrawn viewers continue independently. Supported by REQ-020, REQ-021, REQ-022, REQ-038.
12. If the owner leaves, keep the room and current playback available but remove all owner-only stream actions until that same owner returns. Supported by REQ-044.
13. Leave the party through a visible leave affordance and confirmation prompt. Supported by REQ-034, REQ-037.

## Decisions

| Decision | Options | Flow effect |
| --- | --- | --- |
| Does the user need identity setup? | Go to settings, or continue to party manager. | Settings captures language, name, and avatar before or around party entry. Supported by REQ-005, REQ-006, REQ-007. |
| Does the user create or join? | Create party, or join by ID. | Creating implies room owner behavior; joining implies non-owner behavior until clarified. Supported by REQ-009, REQ-010 and temporary decisions based on ASM-004, ASM-005. |
| Does the invitee join after previewing? | Confirm join, or cancel and return. | Joining enters the room; canceling does not change membership. Supported by REQ-043. |
| Is the user room owner? | Owner, or non-owner. | Owner can start and abort stream; non-owner can inspect/copy URL but not start a stream. Supported by REQ-015, REQ-016, REQ-032, REQ-035. |
| Is a stream active? | Empty/pre-stream, loading, active player, aborted/error. | Determines whether URL entry, player controls, sync, and abort states are shown. Supported by REQ-012, REQ-013, REQ-016, REQ-020 and temporary decision based on ASM-012. |
| Does the user want to align playback? | Press Sync, or continue independently. | Sync is opt-in and does not require visible drift indicators. Supported by REQ-020, REQ-021, REQ-022, REQ-038. |
| Does the user leave? | Confirm leave, or cancel. | Confirmation prevents accidental exit. Supported by REQ-034, REQ-037. |
| Does the owner leave? | Confirm leave, or cancel. | On confirmation, the room remains active but ownerless; owner-only controls remain unavailable until the same owner rejoins. Supported by REQ-037, REQ-044. |

## Success Outcomes

- Owner successfully creates a party, starts a direct video URL, sees participants, and can globally abort the stream if needed. Supported by REQ-009, REQ-012, REQ-015, REQ-016, REQ-023, REQ-035.
- Participant successfully joins by ID, sees the shared URL/video, uses local playback controls, speaks in voice chat, and syncs only when desired. Supported by REQ-010, REQ-017, REQ-018, REQ-020, REQ-024, REQ-032, REQ-038.
- All users can leave through a confirmation flow. Supported by REQ-034, REQ-037.
- Current members can share a party code or mock invite link, and invitees can verify the room before joining. Supported by REQ-042, REQ-043.
- Participants can continue local playback in an ownerless room without gaining permission to change the shared video. Supported by REQ-044.

## Failure and Recovery Paths

| Failure path | Recovery |
| --- | --- |
| Party ID is invalid, expired, full, or unavailable. | Show a simple error and keep the user in party manager for retry. Supported by REQ-010, REQ-033, REQ-036. |
| Direct video URL cannot be accepted in the prototype. | Show a visual validation/error state without implementing production media compatibility logic. Supported by REQ-002 and temporary decision based on ASM-014. |
| Non-owner tries to start or replace the URL. | Prevent edit/start action while allowing URL view/copy/inspect. Supported by REQ-015, REQ-032. |
| Owner aborts stream. | Communicate that the stream was aborted for everyone and return to an appropriate post-abort party state. Supported by REQ-016, REQ-035 and temporary decision based on ASM-009. |
| User starts leaving accidentally. | Show confirmation and allow cancel. Supported by REQ-034, REQ-037. |
| Owner leaves while users remain. | Keep the room and current video available, show a persistent owner-absent state, and withhold start/replace/abort actions until the same owner returns. Supported by REQ-044. |
| Invite cannot be copied or the room preview is unavailable. | Keep the party code visible for manual sharing, or show the existing simple unavailable error and allow retry/cancel. Supported by REQ-033, REQ-036, REQ-042, REQ-043. |
| Voice chat needs permission or a control state. | Use a simple mute/unmute model until voice behavior is specified. Supported by REQ-024, REQ-025 and temporary decision based on ASM-016. |

## State Coverage

The design should represent initial, populated, loading, empty, error, disabled, selected, pressed/active, and offline states where relevant. Temporary decision based on ASM-012 and supported by REQ-030.
