package room

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/events"
	"github.com/mintturtle/watchparty/backend/internal/platform"
	"github.com/mintturtle/watchparty/backend/internal/stream"
)

// StreamStateReader exposes the shared stream state for previews.
type StreamStateReader interface {
	CurrentState(ctx context.Context, roomID string) (stream.State, error)
}

// ResourceCloser releases room-scoped external resources such as a LiveKit
// room. Failures are non-blocking for room lifecycle.
type ResourceCloser interface {
	CloseRoomResources(ctx context.Context, roomID string) error
}

// Service owns room lifecycle, membership, ownership, and previews.
type Service struct {
	repo      Repository
	streams   StreamStateReader
	clock     platform.Clock
	grace     time.Duration
	tombstone time.Duration
	closer    ResourceCloser
}

// NewService builds the room service.
func NewService(repo Repository, streams StreamStateReader, clock platform.Clock, grace, tombstone time.Duration) *Service {
	return &Service{repo: repo, streams: streams, clock: clock, grace: grace, tombstone: tombstone}
}

// WithCloser attaches an optional external resource closer.
func (s *Service) WithCloser(closer ResourceCloser) *Service {
	s.closer = closer
	return s
}

// SetStreams attaches the shared stream state reader used by previews. It is
// separate from construction to break the room/stream construction cycle.
func (s *Service) SetStreams(streams StreamStateReader) {
	s.streams = streams
}

// Create opens a room and joins the creator as owner.
func (s *Service) Create(ctx context.Context, ownerIdentityID, ownerName, ownerAvatar, title string) (Room, Membership, error) {
	now := s.clock.Now()
	code, err := s.uniqueCode(ctx)
	if err != nil {
		return Room{}, Membership{}, err
	}
	r := Room{
		ID:              platform.NewID(),
		Code:            code,
		Title:           titleFor(ownerName, title),
		OwnerIdentityID: ownerIdentityID,
		CreatedAt:       now,
	}
	owner := Membership{
		ID:             platform.NewID(),
		RoomID:         r.ID,
		IdentityID:     ownerIdentityID,
		DisplayName:    ownerName,
		Avatar:         ownerAvatar,
		IsOwner:        true,
		JoinedAt:       now,
		GraceExpiresAt: s.pendingDeadline(now),
	}
	event, err := events.New(r.ID, events.TopicRoomCreated, map[string]any{
		"roomId": r.ID,
		"code":   r.Code,
		"title":  r.Title,
		"owner":  owner.Summary(),
	}, now)
	if err != nil {
		return Room{}, Membership{}, err
	}
	if err := s.repo.CreateRoomWithOwner(ctx, r, owner, event); err != nil {
		return Room{}, Membership{}, err
	}
	return r, owner, nil
}

// Preview returns the pre-join summary for a party code.
func (s *Service) Preview(ctx context.Context, rawCode string) (Preview, error) {
	code, err := NormalizeCode(rawCode)
	if err != nil {
		return Preview{}, ErrNotFound
	}
	r, err := s.repo.GetRoomByCode(ctx, code)
	if err != nil {
		return Preview{}, err
	}
	now := s.clock.Now()
	if r.TombstoneUntil != nil && !now.Before(*r.TombstoneUntil) {
		return Preview{}, ErrNotFound
	}
	memberships, err := s.repo.ListMemberships(ctx, r.ID)
	if err != nil {
		return Preview{}, err
	}
	preview := Preview{Code: r.Code, Title: r.Title, StreamState: string(stream.StateEmpty)}
	guests := 0
	for _, m := range memberships {
		if m.IsOwner {
			preview.OwnerName = m.DisplayName
		}
		if !m.SeatHeld(now) {
			continue
		}
		preview.ParticipantCount++
		if m.IsOwner {
			preview.OwnerPresent = m.Connected()
		} else {
			guests++
		}
	}
	switch {
	case r.Ended():
		preview.Availability = AvailabilityEnded
	case guests >= GuestLimit:
		preview.Availability = AvailabilityFull
	default:
		preview.Availability = AvailabilityOpen
	}
	if s.streams != nil {
		if state, err := s.streams.CurrentState(ctx, r.ID); err == nil {
			preview.StreamState = string(state)
		}
	}
	return preview, nil
}

// Join admits an identity to a room, reactivating a prior membership when one
// exists. The owner always keeps a reserved seat.
func (s *Service) Join(ctx context.Context, rawCode, identityID, displayName, avatar string) (Room, Membership, error) {
	code, err := NormalizeCode(rawCode)
	if err != nil {
		return Room{}, Membership{}, ErrNotFound
	}
	r, err := s.repo.GetRoomByCode(ctx, code)
	if err != nil {
		return Room{}, Membership{}, err
	}
	if r.Ended() {
		return Room{}, Membership{}, ErrEnded
	}
	now := s.clock.Now()

	active, err := s.repo.FindActiveMembershipByIdentity(ctx, identityID, now)
	switch {
	case err == nil:
		if active.RoomID != r.ID {
			return Room{}, Membership{}, ErrAlreadyInRoom
		}
		return r, active, nil
	case !errors.Is(err, ErrNotFound):
		return Room{}, Membership{}, err
	}

	existing, err := s.repo.GetMembership(ctx, r.ID, identityID)
	var membership Membership
	isOwner := false
	switch {
	case err == nil:
		isOwner = existing.IsOwner
		membership = existing
		membership.DisplayName = displayName
		membership.Avatar = avatar
		membership.LeftAt = nil
		membership.GraceExpiresAt = s.pendingDeadline(now)
		membership.JoinedAt = now
	case errors.Is(err, ErrNotFound):
		membership = Membership{
			ID:             platform.NewID(),
			RoomID:         r.ID,
			IdentityID:     identityID,
			DisplayName:    displayName,
			Avatar:         avatar,
			JoinedAt:       now,
			GraceExpiresAt: s.pendingDeadline(now),
		}
	default:
		return Room{}, Membership{}, err
	}

	if !isOwner {
		memberships, err := s.repo.ListMemberships(ctx, r.ID)
		if err != nil {
			return Room{}, Membership{}, err
		}
		guests := 0
		for _, m := range memberships {
			if m.IsOwner || m.IdentityID == identityID {
				continue
			}
			if m.SeatHeld(now) {
				guests++
			}
		}
		if guests >= GuestLimit {
			return Room{}, Membership{}, ErrFull
		}
	}

	summary := membership.Summary()
	summary.Present = true
	event, err := events.New(r.ID, events.TopicMemberJoined, map[string]any{"member": summary}, now)
	if err != nil {
		return Room{}, Membership{}, err
	}
	if err := s.repo.JoinRoom(ctx, membership, event); err != nil {
		return Room{}, Membership{}, err
	}
	return r, membership, nil
}

// Leave removes a member immediately. When the last seat is released the room
// closes and a preview-safe tombstone is retained.
func (s *Service) Leave(ctx context.Context, roomID, identityID string) (bool, error) {
	m, err := s.repo.GetMembership(ctx, roomID, identityID)
	if err != nil {
		return false, ErrNotMember
	}
	if m.LeftAt != nil {
		return false, nil
	}
	now := s.clock.Now()
	m.LeftAt = &now
	m.WSConnected = false
	m.LiveKitConnected = false
	m.GraceExpiresAt = nil
	event, err := events.New(roomID, events.TopicMemberLeft, map[string]any{"member": m.Summary()}, now)
	if err != nil {
		return false, err
	}
	evts := []*events.Event{event}
	if m.IsOwner {
		// A leaving owner keeps their seat open but is no longer present; clients
		// surface the owner-away state until the same owner rejoins.
		ownerEvent, err := events.New(roomID, events.TopicOwnerPresence, map[string]any{
			"present":   false,
			"ownerName": m.DisplayName,
		}, now)
		if err != nil {
			return false, err
		}
		evts = append(evts, ownerEvent)
	}
	if err := s.repo.UpdateMembership(ctx, m, evts...); err != nil {
		return false, err
	}
	return s.closeIfEmpty(ctx, roomID, now)
}

// MarkConnected records a room socket attachment and clears any grace period.
func (s *Service) MarkConnected(ctx context.Context, roomID, identityID string) (Membership, error) {
	return s.updatePresence(ctx, roomID, identityID, func(m *Membership, _ time.Time) bool {
		m.WSConnected = true
		m.GraceExpiresAt = nil
		return true
	})
}

// MarkDisconnected records a room socket detachment and starts the grace period
// unless LiveKit voice is still attached.
func (s *Service) MarkDisconnected(ctx context.Context, roomID, identityID string) (Membership, error) {
	return s.updatePresence(ctx, roomID, identityID, func(m *Membership, now time.Time) bool {
		m.WSConnected = false
		if !m.LiveKitConnected {
			grace := now.Add(s.grace)
			m.GraceExpiresAt = &grace
		}
		return true
	})
}

// SetVoiceConnected records LiveKit voice attachment, which keeps a member
// present while the app is backgrounded. The identity is a membership ID
// because that is what LiveKit reports for a participant.
func (s *Service) SetVoiceConnected(ctx context.Context, roomID, membershipID string, connected bool) (Membership, error) {
	return s.updatePresenceByMembershipID(ctx, roomID, membershipID, func(m *Membership, now time.Time) bool {
		m.LiveKitConnected = connected
		if connected {
			m.GraceExpiresAt = nil
		} else if !m.WSConnected {
			grace := now.Add(s.grace)
			m.GraceExpiresAt = &grace
		}
		return true
	})
}

// Get returns a room by ID.
func (s *Service) Get(ctx context.Context, roomID string) (Room, error) {
	return s.repo.GetRoomByID(ctx, roomID)
}

// GetByCode returns a room by party code.
func (s *Service) GetByCode(ctx context.Context, rawCode string) (Room, error) {
	code, err := NormalizeCode(rawCode)
	if err != nil {
		return Room{}, ErrNotFound
	}
	return s.repo.GetRoomByCode(ctx, code)
}

// Memberships lists a room's memberships.
func (s *Service) Memberships(ctx context.Context, roomID string) ([]Membership, error) {
	return s.repo.ListMemberships(ctx, roomID)
}

// Membership returns a single membership.
func (s *Service) Membership(ctx context.Context, roomID, identityID string) (Membership, error) {
	return s.repo.GetMembership(ctx, roomID, identityID)
}

// CanManageStream implements stream.RoomAuthorization. Only the present owner
// may start or abort the shared stream.
func (s *Service) CanManageStream(ctx context.Context, roomID, identityID string) (bool, error) {
	r, err := s.repo.GetRoomByID(ctx, roomID)
	if err != nil {
		return false, ErrNotFound
	}
	if r.Ended() {
		return false, nil
	}
	m, err := s.repo.GetMembership(ctx, roomID, identityID)
	if err != nil {
		return false, nil
	}
	return m.IsOwner && m.Present(), nil
}

// CloseRoom marks a room ended and retains a tombstone. It is idempotent.
func (s *Service) CloseRoom(ctx context.Context, roomID string) error {
	r, err := s.repo.GetRoomByID(ctx, roomID)
	if err != nil {
		return err
	}
	if r.Ended() {
		return nil
	}
	now := s.clock.Now()
	tombstoneUntil := now.Add(s.tombstone)
	event, err := events.New(roomID, events.TopicRoomClosed, map[string]any{
		"closedAt":       now,
		"tombstoneUntil": tombstoneUntil,
	}, now)
	if err != nil {
		return err
	}
	if err := s.repo.MarkRoomEnded(ctx, roomID, now, tombstoneUntil, event); err != nil {
		return err
	}
	if s.closer != nil {
		// External resource cleanup must never block room closure.
		_ = s.closer.CloseRoomResources(ctx, roomID)
	}
	return nil
}

// Reconcile purges expired tombstones and closes rooms whose seats have all
// lapsed past the disconnect grace period.
func (s *Service) Reconcile(ctx context.Context) error {
	now := s.clock.Now()
	if _, err := s.repo.PurgeTombstones(ctx, now); err != nil {
		return err
	}
	roomIDs, err := s.repo.ListActiveRoomIDs(ctx, now)
	if err != nil {
		return err
	}
	for _, roomID := range roomIDs {
		if _, err := s.closeIfEmpty(ctx, roomID, now); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) closeIfEmpty(ctx context.Context, roomID string, now time.Time) (bool, error) {
	memberships, err := s.repo.ListMemberships(ctx, roomID)
	if err != nil {
		return false, err
	}
	for _, m := range memberships {
		if m.SeatHeld(now) {
			return false, nil
		}
	}
	if err := s.CloseRoom(ctx, roomID); err != nil {
		return false, err
	}
	return true, nil
}

func (s *Service) updatePresence(ctx context.Context, roomID, identityID string, mutate func(*Membership, time.Time) bool) (Membership, error) {
	return s.updatePresenceWith(ctx, roomID, func() (Membership, error) {
		return s.repo.GetMembership(ctx, roomID, identityID)
	}, mutate)
}

// updatePresenceByMembershipID applies a presence change resolved by membership
// ID, which is the identity LiveKit reports for a participant.
func (s *Service) updatePresenceByMembershipID(ctx context.Context, roomID, membershipID string, mutate func(*Membership, time.Time) bool) (Membership, error) {
	return s.updatePresenceWith(ctx, roomID, func() (Membership, error) {
		return s.repo.GetMembershipByID(ctx, roomID, membershipID)
	}, mutate)
}

func (s *Service) updatePresenceWith(ctx context.Context, roomID string, fetch func() (Membership, error), mutate func(*Membership, time.Time) bool) (Membership, error) {
	m, err := fetch()
	if err != nil {
		return Membership{}, err
	}
	if m.LeftAt != nil {
		return Membership{}, ErrNotMember
	}
	now := s.clock.Now()
	wasPresent := m.Present()
	mutate(&m, now)
	isPresent := m.Present()

	var evts []*events.Event
	if wasPresent != isPresent {
		topic := events.TopicMemberReturned
		if !isPresent {
			topic = events.TopicMemberAbsent
		}
		event, err := events.New(roomID, topic, map[string]any{"member": m.Summary()}, now)
		if err != nil {
			return Membership{}, err
		}
		evts = append(evts, event)
		if m.IsOwner {
			ownerEvent, err := events.New(roomID, events.TopicOwnerPresence, map[string]any{
				"present":   isPresent,
				"ownerName": m.DisplayName,
			}, now)
			if err != nil {
				return Membership{}, err
			}
			evts = append(evts, ownerEvent)
		}
	}
	if err := s.repo.UpdateMembership(ctx, m, evts...); err != nil {
		return Membership{}, err
	}
	return m, nil
}

func (s *Service) pendingDeadline(now time.Time) *time.Time {
	deadline := now.Add(s.grace)
	return &deadline
}

func (s *Service) uniqueCode(ctx context.Context) (string, error) {
	for attempt := 0; attempt < 5; attempt++ {
		code, err := NewCode()
		if err != nil {
			return "", err
		}
		_, err = s.repo.GetRoomByCode(ctx, code)
		if errors.Is(err, ErrNotFound) {
			return code, nil
		}
		if err != nil {
			return "", err
		}
	}
	return "", ErrDuplicateCode
}

func titleFor(ownerName, title string) string {
	if trimmed := strings.TrimSpace(title); trimmed != "" {
		return trimmed
	}
	name := strings.TrimSpace(ownerName)
	if name == "" {
		name = "Guest"
	}
	return name + "'s party"
}
