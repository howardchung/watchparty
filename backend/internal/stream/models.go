package stream

import (
	"context"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/events"
)

// State is the authoritative shared stream state for a room.
type State string

const (
	StateEmpty   State = "EMPTY"
	StateActive  State = "ACTIVE"
	StateAborted State = "ABORTED"
)

// Stream is the durable shared video stream for a room. Video bytes are never
// proxied or stored.
type Stream struct {
	ID        string     `json:"id"`
	RoomID    string     `json:"roomId"`
	SessionID string     `json:"sessionId"`
	Revision  int64      `json:"revision"`
	State     State      `json:"state"`
	URL       string     `json:"url"`
	StartedAt *time.Time `json:"startedAt,omitempty"`
	AbortedAt *time.Time `json:"abortedAt,omitempty"`
	UpdatedAt time.Time  `json:"updatedAt"`
}

// Repository persists shared stream state.
type Repository interface {
	// Get returns the stream for a room or ErrNotFound when none exists.
	Get(ctx context.Context, roomID string) (Stream, error)
	// Save persists the stream and appends the event in the same transaction.
	Save(ctx context.Context, s Stream, event *events.Event) error
}

// RoomAuthorization answers whether an identity may manage a room's stream.
type RoomAuthorization interface {
	// CanManageStream reports whether the identity is the present owner of the
	// room. It returns ErrRoomNotFound when the room does not exist.
	CanManageStream(ctx context.Context, roomID, identityID string) (bool, error)
}
