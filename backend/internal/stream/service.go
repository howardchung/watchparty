package stream

import (
	"context"
	"errors"
	"net/url"
	"strings"

	"github.com/mintturtle/watchparty/backend/internal/events"
	"github.com/mintturtle/watchparty/backend/internal/platform"
)

const maxURLLength = 2048

// Service owns shared stream transitions. Playback position, pause, seek, and
// volume are client-local and never reach this service.
type Service struct {
	repo  Repository
	rooms RoomAuthorization
	clock platform.Clock
}

// NewService builds the stream service.
func NewService(repo Repository, rooms RoomAuthorization, clock platform.Clock) *Service {
	return &Service{repo: repo, rooms: rooms, clock: clock}
}

// Current returns the stream for a room, defaulting to EMPTY when absent.
func (s *Service) Current(ctx context.Context, roomID string) (Stream, error) {
	current, err := s.repo.Get(ctx, roomID)
	if errors.Is(err, ErrNotFound) {
		return Stream{RoomID: roomID, State: StateEmpty}, nil
	}
	return current, err
}

// CurrentState returns just the stream state for a room.
func (s *Service) CurrentState(ctx context.Context, roomID string) (State, error) {
	current, err := s.Current(ctx, roomID)
	if err != nil {
		return "", err
	}
	return current.State, nil
}

// Start begins a new stream session for a room. Only the present owner may
// start, and an active stream must be aborted first.
func (s *Service) Start(ctx context.Context, roomID, identityID, rawURL string) (Stream, error) {
	allowed, err := s.rooms.CanManageStream(ctx, roomID, identityID)
	if err != nil {
		return Stream{}, err
	}
	if !allowed {
		return Stream{}, ErrForbidden
	}
	normalized, err := normalizeURL(rawURL)
	if err != nil {
		return Stream{}, err
	}
	existing, err := s.repo.Get(ctx, roomID)
	if err != nil && !errors.Is(err, ErrNotFound) {
		return Stream{}, err
	}
	if existing.State == StateActive {
		return Stream{}, ErrActive
	}
	now := s.clock.Now()
	next := Stream{
		ID:        platform.NewID(),
		RoomID:    roomID,
		SessionID: platform.NewID(),
		Revision:  existing.Revision + 1,
		State:     StateActive,
		URL:       normalized,
		StartedAt: &now,
		UpdatedAt: now,
	}
	event, err := events.New(roomID, events.TopicStreamStarted, map[string]any{
		"streamSessionId": next.SessionID,
		"revision":        next.Revision,
		"url":             next.URL,
		"startedAt":       now,
	}, now)
	if err != nil {
		return Stream{}, err
	}
	if err := s.repo.Save(ctx, next, event); err != nil {
		return Stream{}, err
	}
	return next, nil
}

// Abort stops the shared stream for everyone. Membership, presence, and voice
// are untouched.
func (s *Service) Abort(ctx context.Context, roomID, identityID string) (Stream, error) {
	allowed, err := s.rooms.CanManageStream(ctx, roomID, identityID)
	if err != nil {
		return Stream{}, err
	}
	if !allowed {
		return Stream{}, ErrForbidden
	}
	existing, err := s.repo.Get(ctx, roomID)
	if errors.Is(err, ErrNotFound) {
		return Stream{}, ErrNoActiveStream
	}
	if err != nil {
		return Stream{}, err
	}
	if existing.State != StateActive {
		return Stream{}, ErrNoActiveStream
	}
	now := s.clock.Now()
	existing.State = StateAborted
	existing.AbortedAt = &now
	existing.Revision++
	existing.UpdatedAt = now
	event, err := events.New(roomID, events.TopicStreamAborted, map[string]any{
		"streamSessionId": existing.SessionID,
		"revision":        existing.Revision,
		"url":             existing.URL,
		"abortedAt":       now,
	}, now)
	if err != nil {
		return Stream{}, err
	}
	if err := s.repo.Save(ctx, existing, event); err != nil {
		return Stream{}, err
	}
	return existing, nil
}

func normalizeURL(raw string) (string, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" || len(trimmed) > maxURLLength {
		return "", ErrInvalidURL
	}
	parsed, err := url.Parse(trimmed)
	if err != nil {
		return "", ErrInvalidURL
	}
	if !strings.EqualFold(parsed.Scheme, "https") || parsed.Host == "" {
		return "", ErrInvalidURL
	}
	return parsed.String(), nil
}
