# Open Questions

## Android download discovery (2026-11-11)

- [Resolved, DD-038] The stakeholder selected the minimal home download row from the [placement concepts](android-download-designs.md), with “Native Android app” and “Background voice party”.
- [Resolved, DD-038] The stakeholder authorized public hosting of the signed Android release and linking the row to it. The current follow-up release is `https://watchparty.top/downloads/roomio-1.1.1-7.apk`; keep the explicitly labeled row visible to all visitors.

Only questions whose answers could materially change user flow, screen structure, navigation, or visual direction are listed.

Resolved questions are preserved with their answers for traceability.

## Blocking

1. [Resolved] What platform should the design target first: mobile web prototype, Android client, or desktop client?
   - Answer: Cross-platform mobile focused on Material Design 3 Expressive.
   - Design decision affected: Sets mobile-first cross-platform screen structure and confirms Material 3 Expressive as the visual system. The production runtime remains unspecified.

2. [Resolved, updated DD-052] Is "chatroom" text chat, voice chat, or both?
   - Answer: Voice and room-scoped plain text/emoji. The stakeholder selected side-by-side text chat on 2026-11-12, superseding the earlier voice-only scope.
   - Design decision affected: Retain voice activity/microphone controls and add an adaptive chat panel, history, composer, unread and offline/retry states; see chat-contract.md.

3. [Resolved] What does "logo" mean in settings: a personal avatar, room logo, app logo, or selectable icon?
   - Answer: A personal avatar selected from a list of fun illustrated cartoonic avatars.
   - Design decision affected: Settings needs avatar selection; party member icons should use selected personal avatars.

4. [Resolved] Who is the "first person" used by the synchronization button?
   - Answer: The leading participant, meaning the one currently furthest ahead.
   - Design decision affected: Sync action targets the furthest-ahead participant, not the owner or earliest joined participant.

5. [Resolved] What exactly happens when the room owner aborts a stream?
   - Answer: The stream is aborted for everyone. This is different from simply pausing, which pauses only for the user who pressed pause.
   - Design decision affected: Owner abort must be visually distinct from local pause and should communicate global impact.

## Important

1. [Resolved] Can non-owner users see, copy, or inspect the current URL even though they cannot paste/start URLs?
   - Answer: Yes.
   - Design decision affected: Non-owner party screen needs read/copy/inspect affordances for the current URL without edit/start controls.

2. [Resolved] Can users type a URL manually, or must it be pasted from the clipboard?
   - Answer: Typing is also possible, but focus is on easy pasting.
   - Design decision affected: URL entry should support keyboard input and a prominent paste-oriented affordance.

3. [Resolved] What URL types must the design represent: direct video files, HLS streams, YouTube-like pages, or any URL?
   - Answer: Direct video URL.
   - Design decision affected: Placeholder text, validation copy, and examples should describe direct video URLs rather than general web links.

4. [Resolved] What party join states should be represented for invalid, expired, full, or unavailable party IDs?
   - Answer: A simple error is enough.
   - Design decision affected: Party manager does not need separate error layouts for each failure type.

5. [Resolved] How should users leave a party or return home?
   - Answer: A visual leave indicator that asks "Are you sure?"
   - Design decision affected: Party screen needs a leave affordance and confirmation prompt.

6. [Resolved] Should playback controls be custom-designed or use the platform/browser video controls?
   - Answer: Custom-designed based on Material Design 3 Expressive guidelines.
   - Design decision affected: Player controls should be part of the custom design system rather than relying on default browser/platform UI as the primary design.

7. [Resolved] Should local playback position differences be visible to users?
   - Answer: No. They are only synchronized if they want to by pressing the sync button.
   - Design decision affected: Do not design visible ahead/behind indicators, participant timelines, or drift badges.

8. [Resolved] Does language selection need RTL examples now?
   - Answer: Superseded by DD-049 (2026-11-12): the stakeholder requested Persian in browser and Android. Both now support English and Persian with RTL presentation.

9. [Resolved] Should the product include an invite/share flow?
   - Answer: Yes. Current party members can use a prominent action to copy the party code or a mock invite link.
   - Design decision affected: The party screen needs an accessible invite/share surface with copied and copy-failure feedback, without requiring production deep links or native share infrastructure.

10. [Resolved] Should invitees see the room before joining?
   - Answer: Yes. Show party title, current owner status, participant count, and stream status before the invitee confirms or cancels joining.
   - Design decision affected: Joining becomes a two-step flow with loading, available, owner-absent, full, ended/unavailable, and join-confirmation states.

11. [Resolved] What happens when the room owner leaves?
    - Answer: The room remains active without an owner until that same owner rejoins. Other users retain local playback but cannot start, replace, or abort the shared video. Ownership does not transfer.
    - Design decision affected: Add a persistent owner-absent room state, keep owner-only controls unavailable, and restore them only when the original owner returns.

12. [Core consent rules resolved 2026-11-12, DD-059; archived UI variations remain deferred] Directional sync semantics, and the conflict with the resolved "no visible position differences" answer.
    - The archived `clients/web` sync exploration (DD-017) shows each participant's playback time and offers "Bring everyone to me" / "Take me to others". This conflicts with the resolved answer to Important question 7, which said not to design visible ahead/behind indicators or participant timelines.
    - Resolved: Only the owner invites a group, pausing the owner at a fixed target. Viewers pause only upon acceptance and may withdraw before commitment. The owner sees live responses, can cancel before commitment, and can start with the currently accepted subset. Starting locks that set; automatic bounded failure recovery remains mandatory. Non-owners privately sync to the owner, including backward. Declined/unanswered/withdrawn viewers continue normally. No participant timeline or drift badges are implied.
    - Implemented policies: 15-second preparation deadline, two seconds of playable buffer or the remaining movie, mandatory owner readiness, 3.5-second shared scheduled start, two-minute invitation expiry, and revision/request/stream correlation. Owner loss ends the attempt; unready/disconnected viewers are excluded. Viewers may withdraw and accept again before commit. Nonseekable live media and absent/stale-owner private sync report unavailable. Cancellation restores the preceding local state; withdrawal explicitly resumes at the saved acceptance position. See `synchronization-contract.md`.
    - Remaining scope: continuous drift correction and invitation muting. The selected focused dialog/mobile sheet and latest concise bilingual labels are implemented; archived DD-017 alternatives remain deferred.

13. [Resolved] What direct video URL formats and validation rules apply to the native client?
    - Answer: The Android client accepts any well-formed HTTP(S) direct video URL and plays it through Media3 ExoPlayer; progressive files and HLS live streams are supported. Validation is deferred to playback: failures surface through the player error state and a retry path. Cleartext HTTP is permitted for this feature via a debug network security configuration.
    - Design decision affected: Native URL entry needs an error-with-recovery player state rather than format pre-validation; live streams hide scrubber and skip controls. Recorded as DD-013 for the watchparty Compose client.

## Can be deferred

1. What exact name length, character rules, and avatar limits should settings enforce?
   - Affects form validation copy and edge states, but not the primary screen structure.

2. What is the party ID format?
   - Affects input masking and examples, but the design can proceed with a placeholder pattern.

3. How large can a party be?
   - Affects member list layout, overflow states, and avatar grouping.

4. Should volume be shown as a slider, stepper, icon menu, or another custom control?
   - Affects detailed player control design but not the main user flow.

5. Should the app show video title, thumbnail, duration, or loading metadata?
   - Affects the populated player state and pre-play preview.

6. [Resolved, DD-031] What voice-chat control model should be used?
   - Explicit opt-in starts muted; acknowledged unmute enables capture, immediate mute disables capture, and unavailable links have a peer-only retry action.

7. What should the screen show immediately after the owner aborts a stream?
   - Affects whether the player becomes an aborted state, an empty URL-entry state, or a transition state.

## Remaining Uncertainty Summary

- Production runtime is still unspecified, even though the design target is cross-platform mobile.
- [Resolved, DD-049] Persian and RTL are included in browser and Android.
- [Resolved, DD-031] Voice is explicit muted opt-in with independent per-peer recovery; physical audio and deployment/load acceptance remain open.
- Initial owner assignment is still inferred from party creation, but the owner-absent and returning-owner lifecycle is defined.
- Desktop playback uses VLC.
- [Implemented, DD-059] Owner-led synchronization uses revocable acceptance, locked participants and bounded recovery; private catch-up follows the owner. See `synchronization-contract.md` for verified platforms and timing. DD-017 stays archived.
- [Resolved, DD-031] An application-scoped coordinator owns the Android voice lifetime and notification commands through a bound foreground microphone service. Process death never automatically restores capture.


## Hosted deployment follow-ups (2026-10-15)

- [Resolved 2026-10-16, DD-025] Make `watchparty.top` primary and keep the previous hostname as a live alias for returning browser owners. Browser storage remains origin-scoped and does not transfer; retain the alias while identities stored there are needed.
- [Resolved 2026-11-11] Stakeholder requested removal of backups entirely. No scheduled database dumps or stored server backup directory are maintained; no snapshot-based database recovery is provided. See `backend/deploy/README.md`.
- Hosted four/eight-peer mesh, physical browser/Android audio, restrictive-network fallback, and sustained load remain acceptance gates..

## Browser playback limitation (2026-10-23)

- Firefox versions before 158 may scan an entire AAC-in-MKV source before exposing metadata; reproduced on Firefox 153 with the reported link. Mozilla [bug 2000420](https://bugzilla.mozilla.org/show_bug.cgi?id=2000420) is fixed for Firefox 158. Direct native playback cannot bypass that scan from page JavaScript. Keep the direct-client boundary and expose useful slow-loading guidance; do not claim the website update fixes affected browser versions.


## Guest authentication replacement (2026-10-23)

- [Resolved, DD-028] Replace Firebase completely with backend-owned automatic guest sessions; no registered-account UI is added.
- [Resolved, DD-028] Existing Firebase identities and room ownership do not migrate. Updated clients create fresh backend guest identities and retain non-secret preferences.
- [Resolved] Delivery includes backend/browser deployment and browser verification. Android builds and tests are required; the stakeholder will verify the actual device.
- The external Firebase project is retained; deleting it is outside this change. Historical evidence remains marked historical.

## Browser media parity (2026-10-30)

- [Resolved, DD-029] Use Android's media control UI and local subtitle/audio selection behavior in the browser, including local subtitle imports in the Android-supported file extensions.
- Browser APIs and codecs may not expose embedded MP4/MKV audio/subtitle tracks that Android can select. DD-037 adds integrated MKV demuxing with browser decoding and embedded text/audio selection, superseding DD-036 extraction. Unsupported codecs, missing CORS/range access, bitmap subtitles, and universal embedded audio/subtitle parity remain outside the guarantee.
- Imported SSA/ASS and TTML content is adapted to WebVTT text and timing. Advanced styling, animation, drawing, and placement parity with Media3 is outside the accepted browser rendering guarantee.

## Mesh voice release gates (2026-11-05)

- [Resolved, DD-031] Retain Node/PostgreSQL/private Coturn peer mesh and preserve healthy links during individual peer failure.
- Physical two/four/eight-person mixed Android/browser audio, headset/Bluetooth and network-switch/background acceptance remain unverified.
- Production TURN TLS443 DNS/certificates/firewall activation, the two-hour eight-person soak, and 100 simultaneous eight-person rooms require measured acceptance before a stability/capacity claim. See [voice stability acceptance](voice-stability-acceptance.md).

## Bug-report action concepts (2026-11-11)

- [Resolved, DD-041] Use a bug icon next to Share/Invite in the room app bar with one large description field.
- [Resolved, DD-041] Send description, device/browser details and application session logs to private backend storage; see [contract](bug-report-contract.md). Retention defaults to 30 days. A staff triage UI or notifications remain outside this feature.


## Default browser player (2026-11-11)

- [Resolved, DD-042] Use AVPlayer for all HTTP(S) browser media, with one automatic browser/native-HLS/hls.js fallback on failure or a 30-second initial startup stall while online.
- Physical-device/mobile Safari and full-movie acceptance remain unverified. Embedded track availability can differ between AVPlayer and fallback engines; no universal codec or track-parity promise is made.

## Party text-chat exploration (2026-11-12)

- The stakeholder requested three web chat design previews (DD-050), following the backend readiness assessment. That exploration-only scope was superseded when the stakeholder selected side-by-side and authorized production implementation (DD-052).
- Choose among side-by-side, below-player dock and floating conversation, including the preferred mobile behavior. Local previews are available at `/?preview=chat` with a design switcher.
- Before production implementation, confirm message history visibility for new/rejoining members, room-lifetime retention, limits and moderation scope, then define shared HTTP/realtime contracts and native behavior. The preview's 500-character composer limit is an exploratory UI value, not a backend contract.

## Party text chat selection (2026-11-12)

- [Resolved, DD-052] The stakeholder selected the side-by-side concept and authorized backend plus browser/Android/desktop implementation. The earlier voice-only clarification and DD-050's exploration-only status are superseded for this feature.
- Implementation defaults are documented in [chat contract](chat-contract.md): room members see room history; room tombstone cleanup removes stored messages; plain text/emoji with shared limits; no moderation/attachments/read receipts in this iteration.

## Settings chooser presentation studies (2026-11-12)

- [Resolved, DD-062] The stakeholder selected In the spotlight for avatars; the enlarged selected character and two-column tile are implemented in browser/shared native Settings.
- [Resolved, DD-065] Use the focused language picker, with English and فارسی only. Additional launch languages remain a future decision; the ten study fixtures are not selectable production options.
- [Resolved, DD-065] Use Color garden in main browser/shared native Settings, alongside Spotlight avatars. Immediate color application and DD-049 profile Save/Back semantics remain unchanged. See [integrated Settings choosers](settings-chooser-designs.md).

## Accepted viewer waiting indicator (2026-11-12)

- [Resolved, DD-071] Inline is selected: small spinner plus “Waiting for the owner…” alongside withdrawal in browser and shared native sync dialogs. See [integrated preview](sync-waiting-designs.md).

## Local video files (2026-11-13)

- [Resolved, DD-075] Apply the approved preview subset rule: Start requires at least one ready non-owner and does not wait for unanswered or declined members.
- [Resolved, DD-075] Selected copies are device-only; refresh requires reselection, reconnect preserves the same session's copy. New selectors privately catch up after commitment. Source replacement is atomic and owner/revision checked.
- [Resolved, DD-075] Side-by-side source tiles, direct system pickers and snackbar-only failure restoration are approved. No content/filename equality validation is requested; a successful seek into different content is permitted.
- Android and desktop platform playback retain their codec capabilities.
