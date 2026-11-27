# Local video file preview

Open `http://localhost:5177/?preview=local-file&lang=en`. This is the main web room layout with fake file/readiness state, not a production media or networking implementation. Use `role=viewer` for the incoming request, `lang=fa` for Persian, `theme=light` for light mode, and `scale=large` for large text.

1. Owner: the original cinema background and URL input remain. Start stream and Choose file sit side by side with matching button style and size; neither source requires navigating to a different entry screen. Choose file opens the system picker directly. Selecting a file shows a short loading state, then sends the fake request and opens Who’s ready to watch. Cancelling the system picker leaves the current state intact. The existing dialog treatment shows the requested filename, target 0:00, participant response rows and Start with a ready-viewer count. Start is disabled at zero.
2. Use “Preview: show mixed replies” inside the dialog for ready, choosing and declined examples. Close the dialog to change each fake participant response in Preview controls, then View file request to return. All three Ready responses enable Start with 3.
3. Switch View as to Viewer · Ellis. Choose file opens the system picker for the viewer’s copy; any filename is accepted, without checking whether it matches the owner. A selected viewer waits with the accepted inline indicator, and can sit out before Start. Declining leaves the cinema empty while room/voice controls remain available.
4. Start runs simulated preparation and 3, 2, 1, Action. The viewer's Preview controls can simulate the owner starting. Pending/declined viewers have no player.
5. Change opens a source-choice dialog with equal Local file and Stream URL actions. Local file opens the system picker; Stream URL shows a URL field and Start stream. Cancelling either choice retains the current file. Only owners may replace the room source; a viewer’s Change goes directly to their local-file picker.
6. Simulate sync failure now shows only “Couldn’t sync. Back to where you were.” in a five-second snackbar for every role, closes sync UI and restores the saved pre-attempt play/pause state and position. The current file and ordinary controls remain available. No persistent error card, forced pause, forced seek, recovery buttons or failed-participant mutation is shown. Without a committed attempt, the simulator preserves the current local state. Going offline during preparation/countdown follows the same recovery; the separate connectivity indicator remains relevant until reconnection.

Only a chosen file's name enters preview state. No bytes are read, hashed, uploaded or played. The video scene and timers are simulated. A different movie whose timeline can seek successfully is allowed; errors must describe observed seek/read/timeout failures, never claim proven file mismatch.

Start stream opens the existing playing-room preview after entering a URL. Invite, voice and local controls reuse the room's fake interactions. Fullscreen, physical-device playback, codec/duration validation, actual disconnect detection and real multi-client synchronization await approved production scope. State coverage includes empty, chosen, simulated opening, ready, pending, declined, failed, paused, playing, preparation/countdown, offline, disabled/selected/pressed controls and retry.

See DD-073 and the local-file questions in `open-questions.md` for the proposed start quorum and pending lifecycle choices.


## Selected Choose video design (2026-11-13)

The stakeholder selected side-by-side tiles. The integrated preview now always uses two equally sized tonal tiles with centered icons for Local file and Stream URL. The variation selector and unselected implementations have been removed. `dialog=choose-video` opens the selected dialog directly; older `choice` parameters are ignored.

Open `http://localhost:5177/?preview=local-file&dialog=choose-video&lang=en`. Each tile opens its source flow in one click: the system file picker or the URL field. Cancellation retains the existing file. The original cinema background, equal-priority entry actions, brief sync-failure snackbar and playback restoration remain intact. The local-file feature itself remains a fake-data preview; selection of this dialog does not implement backend/native playback or deploy it.
