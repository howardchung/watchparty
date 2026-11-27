# Product Brief

## Primary User

The primary user is a mobile user who wants to join a shared watch party, identify themselves with a simple name and illustrated avatar, and watch a direct video URL while staying socially present through voice chat. Supported by REQ-001, REQ-002, REQ-007, REQ-023, REQ-024.

Two role variants matter for the product experience: the room owner, who can start and abort streams, and non-owner participants, who can watch, inspect/copy the current URL, use local playback controls, voice chat, and sync when desired. Supported by REQ-015, REQ-016, REQ-017, REQ-018, REQ-032, REQ-035.

## User Problem

Users need a lightweight way to create or join a party, watch the same direct video URL, and communicate without forcing every participant's playback controls to affect everyone else. Supported by REQ-009, REQ-010, REQ-014, REQ-017, REQ-018, REQ-024.

Users also need a clear way to recover from local playback drift without showing visible ahead/behind differences or making synchronization automatic. Supported by REQ-020, REQ-021, REQ-022, REQ-038.

## Product Value

The product combines shared room presence with local playback control: users can watch together, speak together, and still pause, play, seek, or change volume independently. Supported by REQ-014, REQ-017, REQ-018, REQ-023, REQ-024, REQ-026, REQ-027, REQ-028.

The room owner provides structure for the shared stream by controlling URL start and global abort, while participants retain individual playback freedom. Supported by REQ-015, REQ-016, REQ-018, REQ-035.

The design value is a cross-platform mobile-focused experience using Material Design 3 Expressive, with custom player controls and accessible responsive states. Supported by REQ-001, REQ-029, REQ-030, REQ-039.

## Primary Journey

The primary journey is: user lands on home, configures identity if needed, creates a party or opens an invite/enters a party code, previews the room, confirms joining, reaches the party screen, watches a direct video URL, joins voice presence, uses local controls, and optionally syncs to the leading participant. Supported by REQ-004, REQ-005, REQ-007, REQ-008, REQ-009, REQ-010, REQ-011, REQ-013, REQ-020, REQ-021, REQ-022, REQ-024, REQ-042, REQ-043.

The owner version of the primary journey includes pasting or typing a direct video URL, starting playback, and optionally aborting the stream for everyone. Supported by REQ-012, REQ-015, REQ-016, REQ-035.

The non-owner version of the primary journey includes viewing, copying, or inspecting the current URL without being able to start a different URL. Supported by REQ-032.

## Secondary Journeys

- Set or update language, name, and personal avatar from settings. Supported by REQ-005, REQ-006, REQ-007.
- Join a party by ID and recover from a simple join error. Supported by REQ-010, REQ-033, REQ-036.
- Invite others by copying the party code or a mock invite link, and preview room details before confirming entry. Supported by REQ-042, REQ-043.
- Leave a party through a visible leave affordance and confirmation prompt. Supported by REQ-034, REQ-037.
- Continue watching in an ownerless room after the owner leaves; wait for the same owner to return before the shared video can be started, replaced, or aborted. Supported by REQ-044.
- Use voice chat and show speaking activity on participant avatars. Supported by REQ-023, REQ-024, REQ-025, ASM-016.
- Use local video controls for play/pause, forward/backward, and volume. Supported by REQ-017, REQ-026, REQ-027, REQ-028, REQ-039.

## Product Personality

The product should feel social, playful, and clear: playful through fun illustrated cartoonic avatars, clear through role-specific controls, and social through participant presence and voice indicators. Supported by REQ-007, REQ-015, REQ-023, REQ-024, REQ-025.

The visual language should be expressive but not chaotic: Material Design 3 Expressive should guide custom controls, motion, hierarchy, rounded shapes, tonal surfaces, and adaptive mobile layouts. Supported by REQ-029, REQ-030, REQ-039.

The interface should make global actions feel materially different from local actions, especially owner abort versus personal pause. Supported by REQ-016, REQ-017, REQ-018, REQ-035.

## Scope

In scope for the current design phase: product experience documentation, screen structure, core user flows, invite/share and pre-join preview states, role-specific and owner-absent states, custom Material 3 Expressive playback controls, voice and text party communication (DD-052), settings, party creation/joining, simple errors, and leave confirmation. Supported by REQ-003, REQ-004, REQ-005, REQ-008, REQ-011, REQ-024, REQ-030, REQ-033, REQ-034, REQ-039, REQ-042, REQ-043, REQ-044, ASM-012.

The prototype direction can be represented as a mobile-first browser prototype while targeting a cross-platform mobile product direction. Temporary decision based on ASM-001 and supported by REQ-001.

The current design pass proceeds in English only while avoiding decisions that would block future RTL support. Supported by REQ-041 and temporary decision based on ASM-015.

## Non-goals

- Production backend services, databases, authentication, production networking, and real-time synchronization infrastructure are out of scope for this design phase. Supported by REQ-031.
- Production media compatibility and real direct-video validation logic are out of scope; validation can be represented visually. Supported by REQ-002 and temporary decision based on ASM-014.
- Plain text/emoji party chat is included under DD-052, superseding the earlier voice-only exclusion in REQ-024/REQ-040. Attachments, reactions, typing indicators and read receipts remain outside this iteration.
- Visible playback drift indicators are out of scope because local playback differences should not be shown. Supported by REQ-038.
- RTL design examples are out of scope for the current pass, though future RTL support remains unresolved against repository guidance. Supported by REQ-041 and temporary decision based on ASM-015.

## Known Uncertainties

- Production runtime remains unknown even though the design target is cross-platform mobile. Supported by REQ-001 and temporary decision based on ASM-001.
- Initial owner assignment is still inferred from party creation, but behavior after the owner leaves is defined: the room remains ownerless until that same owner returns. Supported by REQ-044 and remaining uncertainty from ASM-004.
- The exact post-abort stream state is undefined. Supported by REQ-016, REQ-035 and temporary decision based on ASM-009.
- Voice chat behavior beyond "voice only" is undefined, including mute model, permissions, and push-to-talk versus open mic. Supported by REQ-024, REQ-025 and temporary decision based on ASM-016.
- Party ID format, avatar catalog size, name validation, volume control form, seek interval, and direct video URL validation rules remain undefined. Supported by REQ-007, REQ-010, REQ-027, REQ-028 and temporary decision based on ASM-014.
