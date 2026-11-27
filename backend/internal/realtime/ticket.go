// Package realtime owns WebSocket presence, playback telemetry, and explicit
// sync-to-leader calculation. Playback telemetry is bounded in memory and is
// never persisted.
package realtime

import (
	"errors"
	"sync"
	"time"
)

var (
	// ErrTicketNotFound is returned when a realtime ticket is unknown.
	ErrTicketNotFound = errors.New("realtime ticket not found")
	// ErrTicketExpired is returned when a realtime ticket has expired.
	ErrTicketExpired = errors.New("realtime ticket expired")
)

// Ticket authorizes a single WebSocket connection. Tickets are single use and
// carry no access token in the URL.
type Ticket struct {
	ID           string    `json:"id"`
	RoomID       string    `json:"roomId"`
	IdentityID   string    `json:"identityId"`
	MembershipID string    `json:"membershipId"`
	ExpiresAt    time.Time `json:"expiresAt"`
}

// TicketStore issues and consumes single-use realtime tickets.
type TicketStore interface {
	Issue(ticket Ticket) error
	Consume(id string, now time.Time) (Ticket, error)
}

// MemoryTicketStore is the in-memory ticket store. Tickets are deliberately
// never persisted.
type MemoryTicketStore struct {
	mu      sync.Mutex
	tickets map[string]Ticket
}

// NewMemoryTicketStore creates an empty ticket store.
func NewMemoryTicketStore() *MemoryTicketStore {
	return &MemoryTicketStore{tickets: make(map[string]Ticket)}
}

// Issue stores a ticket until it is consumed or expires.
func (s *MemoryTicketStore) Issue(ticket Ticket) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.tickets[ticket.ID] = ticket
	return nil
}

// Consume atomically removes a ticket and validates its expiry.
func (s *MemoryTicketStore) Consume(id string, now time.Time) (Ticket, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	ticket, ok := s.tickets[id]
	if !ok {
		return Ticket{}, ErrTicketNotFound
	}
	delete(s.tickets, id)
	if !now.Before(ticket.ExpiresAt) {
		return Ticket{}, ErrTicketExpired
	}
	return ticket, nil
}

// Prune removes expired tickets to keep the store bounded.
func (s *MemoryTicketStore) Prune(now time.Time) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for id, ticket := range s.tickets {
		if !now.Before(ticket.ExpiresAt) {
			delete(s.tickets, id)
		}
	}
}
