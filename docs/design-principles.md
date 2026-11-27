# Design Principles

## Principles Derived From Requirements

| Principle | Meaning | Support |
| --- | --- | --- |
| Mobile-first shared watching | Design for a cross-platform mobile watch party experience where users create or join rooms and watch direct video URLs. | Supported by REQ-001, REQ-002, REQ-009, REQ-010, REQ-011. |
| Clear role boundaries | Owner-only actions must be visually and behaviorally distinct from participant actions. | Supported by REQ-015, REQ-016, REQ-032, REQ-035. |
| Local control by default | Play, pause, seeking, and volume are personal controls and should not imply group control. | Supported by REQ-017, REQ-018, REQ-026, REQ-027, REQ-028. |
| Explicit synchronization | Owner-led group sync requires viewer consent; non-owners can privately catch up to the owner. Expose response states without participant timelines or drift badges. | Supported by REQ-020, REQ-021, REQ-022, REQ-038; DD-059. |
| Voice and text presence | Keep voice chat, participant avatars and speaking indicators alongside an independent room text-chat panel. | Supported by REQ-023, REQ-024, REQ-025, REQ-040; DD-052. |
| Playful identity | Personalization should use simple names and fun illustrated cartoonic avatars. | Supported by REQ-007, REQ-023. |
| Simple recovery | Join failures can use a simple error model; leave and abort actions should use clear confirmation or impact messaging. | Supported by REQ-033, REQ-034, REQ-035, REQ-036, REQ-037. |
| Shareable entry | Make inviting easy, but let recipients verify room identity and availability before joining. | Supported by REQ-042, REQ-043. |
| Stable ownership | Leaving does not silently promote another participant; owner-only controls disappear until the original owner returns. | Supported by REQ-044. |
| Design-phase restraint | Design should focus on product experience, not production backend, database, authentication, or streaming infrastructure. | Supported by REQ-031. |

## Material 3 Expressive Principles

| Principle | Meaning for this product | Support |
| --- | --- | --- |
| Expressive but usable | Use Material Design 3 Expressive to make the party and player experience lively while preserving clear media controls and role boundaries. | Supported by REQ-029, REQ-039. |
| Token-led visual system | Use semantic color, type, shape, spacing, and state decisions so the prototype can support themes and large text consistently. | Supported by REQ-029, REQ-030. |
| Adaptive mobile composition | Structure screens for cross-platform mobile first, with responsive behavior for larger or varied viewports. | Supported by REQ-001, REQ-030 and temporary decision based on ASM-001. |
| Custom player controls | The video control surface should feel like part of the Material 3 Expressive system rather than a default embedded browser control set. | Supported by REQ-026, REQ-027, REQ-028, REQ-039. |
| Meaningful state treatment | Initial, loading, empty, error, disabled, selected, pressed/active, and populated states should be visually planned, not added later. | Supported by REQ-030 and temporary decision based on ASM-012. |
| Accessible contrast and scale | Light theme, dark theme, large text, and responsive layouts are part of the design scope. | Supported by REQ-030. |

## Product Voice and Information

- **Established stakeholder preference:** The stakeholder repeatedly removed explanatory sentences, redundant state captions and informational cards during sync review. Treat concise copy as an accepted product design rule across browser and native clients, not a temporary preview preference. See DD-063, DD-064 and DD-067.
- Use a friendly, casual tone in English and Persian throughout screens, dialogs, status messages, errors, tooltips and notifications. Use natural contractions in English and conversational Persian such as «میتونی»، «فیلم رو» and «دوباره امتحان کن». Preserve established terminology and the stakeholder's chosen labels.
- Let the UI carry the explanation. Omit helper sentences when headings, actions, icons, state changes or the surrounding context already make the meaning clear. Do not add a sentence simply to fill space or narrate what just happened.
- Prefer a short heading and clear actions. State each useful fact once. Avoid introductory paragraphs, repeated playback-status explanations, internal coordination details and generic reassurance. Do not reintroduce removed copy as captions, tooltips or cards.
- Keep the shortest wording needed for an informed action: who is affected by an action, an important consequence that is not otherwise clear, or a concrete recovery step after an error. Button labels such as «پذیرش و توقف فیلم» can communicate the consequence without another paragraph.
- Keep feedback relevant to its recipient. Brief informational outcomes belong in a snackbar rather than a persistent card when no action is required; for example, only the owner receives the group-recovery completion snackbar.
- Casual language must remain truthful. Accepted viewers are paused, so «پایه است» must not be paired with a watching status. Avoid claiming a specific failure cause unless it is known.

## Temporary Exploratory Choices

| Choice | Rationale | Risk if wrong |
| --- | --- | --- |
| Represent the interactive prototype in the mobile-first `clients/web` client while targeting a consistent cross-platform product. | Web client guidance points to React, TypeScript, Vite, and mobile-first layouts; the native client provides the native implementation. Temporary decision based on ASM-001 and supported by REQ-001. | Web and native clients may require platform-appropriate navigation and media-control adaptations. |
| Treat room creator as owner and ID or invite-link joiners as non-owners. | Ownership is required for URL start and abort, and creation is the only available initial ownership cue. Temporary decision based on ASM-004, ASM-005 and supported by REQ-015, REQ-016, REQ-043, REQ-044. | If initial ownership is assigned differently, role labels and party creation behavior must change; ownership does not transfer after leave. |
| Use a simple mute/unmute voice model until voice behavior is clarified. | Voice chat is confirmed, but detailed interaction model is not. Temporary decision based on ASM-016 and supported by REQ-024, REQ-025. | Push-to-talk or open-mic requirements could change party screen controls. |
| Show a post-abort party state that keeps the room available for another URL. | The owner can start another URL in the same room, but exact post-abort state is undefined. Temporary decision based on ASM-009 and supported by REQ-016, REQ-035. | If abort ends the room, navigation should return to party manager or home. |
| Support English and Persian with RTL presentation. | English-only exploration was superseded by DD-049; both languages follow the accepted casual, concise product voice. | Review translated layouts at large text and compact sizes. |
| Represent direct video URL validation visually in `clients/web` rather than implementing real compatibility checks there. | The browser client is the interactive prototype, not production media infrastructure. Temporary decision based on ASM-014 and supported by REQ-002, REQ-031. | If real validation is required in the web client, its scope and technical dependencies increase. |

## Anti-principles

- Keep text chat scoped to the current room and the accepted plain text/emoji contract. Supported by REQ-024, REQ-040; DD-052.
- Do not expose visible playback drift or participant timelines for sync. Supported by REQ-038.
- Do not make non-owner URL controls look editable or start-capable. Supported by REQ-015, REQ-032.
- Do not make owner abort look like a personal pause action. Supported by REQ-016, REQ-017, REQ-018, REQ-035.
- Do not transfer owner permissions or expose shared-stream controls to remaining participants when the owner leaves. Supported by REQ-044.
- Do not introduce production backend, database, authentication, or real-time infrastructure into the design phase. Supported by REQ-031.
