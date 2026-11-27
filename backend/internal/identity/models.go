package identity

import (
	"strings"
	"time"
)

// GuestIdentity is a durable anonymous identity tied to an owner of rooms.
// Ownership is bound to this UUID, never to a display name or device.
type GuestIdentity struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Avatar    string    `json:"avatar"`
	Language  string    `json:"language"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// RefreshSession is a rotating opaque refresh credential. Only the hash of the
// token is ever stored.
type RefreshSession struct {
	ID         string     `json:"id"`
	IdentityID string     `json:"identityId"`
	TokenHash  string     `json:"-"`
	ExpiresAt  time.Time  `json:"expiresAt"`
	RevokedAt  *time.Time `json:"revokedAt,omitempty"`
	CreatedAt  time.Time  `json:"createdAt"`
}

const (
	maxNameLength     = 48
	maxAvatarLength   = 32
	maxLanguageLength = 16
)

// Profile is the mutable, validated part of a guest identity.
type Profile struct {
	Name     string
	Avatar   string
	Language string
}

// NewProfile trims and validates user supplied profile fields.
func NewProfile(name, avatar, language string) (Profile, error) {
	profile := Profile{
		Name:     strings.TrimSpace(name),
		Avatar:   strings.TrimSpace(avatar),
		Language: strings.TrimSpace(language),
	}
	if profile.Name == "" {
		return Profile{}, ErrInvalidProfile
	}
	if len([]rune(profile.Name)) > maxNameLength {
		return Profile{}, ErrInvalidProfile
	}
	if profile.Avatar == "" || len(profile.Avatar) > maxAvatarLength {
		return Profile{}, ErrInvalidProfile
	}
	if profile.Language == "" || len(profile.Language) > maxLanguageLength {
		return Profile{}, ErrInvalidProfile
	}
	return profile, nil
}
