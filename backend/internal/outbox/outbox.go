// Package outbox implements the transactional outbox used to deliver durable
// room events to realtime clients after the originating transaction commits.
package outbox

import (
	"context"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/events"
)

// Store persists events until they are published.
type Store interface {
	Append(ctx context.Context, event events.Event) error
	ListUnpublished(ctx context.Context, limit int) ([]events.Event, error)
	MarkPublished(ctx context.Context, ids []string, publishedAt time.Time) error
}

// Sink receives published events. Delivery failures leave events unpublished
// so they are retried.
type Sink interface {
	Publish(ctx context.Context, event events.Event) error
}
