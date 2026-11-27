# Android download placement concepts

The stakeholder selected **Download row** on 2026-11-11 (DD-038). All three design proposals remain available locally at `/?preview=android-downloads` for comparison. The selected row is implemented below the real home page’s Create/Join actions; the comparison gallery remains separate. All concepts use the browser client's Material 3 color, typography, shape, and spacing tokens, existing watchparty avatars, light/dark themes, large text, and logical layout properties for RTL.

The stakeholder requested a more minimal revision: remove the illustration, slogans, repeated explanations, and browser reassurance lines. Each variation now uses only “Native Android app”, “Background voice party”, and a download action.

1. **Compact banner:** dismissible tonal surface with a small Download button.
2. **Download row:** outlined single row with two lines of copy and an accessible download icon.
3. **Inline link:** background-voice label and a text action below the voice controls, separated by a divider.

The comparison gallery retains preview dialogs. The real home row links directly to the signed APK. Home actions and voice status remain static context. No network calls, microphone access, party mutations, or app-install detection are performed.

The selected row sits below Create/Join and has no dismiss control. The release download URL is `https://watchparty.top/downloads/roomio-1.1.0-6.apk`. The home row is visible to all visitors with explicit Android labeling. An additional Settings entry remains a proposal. The alternative banner's dismissal in the preview is session-local.

States: populated/initial cards are shown; dismissal and restoration are interactive; theme/text/RTL controls expose selected and pressed states; keyboard focus and standard button active states use shared components. Loading, empty, disabled, offline, and download errors are not simulated: these are static link-placement concepts with no download service. The destination should own installation/download recovery. Background voice wording describes the native feature, not uninterrupted service or background video; physical background/network acceptance remains tracked in `voice-stability-acceptance.md`.

Validation: production build passed. Chrome checks passed at 1440px light/dark, 390px mobile, and 360px dark/large-text/RTL with no horizontal overflow or runtime errors. Download preview dialog and invitation dismissal/restoration passed. Desktop light and mobile dark/large-text/RTL screenshots were visually reviewed.
