package memory

import (
	"context"
	"sync"

	"github.com/mintturtle/watchparty/backend/internal/events"
	"github.com/mintturtle/watchparty/backend/internal/stream"
)

// StreamStore is an in-memory stream.Repository.
type StreamStore struct {
	mu     sync.Mutex
	byRoom map[string]stream.Stream
	outbox *Outbox
}

// NewStreamStore creates an empty stream store. When outbox is non-nil,
// persisted events are appended to it.
func NewStreamStore(outbox *Outbox) *StreamStore {
	return &StreamStore{byRoom: make(map[string]stream.Stream), outbox: outbox}
}

func (s *StreamStore) Get(_ context.Context, roomID string) (stream.Stream, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	current, ok := s.byRoom[roomID]
	if !ok {
		return stream.Stream{}, stream.ErrNotFound
	}
	return current, nil
}

func (s *StreamStore) Save(ctx context.Context, current stream.Stream, event *events.Event) error {
	s.mu.Lock()
	s.byRoom[current.RoomID] = current
	s.mu.Unlock()
	if s.outbox != nil && event != nil {
		return s.outbox.Append(ctx, *event)
	}
	return nil
}
