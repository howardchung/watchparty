package identity

import (
	"context"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/platform"
)

// Session is a freshly issued credential pair for a guest identity.
type Session struct {
	Identity         GuestIdentity
	AccessToken      string
	AccessExpiresAt  time.Time
	RefreshToken     string
	RefreshExpiresAt time.Time
}

// Service implements guest identity, token rotation, and profile updates.
type Service struct {
	repo       Repository
	tokens     *TokenManager
	clock      platform.Clock
	refreshTTL time.Duration
}

// NewService builds the identity service.
func NewService(repo Repository, tokens *TokenManager, clock platform.Clock, refreshTTL time.Duration) *Service {
	return &Service{repo: repo, tokens: tokens, clock: clock, refreshTTL: refreshTTL}
}

// Create registers a durable anonymous identity and returns its credential pair.
func (s *Service) Create(ctx context.Context, name, avatar, language string) (Session, error) {
	profile, err := NewProfile(name, avatar, language)
	if err != nil {
		return Session{}, err
	}
	now := s.clock.Now()
	guest := GuestIdentity{
		ID:        platform.NewID(),
		Name:      profile.Name,
		Avatar:    profile.Avatar,
		Language:  profile.Language,
		CreatedAt: now,
		UpdatedAt: now,
	}
	return s.issueSession(ctx, guest, now, true)
}

// Refresh rotates a refresh token: the presented token is revoked and a new
// session is issued. Reuse of an already revoked token revokes every session
// for the identity.
func (s *Service) Refresh(ctx context.Context, refreshToken string) (Session, error) {
	hash := HashRefreshToken(refreshToken)
	session, err := s.repo.GetRefreshSessionByHash(ctx, hash)
	if err != nil {
		return Session{}, ErrInvalidToken
	}
	now := s.clock.Now()
	if session.RevokedAt != nil {
		_ = s.repo.RevokeAllRefreshSessions(ctx, session.IdentityID, now)
		return Session{}, ErrSessionRevoked
	}
	if !now.Before(session.ExpiresAt) {
		return Session{}, ErrSessionExpired
	}
	guest, err := s.repo.GetIdentity(ctx, session.IdentityID)
	if err != nil {
		return Session{}, err
	}
	if err := s.repo.RevokeRefreshSession(ctx, session.ID, now); err != nil {
		return Session{}, err
	}
	return s.issueSession(ctx, guest, now, false)
}

// Revoke invalidates a refresh token. Unknown tokens are treated as already
// revoked so callers cannot probe for validity.
func (s *Service) Revoke(ctx context.Context, refreshToken string) error {
	hash := HashRefreshToken(refreshToken)
	session, err := s.repo.GetRefreshSessionByHash(ctx, hash)
	if err != nil {
		return nil
	}
	if session.RevokedAt != nil {
		return nil
	}
	return s.repo.RevokeRefreshSession(ctx, session.ID, s.clock.Now())
}

// UpdateProfile validates and stores a new profile for an identity.
func (s *Service) UpdateProfile(ctx context.Context, identityID, name, avatar, language string) (GuestIdentity, error) {
	profile, err := NewProfile(name, avatar, language)
	if err != nil {
		return GuestIdentity{}, err
	}
	return s.repo.UpdateIdentityProfile(ctx, identityID, profile, s.clock.Now())
}

// Identity returns the identity for an ID.
func (s *Service) Identity(ctx context.Context, id string) (GuestIdentity, error) {
	return s.repo.GetIdentity(ctx, id)
}

// Authenticate validates an access token and returns the identity ID.
func (s *Service) Authenticate(rawAccessToken string) (string, error) {
	return s.tokens.ParseAccess(rawAccessToken)
}

func (s *Service) issueSession(ctx context.Context, guest GuestIdentity, now time.Time, withIdentity bool) (Session, error) {
	rawRefresh, refreshHash, err := NewRefreshToken()
	if err != nil {
		return Session{}, err
	}
	refreshExpiresAt := now.Add(s.refreshTTL)
	session := RefreshSession{
		ID:         platform.NewID(),
		IdentityID: guest.ID,
		TokenHash:  refreshHash,
		ExpiresAt:  refreshExpiresAt,
		CreatedAt:  now,
	}
	if withIdentity {
		if err := s.repo.CreateIdentityWithSession(ctx, guest, session); err != nil {
			return Session{}, err
		}
	} else if err := s.repo.CreateRefreshSession(ctx, session); err != nil {
		return Session{}, err
	}
	access, accessExpiresAt, err := s.tokens.IssueAccess(guest.ID)
	if err != nil {
		return Session{}, err
	}
	return Session{
		Identity:         guest,
		AccessToken:      access,
		AccessExpiresAt:  accessExpiresAt,
		RefreshToken:     rawRefresh,
		RefreshExpiresAt: refreshExpiresAt,
	}, nil
}
