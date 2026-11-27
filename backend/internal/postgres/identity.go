package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"

	"github.com/mintturtle/watchparty/backend/internal/identity"
)

// CreateIdentityWithSession implements identity.Repository.
func (s *Store) CreateIdentityWithSession(ctx context.Context, guest identity.GuestIdentity, session identity.RefreshSession) error {
	return s.inTx(ctx, func(tx pgx.Tx) error {
		if _, err := tx.Exec(ctx,
			`INSERT INTO identities (id, name, avatar, language, created_at, updated_at)
			 VALUES ($1, $2, $3, $4, $5, $6)`,
			guest.ID, guest.Name, guest.Avatar, guest.Language, guest.CreatedAt, guest.UpdatedAt,
		); err != nil {
			return err
		}
		return insertRefreshSession(ctx, tx, session)
	})
}

// GetIdentity implements identity.Repository.
func (s *Store) GetIdentity(ctx context.Context, id string) (identity.GuestIdentity, error) {
	var guest identity.GuestIdentity
	err := s.pool.QueryRow(ctx,
		`SELECT id, name, avatar, language, created_at, updated_at FROM identities WHERE id = $1`,
		id,
	).Scan(&guest.ID, &guest.Name, &guest.Avatar, &guest.Language, &guest.CreatedAt, &guest.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return identity.GuestIdentity{}, identity.ErrNotFound
	}
	return guest, err
}

// UpdateIdentityProfile implements identity.Repository.
func (s *Store) UpdateIdentityProfile(ctx context.Context, id string, profile identity.Profile, updatedAt time.Time) (identity.GuestIdentity, error) {
	var guest identity.GuestIdentity
	err := s.pool.QueryRow(ctx,
		`UPDATE identities SET name = $2, avatar = $3, language = $4, updated_at = $5
		 WHERE id = $1
		 RETURNING id, name, avatar, language, created_at, updated_at`,
		id, profile.Name, profile.Avatar, profile.Language, updatedAt,
	).Scan(&guest.ID, &guest.Name, &guest.Avatar, &guest.Language, &guest.CreatedAt, &guest.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return identity.GuestIdentity{}, identity.ErrNotFound
	}
	return guest, err
}

// CreateRefreshSession implements identity.Repository.
func (s *Store) CreateRefreshSession(ctx context.Context, session identity.RefreshSession) error {
	return s.inTx(ctx, func(tx pgx.Tx) error {
		return insertRefreshSession(ctx, tx, session)
	})
}

// GetRefreshSessionByHash implements identity.Repository.
func (s *Store) GetRefreshSessionByHash(ctx context.Context, tokenHash string) (identity.RefreshSession, error) {
	var session identity.RefreshSession
	err := s.pool.QueryRow(ctx,
		`SELECT id, identity_id, token_hash, expires_at, revoked_at, created_at
		 FROM refresh_sessions WHERE token_hash = $1`,
		tokenHash,
	).Scan(&session.ID, &session.IdentityID, &session.TokenHash, &session.ExpiresAt, &session.RevokedAt, &session.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return identity.RefreshSession{}, identity.ErrNotFound
	}
	return session, err
}

// RevokeRefreshSession implements identity.Repository.
func (s *Store) RevokeRefreshSession(ctx context.Context, sessionID string, revokedAt time.Time) error {
	_, err := s.pool.Exec(ctx,
		`UPDATE refresh_sessions SET revoked_at = $2 WHERE id = $1 AND revoked_at IS NULL`,
		sessionID, revokedAt,
	)
	return err
}

// RevokeAllRefreshSessions implements identity.Repository.
func (s *Store) RevokeAllRefreshSessions(ctx context.Context, identityID string, revokedAt time.Time) error {
	_, err := s.pool.Exec(ctx,
		`UPDATE refresh_sessions SET revoked_at = $2 WHERE identity_id = $1 AND revoked_at IS NULL`,
		identityID, revokedAt,
	)
	return err
}

func insertRefreshSession(ctx context.Context, tx pgx.Tx, session identity.RefreshSession) error {
	_, err := tx.Exec(ctx,
		`INSERT INTO refresh_sessions (id, identity_id, token_hash, expires_at, revoked_at, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		session.ID, session.IdentityID, session.TokenHash, session.ExpiresAt, session.RevokedAt, session.CreatedAt,
	)
	return err
}
