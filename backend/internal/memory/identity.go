package memory

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/identity"
)

// IdentityStore is an in-memory identity.Repository used for tests and local
// development.
type IdentityStore struct {
	mu         sync.RWMutex
	identities map[string]identity.GuestIdentity
	sessions   map[string]identity.RefreshSession
	byHash     map[string]string
}

// NewIdentityStore creates an empty identity store.
func NewIdentityStore() *IdentityStore {
	return &IdentityStore{
		identities: make(map[string]identity.GuestIdentity),
		sessions:   make(map[string]identity.RefreshSession),
		byHash:     make(map[string]string),
	}
}

func (s *IdentityStore) CreateIdentityWithSession(_ context.Context, guest identity.GuestIdentity, session identity.RefreshSession) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, exists := s.identities[guest.ID]; exists {
		return fmt.Errorf("identity %s already exists", guest.ID)
	}
	s.identities[guest.ID] = guest
	s.sessions[session.ID] = session
	s.byHash[session.TokenHash] = session.ID
	return nil
}

func (s *IdentityStore) GetIdentity(_ context.Context, id string) (identity.GuestIdentity, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	guest, ok := s.identities[id]
	if !ok {
		return identity.GuestIdentity{}, identity.ErrNotFound
	}
	return guest, nil
}

func (s *IdentityStore) UpdateIdentityProfile(_ context.Context, id string, profile identity.Profile, updatedAt time.Time) (identity.GuestIdentity, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	guest, ok := s.identities[id]
	if !ok {
		return identity.GuestIdentity{}, identity.ErrNotFound
	}
	guest.Name = profile.Name
	guest.Avatar = profile.Avatar
	guest.Language = profile.Language
	guest.UpdatedAt = updatedAt
	s.identities[id] = guest
	return guest, nil
}

func (s *IdentityStore) CreateRefreshSession(_ context.Context, session identity.RefreshSession) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sessions[session.ID] = session
	s.byHash[session.TokenHash] = session.ID
	return nil
}

func (s *IdentityStore) GetRefreshSessionByHash(_ context.Context, tokenHash string) (identity.RefreshSession, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	id, ok := s.byHash[tokenHash]
	if !ok {
		return identity.RefreshSession{}, identity.ErrNotFound
	}
	return s.sessions[id], nil
}

func (s *IdentityStore) RevokeRefreshSession(_ context.Context, sessionID string, revokedAt time.Time) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	session, ok := s.sessions[sessionID]
	if !ok {
		return identity.ErrNotFound
	}
	if session.RevokedAt == nil {
		session.RevokedAt = &revokedAt
	}
	s.sessions[sessionID] = session
	return nil
}

func (s *IdentityStore) RevokeAllRefreshSessions(_ context.Context, identityID string, revokedAt time.Time) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for id, session := range s.sessions {
		if session.IdentityID == identityID && session.RevokedAt == nil {
			session.RevokedAt = &revokedAt
			s.sessions[id] = session
		}
	}
	return nil
}
