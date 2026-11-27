package memory

import (
	"context"
	"sync"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/events"
	"github.com/mintturtle/watchparty/backend/internal/room"
)

// RoomStore is an in-memory room.Repository.
type RoomStore struct {
	mu          sync.Mutex
	rooms       map[string]room.Room
	codes       map[string]string
	memberships map[string][]room.Membership
	outbox      *Outbox
}

// NewRoomStore creates an empty room store. When outbox is non-nil, persisted
// events are appended to it.
func NewRoomStore(outbox *Outbox) *RoomStore {
	return &RoomStore{
		rooms:       make(map[string]room.Room),
		codes:       make(map[string]string),
		memberships: make(map[string][]room.Membership),
		outbox:      outbox,
	}
}

func (s *RoomStore) CreateRoomWithOwner(ctx context.Context, r room.Room, owner room.Membership, event *events.Event) error {
	s.mu.Lock()
	s.rooms[r.ID] = r
	s.codes[r.Code] = r.ID
	s.memberships[r.ID] = []room.Membership{owner}
	s.mu.Unlock()
	return s.append(ctx, event)
}

func (s *RoomStore) GetRoomByCode(_ context.Context, code string) (room.Room, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	id, ok := s.codes[code]
	if !ok {
		return room.Room{}, room.ErrNotFound
	}
	return s.rooms[id], nil
}

func (s *RoomStore) GetRoomByID(_ context.Context, id string) (room.Room, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	r, ok := s.rooms[id]
	if !ok {
		return room.Room{}, room.ErrNotFound
	}
	return r, nil
}

func (s *RoomStore) ListActiveRoomIDs(_ context.Context, _ time.Time) ([]string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	ids := make([]string, 0, len(s.rooms))
	for id, r := range s.rooms {
		if !r.Ended() {
			ids = append(ids, id)
		}
	}
	return ids, nil
}

func (s *RoomStore) ListMemberships(_ context.Context, roomID string) ([]room.Membership, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]room.Membership(nil), s.memberships[roomID]...), nil
}

func (s *RoomStore) GetMembership(_ context.Context, roomID, identityID string) (room.Membership, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, m := range s.memberships[roomID] {
		if m.IdentityID == identityID {
			return m, nil
		}
	}
	return room.Membership{}, room.ErrNotFound
}

func (s *RoomStore) GetMembershipByID(_ context.Context, roomID, membershipID string) (room.Membership, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, m := range s.memberships[roomID] {
		if m.ID == membershipID {
			return m, nil
		}
	}
	return room.Membership{}, room.ErrNotFound
}

func (s *RoomStore) FindActiveMembershipByIdentity(_ context.Context, identityID string, now time.Time) (room.Membership, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, members := range s.memberships {
		for _, m := range members {
			if m.IdentityID == identityID && m.SeatHeld(now) {
				return m, nil
			}
		}
	}
	return room.Membership{}, room.ErrNotFound
}

func (s *RoomStore) JoinRoom(ctx context.Context, membership room.Membership, evts ...*events.Event) error {
	s.mu.Lock()
	members := s.memberships[membership.RoomID]
	replaced := false
	for i, m := range members {
		if m.IdentityID == membership.IdentityID {
			members[i] = membership
			replaced = true
			break
		}
	}
	if !replaced {
		members = append(members, membership)
	}
	s.memberships[membership.RoomID] = members
	s.mu.Unlock()
	return s.append(ctx, evts...)
}

func (s *RoomStore) UpdateMembership(ctx context.Context, membership room.Membership, evts ...*events.Event) error {
	s.mu.Lock()
	members := s.memberships[membership.RoomID]
	found := false
	for i, m := range members {
		if m.ID == membership.ID {
			members[i] = membership
			found = true
			break
		}
	}
	if !found {
		s.mu.Unlock()
		return room.ErrNotFound
	}
	s.memberships[membership.RoomID] = members
	s.mu.Unlock()
	return s.append(ctx, evts...)
}

func (s *RoomStore) MarkRoomEnded(ctx context.Context, roomID string, endedAt, tombstoneUntil time.Time, event *events.Event) error {
	s.mu.Lock()
	r, ok := s.rooms[roomID]
	if !ok {
		s.mu.Unlock()
		return room.ErrNotFound
	}
	r.EndedAt = &endedAt
	r.TombstoneUntil = &tombstoneUntil
	s.rooms[roomID] = r
	s.mu.Unlock()
	return s.append(ctx, event)
}

func (s *RoomStore) PurgeTombstones(_ context.Context, before time.Time) ([]string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var purged []string
	for id, r := range s.rooms {
		if r.TombstoneUntil != nil && before.After(*r.TombstoneUntil) {
			purged = append(purged, id)
			delete(s.rooms, id)
			delete(s.codes, r.Code)
			delete(s.memberships, id)
		}
	}
	return purged, nil
}

func (s *RoomStore) append(ctx context.Context, evts ...*events.Event) error {
	if s.outbox == nil {
		return nil
	}
	for _, event := range evts {
		if event == nil {
			continue
		}
		if err := s.outbox.Append(ctx, *event); err != nil {
			return err
		}
	}
	return nil
}
