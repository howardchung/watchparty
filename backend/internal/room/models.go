// Package room owns room lifecycle, membership, ownership, previews, and the
// owner-reserved seat policy.
package room

import "time"

const (
	// MaxIdentities is the hard cap of identities per room.
	MaxIdentities = 8
	// GuestLimit is the maximum number of guests, reserving one seat for an
	// absent owner so the original owner can always return.
	GuestLimit = MaxIdentities - 1
)

// Room is a watch party. Ownership never transfers; it is bound to the guest
// identity that created the room.
type Room struct {
	ID              string     `json:"id"`
	Code            string     `json:"code"`
	Title           string     `json:"title"`
	OwnerIdentityID string     `json:"ownerIdentityId"`
	CreatedAt       time.Time  `json:"createdAt"`
	EndedAt         *time.Time `json:"endedAt,omitempty"`
	TombstoneUntil  *time.Time `json:"tombstoneUntil,omitempty"`
}

// Ended reports whether the room has been closed.
func (r Room) Ended() bool { return r.EndedAt != nil }

// Membership is an identity's seat in a room.
type Membership struct {
	ID               string     `json:"id"`
	RoomID           string     `json:"roomId"`
	IdentityID       string     `json:"identityId"`
	DisplayName      string     `json:"displayName"`
	Avatar           string     `json:"avatar"`
	IsOwner          bool       `json:"isOwner"`
	JoinedAt         time.Time  `json:"joinedAt"`
	LeftAt           *time.Time `json:"leftAt,omitempty"`
	GraceExpiresAt   *time.Time `json:"graceExpiresAt,omitempty"`
	WSConnected      bool       `json:"wsConnected"`
	LiveKitConnected bool       `json:"livekitConnected"`
}

// Connected reports whether either the room socket or LiveKit voice is attached.
func (m Membership) Connected() bool { return m.WSConnected || m.LiveKitConnected }

// Present reports whether the member is currently visible in the room.
func (m Membership) Present() bool { return m.LeftAt == nil && m.Connected() }

// SeatHeld reports whether the member still occupies a seat. A disconnected
// member holds the seat until the grace period expires.
func (m Membership) SeatHeld(now time.Time) bool {
	if m.LeftAt != nil {
		return false
	}
	if m.Connected() {
		return true
	}
	return m.GraceExpiresAt != nil && now.Before(*m.GraceExpiresAt)
}

// MemberSummary is the client-safe projection of a membership.
type MemberSummary struct {
	MembershipID string `json:"membershipId"`
	IdentityID   string `json:"identityId"`
	DisplayName  string `json:"displayName"`
	Avatar       string `json:"avatar"`
	IsOwner      bool   `json:"isOwner"`
	Present      bool   `json:"present"`
}

// Summary projects a membership for realtime delivery.
func (m Membership) Summary() MemberSummary {
	return MemberSummary{
		MembershipID: m.ID,
		IdentityID:   m.IdentityID,
		DisplayName:  m.DisplayName,
		Avatar:       m.Avatar,
		IsOwner:      m.IsOwner,
		Present:      m.Present(),
	}
}

// Availability describes whether a room can be joined.
type Availability string

const (
	AvailabilityOpen  Availability = "OPEN"
	AvailabilityFull  Availability = "FULL"
	AvailabilityEnded Availability = "ENDED"
)

// Preview is the pre-join room summary.
type Preview struct {
	Code             string       `json:"code"`
	Title            string       `json:"title"`
	OwnerName        string       `json:"ownerName"`
	OwnerPresent     bool         `json:"ownerPresent"`
	ParticipantCount int          `json:"participantCount"`
	Availability     Availability `json:"availability"`
	StreamState      string       `json:"streamState"`
}
