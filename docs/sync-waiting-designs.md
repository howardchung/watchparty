# Waiting for owner in the sync dialog

The stakeholder requested three simple labeled loading variations on 2026-11-12. All stay inside the existing dialog, beside or just above the withdrawal action as space allows. The earlier room-level ribbon, avatar and overlay concepts are superseded.

Preview: `http://localhost:5177/?preview=sync-waiting`. The Design selector inside the dialog switches among:

| Variation | Copy | Treatment |
| --- | --- | --- |
| Inline (`variant=inline`) | Waiting for the owner… | Small spinner and plain text alongside the action, wrapping naturally on compact screens. |
| Soft pill (`variant=pill`) | Waiting for the owner to start | Small spinner and text in a subtle tonal capsule. |
| Slim line (`variant=line`) | Ready when the owner starts | A thin indeterminate line above a short status sentence. |

Each includes Persian copy, theme tokens, accessible status text and reduced-motion support. Close the dialog to change language, theme or text scale, then reopen it. The withdrawal action remains enabled and returns to local playback.

Inline was selected and integrated into the main browser and shared native dialogs (DD-071). The inline preview uses the production browser indicator directly. Soft pill, Slim line and the selector remain preview-only. The indicator appears only for accepted non-owners during INVITING, and disappears when preparation starts. Existing withdrawal, disabled/offline behavior and automatic recovery remain unchanged. No additional participant cards, avatars or player overlays are introduced.
