# Visual Directions for the Primary Screen

## Scope and Source Note

For this exploration, the primary screen is the **Party Screen: Active Player** because it contains the core watch-party experience: video playback, local controls, intentional synchronization, participant presence, voice activity, and role-specific actions. Supported by REQ-011, REQ-013, REQ-017, REQ-020, REQ-023, REQ-024, and REQ-039.

The requested source `docs/requirements-coverage.md` was not present when this document was created. Requirement support was therefore checked against `docs/product-brief.md`, `docs/design-principles.md`, `docs/screen-inventory.md`, and the stable IDs in `docs/requirements-analysis.md`. This limitation should be revisited if a coverage document is added later.

These are visual-system and composition directions, not final screens. They do not select a production framework or define deferred product behavior.

## Shared Requirement Baseline

Every direction must preserve the following behaviors and distinctions:

- The direct video URL has already become a custom-designed video player. Supported by REQ-002, REQ-013, and REQ-039.
- Play/pause, forward/backward, and volume are local playback controls that do not affect other participants. Supported by REQ-017, REQ-018, REQ-026, REQ-027, and REQ-028.
- Sync is an explicit action that moves only the current user to the leading participant's position; no playback drift or ahead/behind information is shown. Supported by REQ-020, REQ-021, REQ-022, and REQ-038.
- The user's avatar and other participant avatars remain visible, with a clear indicator when someone is speaking in voice chat. Supported by REQ-007, REQ-023, REQ-024, and REQ-025.
- Text chat is absent. Supported by REQ-024 and REQ-040.
- Non-owners can inspect and copy the current URL without receiving edit or start controls. Supported by REQ-015 and REQ-032.
- Owner abort is visually distinct from local pause because it stops the stream for everyone. Supported by REQ-016, REQ-018, and REQ-035.
- A visible leave action is available and leads to confirmation. Supported by REQ-034 and REQ-037.
- A prominent invite action opens a share surface for the party code and mock invite link, with text feedback for copy success or failure. Supported by REQ-042.
- Invitees encounter a separate room preview before joining; party title, owner status, participant count, and stream status remain legible in light, dark, and large-text presentations. Supported by REQ-030 and REQ-043.
- If the owner leaves, a persistent owner-absent status replaces owner-only stream actions without interrupting local playback, Sync, voice, URL inspection, or inviting. Supported by REQ-017, REQ-018, REQ-032, REQ-042, and REQ-044.
- The composition is cross-platform mobile-focused, Material 3 Expressive, responsive, and capable of light, dark, and large-text presentations. Supported by REQ-001, REQ-029, and REQ-030.

## Direction 1: Immersive Cinema

### Concept

Make the video the dominant visual field and let party presence orbit it without competing for first attention. This direction presents the product primarily as a media experience with a social layer.

### Composition

- A compact top app bar holds room identity, read-only URL access, and the leave action.
- The video occupies the widest available region near the top of the screen, using an edge-to-edge media treatment on compact widths.
- Custom playback controls appear as a tonal control shelf attached to the video rather than as a separate card.
- Sync is a prominent extended action directly below the player, separated from the local playback cluster so its meaning is not confused with play or seek.
- Participant avatars form a single visible strip below Sync. Speaking activity uses a high-contrast ring or tonal halo around the active avatar.
- The owner-only global abort action is kept outside the local playback cluster and uses explicit destructive treatment.

### Material 3 Expressive Character

The direction uses a dark media surface, brighter tonal controls, emphasized type for the room state, full and large-increased shapes for primary actions, and restrained shape or tonal changes for pressed and active states. Tonal surfaces carry hierarchy more than shadows. This interpretation applies REQ-029 and REQ-039.

### Requirements Supported Strongly

- **Video transformation and custom controls:** The media-first hierarchy makes the active player and its custom Material controls unmistakable. Supported by REQ-013, REQ-026, REQ-027, REQ-028, and REQ-039.
- **Local control scope:** Grouping local playback actions together, while separating Sync and abort, makes personal versus global effects easier to understand. Supported by REQ-017, REQ-018, REQ-020, and REQ-035.
- **Intentional Sync:** A large action outside the transport controls gives Sync clear importance without exposing playback differences. Supported by REQ-020, REQ-021, REQ-022, and REQ-038.
- **Owner abort distinction:** A remote destructive action cannot be mistaken for local pause when it is spatially separated from the player controls. Supported by REQ-016 and REQ-035.

### Requirements Made Harder to Satisfy

- **Persistent social presence:** A large player leaves less vertical space for avatars and speaking indicators, so REQ-023 and REQ-025 require careful compact treatment.
- **Large-text support:** Controls attached to the media region can become crowded as labels scale, increasing the layout pressure created by REQ-030.
- **Non-owner URL inspection:** Keeping the URL in the top app bar makes REQ-032 less discoverable than a persistent read-only field would be.
- **Voice-first social character:** Voice chat remains visible, but the hierarchy gives REQ-024 less emphasis than the viewing experience.

### Stylistic Decisions, Not Requirements

- Dark-first media canvas with a contrasting lower party surface.
- Oversized central play/pause treatment when controls are revealed.
- An asymmetrical transition between the player edge and the participant strip.
- A saturated tertiary accent for Sync while transport controls remain neutral-tonal.
- Subtle control-shelf reveal and avatar-halo motion; the requirements mandate states, not these motion treatments.
