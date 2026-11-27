# Assumptions

These are early design assumptions. Later accepted decisions and requirements take precedence: the current implementation uses native/browser clients, the Node/PostgreSQL backend, audio-only mesh voice, and backend-owned automatic guest sessions (DD-022, DD-023, DD-028). None of the historical uncertainty below authorizes reintroducing Firebase authentication.

## Active Assumptions

| ID | Assumption | Why it is needed | What changes if wrong |
| --- | --- | --- | --- |
| ASM-001 | The first prototype can still be represented as a mobile-first browser prototype using React, TypeScript, and Vite while targeting a cross-platform mobile design direction. | Repository guidance defines React, TypeScript, Vite, and mobile-first responsive layout, while stakeholder guidance now says cross-platform mobile focused on Material Design 3 Expressive. | If a native or non-web cross-platform runtime is required for the prototype, interaction patterns, navigation containers, video controls, and dependency choices may change. |
| ASM-003 | The home page has two primary paths: settings and party manager. | The source says users can either enter settings or party manager from home. | If one path is secondary or hidden, the home screen hierarchy and navigation emphasis would change. |
| ASM-004 | Creating a party makes the creator the room owner. | Owner-only controls require a way to assign ownership, and creation is the only ownership cue in the source. | If ownership is assigned differently, role labels, permissions, and party manager flow would change. |
| ASM-005 | Joining by ID makes the user a non-owner by default. | Owner-only URL and abort actions require non-owner states. | If joiners can become owners or co-owners, role-specific controls and permissions need additional states. |
| ASM-009 | The party remains active after the owner aborts a stream. | The source says the owner can start another URL "in that same room." The stakeholder confirmed abort is global but did not specify the exact post-abort screen state. | If abort ends the room, the flow would return users to party manager or home instead of an empty or aborted party screen. |
| ASM-012 | The prototype should include representative error, empty, loading, disabled, active, and selected states. | Repository completion criteria require relevant states to be represented. | If only a happy-path flow is desired, the design scope can be smaller but less useful for validation. |
| ASM-014 | Direct video URL validation is represented visually in `clients/web` but not implemented there as real media compatibility logic. | The browser client remains the interactive prototype and the stakeholder confirmed direct video URL as the design target. | If real playback validation is required in the web client, technical scope and dependencies would increase. |
| ASM-015 | The current design pass omits RTL examples, but reusable layout decisions should avoid blocking future RTL support. | Stakeholder said to proceed only with English designs, while repository guidance still asks for RTL support. | If RTL is permanently out of scope, less validation is needed; if RTL returns, mirrored layout and language states must be added. |
| ASM-016 | Voice chat uses a simple mute/unmute model until a specific voice-control model is defined. | The stakeholder confirmed voice chat only, but did not define open mic, push-to-talk, permission, or moderation behavior. | If push-to-talk or another model is required, party screen controls and speaking indicators may change materially. |

## Confirmed and Converted

These previous assumptions are no longer active assumptions because stakeholder answers converted them into confirmed requirements.

| ID | Status | Converted to | Note |
| --- | --- | --- | --- |
| ASM-002 | Confirmed | REQ-029 | Material Design 3 Expressive is confirmed as the design focus. |
| ASM-006 | Confirmed | REQ-017, REQ-018, REQ-035 | Playback controls are local except owner abort, which is global. |
| ASM-007 | Confirmed | REQ-020, REQ-021, REQ-038 | Sync is user-initiated and affects the clicking user's playback. |
| ASM-008 | Confirmed | REQ-022 | Sync target is the leading participant, currently furthest ahead. |
| ASM-010 | Confirmed | REQ-007, REQ-023 | "Logo" means personal avatar from a fun illustrated cartoonic avatar list. |
| ASM-011 | Confirmed | REQ-024, REQ-025, REQ-040 | Chatroom is voice-only; text chat should not be designed. |
| ASM-013 | Superseded | REQ-041 | Current designs should proceed only in English and do not need RTL examples now. |
| ASM-017 | Confirmed | REQ-042, REQ-043 | Parties support invite/share and a room preview before an invitee confirms joining. |
| ASM-018 | Confirmed | REQ-044 | The room remains ownerless after the owner leaves; permissions do not transfer and return only with the same owner. |

## Remaining Uncertainty

- Production runtime for the cross-platform mobile product remains undefined.
- Initial owner assignment remains inferred from party creation; behavior for an owner disconnect without an explicit leave remains undefined.
- Exact post-abort stream state remains undefined.
- Voice chat interaction model is undefined beyond "voice only."
- Direct video URL validation rules and supported formats remain undefined.
- Party ID format and exact error copy remain undefined.
- Avatar catalog size and name validation remain undefined.
