// Package voice issues room-scoped LiveKit tokens, verifies signed LiveKit
// webhooks, and keeps voice state independent from room and playback.
package voice

import "errors"

var (
	// ErrDisabled is returned when LiveKit is not configured.
	ErrDisabled = errors.New("voice is disabled")
	// ErrNotMember is returned when the caller is not an active room member.
	ErrNotMember = errors.New("not a room member")
	// ErrInvalidWebhook is returned when a webhook signature cannot be verified.
	ErrInvalidWebhook = errors.New("invalid livekit webhook")
	// ErrNotConfigured is returned when the issuer lacks credentials.
	ErrNotConfigured = errors.New("livekit not configured")
)
