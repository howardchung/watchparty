// Package memory provides in-memory repository implementations for tests and
// local development. Production deployments use the postgres package.
package memory

import (
	"context"
	"sync"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/events"
)

// Outbox is an in-memory outbox.Store.
type Outbox struct {
	mu        sync.Mutex
	events    []events.Event
	published map[string]bool
}

// NewOutbox creates an empty outbox.
func NewOutbox() *Outbox {
	return &Outbox{published: make(map[string]bool)}
}

// Append stores an event.
func (o *Outbox) Append(_ context.Context, event events.Event) error {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.events = append(o.events, event)
	return nil
}

// ListUnpublished returns up to limit unpublished events in insertion order.
func (o *Outbox) ListUnpublished(_ context.Context, limit int) ([]events.Event, error) {
	o.mu.Lock()
	defer o.mu.Unlock()
	result := make([]events.Event, 0, limit)
	for _, event := range o.events {
		if o.published[event.ID] {
			continue
		}
		result = append(result, event)
		if len(result) >= limit {
			break
		}
	}
	return result, nil
}

// MarkPublished marks events as delivered.
func (o *Outbox) MarkPublished(_ context.Context, ids []string, _ time.Time) error {
	o.mu.Lock()
	defer o.mu.Unlock()
	for _, id := range ids {
		o.published[id] = true
	}
	return nil
}

// Snapshot returns a copy of all stored events.
func (o *Outbox) Snapshot() []events.Event {
	o.mu.Lock()
	defer o.mu.Unlock()
	return append([]events.Event(nil), o.events...)
}
