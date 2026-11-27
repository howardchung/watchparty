package outbox

import (
	"context"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/platform"
)

const defaultBatch = 100

// Dispatcher polls the outbox and delivers events to a sink. Publishing is
// at-least-once; clients must tolerate duplicate room events.
type Dispatcher struct {
	store  Store
	sink   Sink
	clock  platform.Clock
	period time.Duration
	batch  int
}

// NewDispatcher builds a dispatcher with the given poll period.
func NewDispatcher(store Store, sink Sink, clock platform.Clock, period time.Duration) *Dispatcher {
	return &Dispatcher{store: store, sink: sink, clock: clock, period: period, batch: defaultBatch}
}

// Run polls until the context is cancelled.
func (d *Dispatcher) Run(ctx context.Context) error {
	ticker := time.NewTicker(d.period)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			if _, err := d.Step(ctx); err != nil {
				return err
			}
		}
	}
}

// Step performs a single poll and reports how many events were published.
func (d *Dispatcher) Step(ctx context.Context) (int, error) {
	pending, err := d.store.ListUnpublished(ctx, d.batch)
	if err != nil {
		return 0, err
	}
	if len(pending) == 0 {
		return 0, nil
	}
	published := make([]string, 0, len(pending))
	for _, event := range pending {
		if err := d.sink.Publish(ctx, event); err != nil {
			// Leave this and any later events unpublished for the next tick.
			break
		}
		published = append(published, event.ID)
	}
	if len(published) == 0 {
		return 0, nil
	}
	if err := d.store.MarkPublished(ctx, published, d.clock.Now()); err != nil {
		return 0, err
	}
	return len(published), nil
}
