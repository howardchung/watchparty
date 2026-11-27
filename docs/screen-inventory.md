# Screen Inventory

## Screens

| Screen name | Purpose | User actions | Required information | Relevant states | Supporting requirement IDs |
| --- | --- | --- | --- | --- | --- |
| Home | Provide the app entry point and route users to settings or party manager. | Open settings; open party manager. | App identity, settings entry, party manager entry. | Initial, selected/pressed navigation actions, large text responsive layout. | REQ-003, REQ-004, REQ-005, REQ-008, REQ-030; ASM-003 |
| Settings | Let users configure language, display name, and personal avatar. | Choose language; enter/edit name; select fun illustrated cartoonic avatar; save or return. | Current language, name value, avatar list, selected avatar. | Initial, populated, empty name, selected avatar, disabled save, error validation if needed. | REQ-005, REQ-006, REQ-007, REQ-023, REQ-041; ASM-012 |
| Party Manager | Let users create a party or find an existing party by ID. | Create party; enter party ID; load room preview; retry after simple error. | Create action, party ID field, preview action, simple error message. | Initial, empty, loading preview, simple error, disabled preview, pressed create/preview. | REQ-008, REQ-009, REQ-010, REQ-033, REQ-036, REQ-043; ASM-012 |
| Pre-join Room Preview | Let invitees verify a room before entering. | Review room details; confirm join; cancel or return. | Party title, owner present/absent status, participant count, stream status, party code, join action. | Loading preview, available, owner absent, stream active, waiting for stream, full, ended/unavailable, join loading, disabled join. | REQ-010, REQ-023, REQ-033, REQ-036, REQ-042, REQ-043; ASM-012 |
| Party Screen: Owner Pre-stream | Let the owner start playback from a direct video URL. | Paste URL; type URL; start stream; inspect party members; use voice controls; leave. | URL input, paste affordance, start action, participant avatars, owner role, leave affordance. | Empty/pre-stream, focused input, invalid URL, disabled start, loading start, voice active, leave confirmation. | REQ-011, REQ-012, REQ-015, REQ-023, REQ-024, REQ-034, REQ-037; ASM-014, ASM-016 |
| Party Screen: Non-owner Pre-stream | Let non-owners wait for the owner while retaining party presence. | View party members; use voice controls; leave. | Waiting state, participant avatars, voice status, owner indication if shown. | Empty/waiting, voice active, disabled URL start controls, leave confirmation. | REQ-011, REQ-015, REQ-023, REQ-024, REQ-034, REQ-037; ASM-005, ASM-016 |
| Party Screen: Active Player | Let users watch, control local playback, talk, and sync intentionally. | Play/pause; forward/backward; adjust volume; press Sync; speak/mute; inspect participants; leave. | Custom video player, local controls, Sync button, participant avatars, speaking indicators, current URL access rules. | Playing, paused, buffering/loading, active control press, disabled unavailable controls, voice speaking, error, leave confirmation. | REQ-013, REQ-017, REQ-018, REQ-020, REQ-021, REQ-022, REQ-023, REQ-024, REQ-025, REQ-026, REQ-027, REQ-028, REQ-038, REQ-039; ASM-012, ASM-016 |
| Party Screen: Non-owner URL Inspect | Let non-owners see, copy, or inspect the current URL without replacing it. | Open URL details; copy URL; close details. | Current direct video URL, copy action, read-only status. | Open details, copied feedback, disabled edit/start, error if copy unavailable. | REQ-032; ASM-012 |
| Invite and Share Surface | Let any current member invite others without leaving the party. | Copy party code; copy mock invite link; dismiss; retry copy after an error. | Party title, party code, mock invite link, copy/share feedback. | Closed, open, copied code, copied link, copy unavailable, pressed/active. | REQ-042; ASM-012 |
| Party Screen: Owner Absent | Keep the room usable without transferring owner permissions. | Continue local playback; use Sync and voice; inspect/copy the current URL; invite others; leave; wait for owner return. | Persistent owner-absent status, current player or waiting state, disabled/absent shared-stream controls, participant presence. | Owner just left, owner absent with active stream, owner absent without a stream, owner returned. | REQ-015, REQ-016, REQ-017, REQ-018, REQ-032, REQ-042, REQ-044; ASM-012 |
| Stream Abort Confirmation | Let the owner confirm a global abort action. | Confirm abort; cancel. | Warning that abort affects everyone and differs from local pause. | Open dialog/sheet, destructive confirm pressed, cancel pressed, loading abort. | REQ-016, REQ-035; ASM-009 |
| Post-abort Party State | Represent the room after the owner aborts the stream. | Owner starts another URL; participants wait; users leave. | Aborted message or empty player state, owner URL action if applicable, participants. | Aborted, empty, owner-ready, non-owner waiting. | REQ-016, REQ-035; ASM-009 |
| Leave Confirmation | Prevent accidental exit from a party. | Confirm leave; cancel. | Confirmation text, leave action, cancel action. | Open dialog/sheet, confirm pressed, cancel pressed, loading leave if represented. | REQ-034, REQ-037 |

## Cross-screen Requirements

- All screens should use a cross-platform mobile-focused structure and Material Design 3 Expressive visual direction. Supported by REQ-001, REQ-029.
- Screens should support light theme, dark theme, large text, and responsive layouts. Supported by REQ-030.
- Current designs should be English-only and do not need RTL examples now, while future RTL status remains uncertain. Supported by REQ-041 and temporary decision based on ASM-015.
- Custom video controls should follow Material Design 3 Expressive rather than default browser/platform controls. Supported by REQ-039.
- Party text chat is an embedded side panel on expanded screens and appears below player/sync controls on compact screens. It includes loading/empty/populated, send/retry, offline draft, history recovery, collapse/unread and latest-message states. Supported by REQ-024, REQ-040; DD-052.
- Visible playback drift views are not included because local playback differences should not be visible. Supported by REQ-038.

## Not Included as Screens in the Current Phase

- Authentication, account management, production room administration, backend monitoring, and database management are not included. Supported by REQ-031.
- Production media compatibility tools are not included; direct video URL validation is represented visually only. Supported by REQ-002 and temporary decision based on ASM-014.
