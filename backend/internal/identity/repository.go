package identity

import (
	"context"
	"time"
)

// Repository persists guest identities and refresh sessions.
type Repository interface {
	// CreateIdentityWithSession atomically creates an identity and its first
	// refresh session.
	CreateIdentityWithSession(ctx context.Context, identity GuestIdentity, session RefreshSession) error
	GetIdentity(ctx context.Context, id string) (GuestIdentity, error)
	UpdateIdentityProfile(ctx context.Context, id string, profile Profile, updatedAt time.Time) (GuestIdentity, error)

	CreateRefreshSession(ctx context.Context, session RefreshSession) error
	GetRefreshSessionByHash(ctx context.Context, tokenHash string) (RefreshSession, error)
	RevokeRefreshSession(ctx context.Context, sessionID string, revokedAt time.Time) error
	RevokeAllRefreshSessions(ctx context.Context, identityID string, revokedAt time.Time) error
}
