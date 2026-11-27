# Requirements Analysis

Source: `docs/requirements.md`, plus stakeholder clarifications supplied after the first analysis pass.

Scope: design analysis for a Material 3 Expressive-informed prototype. This document extracts requirements without treating still-missing details as facts.

## Requirement Catalog

Existing requirement IDs are preserved. New confirmed requirements from stakeholder answers begin at REQ-032.

| ID | Requirement | Classification | Confidence | Dependencies | Conflicts / ambiguities | Design-only relevance |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-001 | The product is a cross-platform mobile-focused watch party app. | Product goal | Explicit | REQ-029 | The implementation platform is still not production-specified; current design target is cross-platform mobile. | Relevant |
| REQ-002 | Users can stream from a direct video URL. | Functional requirement | Explicit | REQ-013, REQ-014, REQ-021 | Supported direct video formats and validation rules are still unspecified. | Relevant for flow and input states; production media compatibility is not relevant to design-only phase. |
| REQ-003 | The app has several sections. | Navigation requirement | Explicit | REQ-004, REQ-008, REQ-011 | "Sections" could mean screens, tabs, routes, or grouped flows. | Relevant |
| REQ-004 | The home page is an entry point where users can access settings or party management. | Navigation requirement | Strongly implied | REQ-005, REQ-008 | The document says "In home page, users can either"; it does not specify whether both options are equal priority. | Relevant |
| REQ-005 | Users can enter settings from the home page. | Navigation requirement | Explicit | REQ-004, REQ-006, REQ-007 | The settings entry point label and placement are unspecified. | Relevant |
| REQ-006 | In settings, users can choose a language. | Functional requirement | Explicit | REQ-005, REQ-041 | Current design pass proceeds in English only; future language list remains unspecified. | Relevant |
| REQ-007 | In settings, users can choose a simple name and a personal avatar from a list of fun illustrated cartoonic avatars. | Functional requirement | Explicit | REQ-005, REQ-018, REQ-024 | Name validation and avatar catalog size remain unspecified. | Relevant |
| REQ-008 | Users can access a party manager page from the home page. | Navigation requirement | Explicit | REQ-004, REQ-009, REQ-010 | The relationship between party manager and home navigation is unspecified. | Relevant |
| REQ-009 | In party manager, users can create a party. | Functional requirement | Explicit | REQ-008, REQ-011, REQ-015 | Party creation fields are unspecified. Ownership is assumed from creation unless clarified otherwise. | Relevant |
| REQ-010 | In party manager, users can join a party via ID. | Functional requirement | Explicit | REQ-008, REQ-011, REQ-036 | Party ID format remains unspecified. | Relevant |
| REQ-011 | After a user joins or creates a party, the app shows the party screen. | Navigation requirement | Explicit | REQ-009, REQ-010, REQ-012, REQ-037 | Back navigation beyond confirmed leave flow is unspecified. | Relevant |
| REQ-012 | The party screen contains a URL input where the room owner can paste or type a direct video URL, with design emphasis on easy pasting. | Functional requirement | Explicit | REQ-011, REQ-013, REQ-015, REQ-032 | Exact paste affordance and validation behavior are unspecified. | Relevant |
| REQ-013 | The entered URL becomes a video player. | Functional requirement | Explicit | REQ-002, REQ-012, REQ-021, REQ-039 | This likely means the URL input area or state transforms into playback UI, but exact screen structure is unspecified. | Relevant |
| REQ-014 | Users stream/play the URL on their own devices. | Platform or technical constraint | Explicit | REQ-002, REQ-021 | This constrains backend expectations but does not fully define synchronization UX. | Partly relevant; implementation architecture is not relevant to design-only phase. |
| REQ-015 | Only the room owner can paste or type URLs to start streaming. | Business rule | Explicit | REQ-009, REQ-012, REQ-016, REQ-032 | Needs owner and non-owner screen states. Spelling in source says "past"; interpreted as "paste". | Relevant |
| REQ-016 | Only the room owner can fully abort the stream for everyone and start another URL in the same room. | Business rule | Explicit | REQ-015, REQ-021, REQ-035 | The aborted state still needs visual treatment, but the scope is confirmed as global, not local. | Relevant |
| REQ-017 | When a stream is started, every user can pause, play, forward, or backward for themselves. | Functional requirement | Explicit | REQ-013, REQ-014, REQ-021, REQ-039 | This is local playback control, not shared playback control. | Relevant |
| REQ-018 | Local playback controls do not affect playback for other users. | Business rule | Explicit | REQ-014, REQ-017, REQ-022, REQ-035 | Needs careful distinction from owner abort and opt-in synchronization behavior. | Relevant |
| REQ-019 | Streaming is done on device for each client. | Platform or technical constraint | Explicit | REQ-014, REQ-018 | Production streaming implementation is outside the design prototype scope. | Not relevant to current design-only phase except for UX copy/states. |
| REQ-020 | The party screen has a synchronization button. | Functional requirement | Explicit | REQ-011, REQ-022, REQ-038 | Button placement, availability, disabled states, and labels are unspecified. | Relevant |
| REQ-021 | Owner Sync invites viewers to a coordinated restart; non-owner Sync privately catches up to the owner. | Functional requirement | Explicit, DD-059 | REQ-020, REQ-022, REQ-038 | Owner pauses on request; viewers pause only on acceptance and can withdraw until commitment. Owner can cancel before commitment or start with the currently accepted subset. | Relevant |
| REQ-022 | Group sync uses the owner's fixed invitation timestamp and locks the accepted participant set at commitment. Private sync targets the owner's current playback. | Business rule | Explicit, DD-059 | REQ-020, REQ-021, REQ-038 | Seeking may move backward. Committed preparation requires readiness, countdown, and bounded automatic failure recovery; declined/unanswered/withdrawn viewers remain unaffected. | Relevant |
| REQ-023 | Users can see their own avatar/icon and other users in the party screen. | Content requirement | Explicit | REQ-007, REQ-011, REQ-024 | Member overflow and party size remain unspecified. | Relevant |
| REQ-024 | Party members can use voice and independent room text/emoji chat. | Functional requirement | Explicit, updated 2026-11-12 | REQ-011, REQ-025, REQ-040 | Voice follows DD-031; text follows DD-052 and chat-contract.md. | Relevant |
| REQ-025 | When users speak in voice chat, an indicator appears on their avatar/icon. | Visual requirement | Explicit | REQ-023, REQ-024 | Indicator style, duration, and sensitivity are unspecified. | Relevant |
| REQ-026 | Video playback includes play/pause controls. | Functional requirement | Explicit | REQ-013, REQ-017, REQ-039 | None. | Relevant |
| REQ-027 | Video playback includes forward/backward controls. | Functional requirement | Explicit | REQ-013, REQ-017, REQ-039 | Step size and scrub behavior are unspecified. | Relevant |
| REQ-028 | Video playback includes volume setting capabilities. | Functional requirement | Explicit | REQ-013, REQ-039 | Volume control form remains unspecified. Per-user volume is implied by local playback behavior. | Relevant |
| REQ-029 | The design should be focused on Material Design 3 Expressive. | Visual requirement | Explicit | REQ-001, REQ-039 | The Material 3 skill is Compose-first, while this repository's prototype guidance is React/TypeScript/Vite. | Relevant |
| REQ-030 | The prototype should support light theme, dark theme, large text, and responsive layouts. | Accessibility requirement | Explicit | Repository `AGENTS.md`, REQ-006, REQ-029, REQ-041 | Repository guidance asks for RTL support, but stakeholder clarified to proceed only with English designs now. Whether RTL returns later is remaining uncertainty. | Relevant |
| REQ-031 | The browser client is the interactive design prototype and design-system reference; backend and production streaming infrastructure remain out of scope until explicitly approved. | Platform or technical constraint | Explicit | Repository `AGENTS.md` | The repository now also contains a native client and a reserved backend boundary, so prototype-only constraints apply specifically to `clients/web`. | Relevant as a client scope constraint |
| REQ-032 | Non-owner users can see, copy, and inspect the current URL, but cannot paste/type/start a new stream URL. | Functional requirement | Explicit | REQ-012, REQ-015 | Exact "inspect" UI is unspecified. | Relevant |
| REQ-033 | Party join failures such as invalid, expired, full, or unavailable party IDs can be represented with a simple error. | Functional requirement | Explicit | REQ-010 | Error copy and recovery action are unspecified. | Relevant |
| REQ-034 | Users can leave a party through a visual leave indicator that asks for confirmation. | Navigation requirement | Explicit | REQ-011 | Exact placement and wording are unspecified. | Relevant |
| REQ-035 | Owner aborting a stream stops it for everyone and is different from a user simply pausing playback for themselves. | Business rule | Explicit | REQ-016, REQ-018 | Whether abort clears the video immediately or shows an "aborted" state before returning to URL entry is unspecified. | Relevant |
| REQ-036 | Party ID join errors do not require detailed failure-type differentiation in the design; a simple error is enough. | Content requirement | Explicit | REQ-010, REQ-033 | Error severity and retry flow are unspecified. | Relevant |
| REQ-037 | Leaving a party requires a confirmation prompt. | Business rule | Explicit | REQ-011, REQ-034 | Whether the room owner leaving transfers ownership or ends the room is unspecified. | Relevant |
| REQ-038 | Local playback position differences should not be visible to users; synchronization is only performed when a user intentionally presses the sync button. | Visual requirement | Explicit | REQ-020, REQ-021, REQ-022 | No visible ahead/behind status should be designed unless later requested. | Relevant |
| REQ-039 | Playback controls should be custom-designed based on Material Design 3 Expressive guidelines rather than using default platform/browser controls as the primary design. | Visual requirement | Explicit | REQ-013, REQ-026, REQ-027, REQ-028, REQ-029 | Implementation feasibility is outside this design-analysis phase. | Relevant |
| REQ-040 | Include the selected side-by-side chat panel, adapted below the player on compact screens, across browser and native clients. | Functional requirement | Explicit, DD-052 supersedes the earlier exclusion | REQ-024, REQ-025 | History, limits, retries and privacy follow chat-contract.md. | Relevant |
| REQ-041 | Current design work should proceed only in English and does not need RTL examples now. | Content requirement | Explicit | REQ-006, REQ-030 | This conflicts with repository guidance to support RTL; whether RTL is deferred or removed remains uncertain. | Relevant |
| REQ-042 | Party members can invite others through a prominent share action that copies the party code or a mock invite link. | Functional requirement | Explicit | REQ-010, REQ-011, REQ-031 | Native share integration and production deep linking are outside the prototype scope. | Relevant |
| REQ-043 | Before joining, an invitee can preview the party title, current owner status, participant count, and stream status, then confirm or cancel joining. | Navigation requirement | Explicit | REQ-010, REQ-023, REQ-042 | The preview uses local mock data and does not require production room lookup. | Relevant |
| REQ-044 | If the room owner leaves, the room remains active without an owner until that same owner rejoins. Participants retain local playback controls but cannot start, replace, or abort the shared video while the owner is absent; the returning owner regains owner controls. | Business rule | Explicit | REQ-015, REQ-016, REQ-017, REQ-018, REQ-037 | No ownership transfer or temporary promotion occurs. | Relevant |

## Dependencies

- REQ-011 depends on either REQ-009 or REQ-010 because the party screen appears after party creation or joining.
- REQ-012 and REQ-013 depend on REQ-011 because URL entry and video playback happen inside the party screen.
- REQ-015 and REQ-016 depend on an owner role created or assigned during party creation, but the source does not define ownership details.
- REQ-017, REQ-018, REQ-020, REQ-021, REQ-022, and REQ-038 depend on an active stream state.
- REQ-023 and REQ-025 depend on user identity details from REQ-007.
- REQ-024, REQ-025, and REQ-040 define voice plus room text chat; DD-052 supersedes the original voice-only scope.
- REQ-032 depends on the room owner restriction in REQ-015 because non-owners need read/copy access without start permission.
- REQ-034 and REQ-037 depend on being inside an active party.
- REQ-039 depends on the Material 3 Expressive design direction in REQ-029.
- REQ-030 and REQ-041 are in tension: the prototype should retain accessibility-minded design, but current visual examples are English-only.
- REQ-042 leads into REQ-043 when a recipient opens an invite link or enters a valid party code.
- REQ-043 depends on enough mock room information to show a meaningful preview before the join is confirmed.
- REQ-044 preserves the local controls in REQ-017 and REQ-018 while suspending the owner-only controls in REQ-015 and REQ-016.

## Resolved Conflicts and Clarifications

- Voice and room text chat are confirmed modes (DD-052). Chat remains independent of voice and playback.
- "Logo" in settings is confirmed as a personal avatar selected from a list of fun illustrated cartoonic avatars.
- DD-059 replaces leading-participant sync with owner-led group invitations and private non-owner catch-up to the owner. Acceptance is revocable until the owner commits the participant set.
- Non-owners can see, copy, and inspect the current URL but cannot start a new stream URL.
- Users can type URLs manually, but the design should emphasize easy pasting.
- Supported URL concept for the design is a direct video URL.
- Join failures can use a simple error state.
- Playback controls should be custom-designed using Material Design 3 Expressive guidance.
- Local playback position differences should not be visible to users.
- Current design work should proceed only in English without RTL examples.
- Party members can share the party code or a mock invite link through a prominent invite action.
- Invitees see a room preview before joining, including party title, owner status, participant count, and stream status.
- When the owner leaves, the room becomes ownerless without transferring privileges; only the returning original owner restores owner controls.

## Remaining Uncertainty

- Whether the cross-platform mobile prototype should be implemented as React/Vite mobile web, React Native, Flutter, or another cross-platform runtime later.
- Party ID format, expiration behavior, and exact error copy.
- Initial owner assignment remains inferred from party creation; ownership does not transfer after the owner leaves.
- Exact visual state after owner aborts a stream.
- Direct video URL format support and validation rules.
- Voice chat details: mute, push-to-talk/open mic, permission prompts, speaking indicator duration, and failure states.
- Avatar catalog size, avatar categories, and name validation rules.
- Whether RTL support is deferred or removed for this prototype, given the conflict between repository guidance and the latest English-only design instruction.
- DD-059 preparation deadline, readiness criteria, owner-loss and automatic failure recovery, live-source handling, and ongoing drift policy; see `open-questions.md`.
- Volume control form and forward/backward step size.

## Conflicts and Tensions

- The owner can abort the stream for everyone, while all users can control playback for themselves. This creates two control scopes: global owner actions and local viewer actions.
- DD-059 exposes the invitation target and response/readiness states without requiring visible participant timelines or ahead/behind badges.
- Repository guidance assigns React, TypeScript, and Vite to `clients/web`, while `clients/native` uses Compose Multiplatform. Apply Material 3 through design tokens and CSS variables on the web and through the native Compose design system in watchparty.
- Repository guidance asks for RTL support, while the latest stakeholder answer says to proceed only with English designs and no RTL examples now.

## Not Relevant to the Current Design-only Phase

- Production streaming implementation details for direct video URL playback.
- Backend room creation, persistence, authentication, and party ID generation.
- Real-time synchronization infrastructure.
- Database models for users, rooms, voice chat, or playback state.
- Production networking and media compatibility handling.
- Native mobile implementation choices unless they affect prototype layout, navigation, or visual design.
