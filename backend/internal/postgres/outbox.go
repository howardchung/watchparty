package postgres

import (
	"context"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/events"
)

// Append implements outbox.Store.
func (s *Store) Append(ctx context.Context, event events.Event) error {
	_, err := s.pool.Exec(ctx,
		`INSERT INTO outbox_events (id, room_id, topic, payload, created_at)
		 VALUES ($1, $2, $3, $4::jsonb, $5)
		 ON CONFLICT (id) DO NOTHING`,
		event.ID, event.RoomID, event.Topic, string(event.Payload), event.CreatedAt,
	)
	return err
}

// ListUnpublished implements outbox.Store.
func (s *Store) ListUnpublished(ctx context.Context, limit int) ([]events.Event, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, room_id, topic, payload, created_at
		 FROM outbox_events
		 WHERE published_at IS NULL
		 ORDER BY created_at
		 LIMIT $1`,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var pending []events.Event
	for rows.Next() {
		var event events.Event
		var payload []byte
		if err := rows.Scan(&event.ID, &event.RoomID, &event.Topic, &payload, &event.CreatedAt); err != nil {
			return nil, err
		}
		event.Payload = payload
		pending = append(pending, event)
	}
	return pending, rows.Err()
}

// MarkPublished implements outbox.Store.
func (s *Store) MarkPublished(ctx context.Context, ids []string, publishedAt time.Time) error {
	if len(ids) == 0 {
		return nil
	}
	_, err := s.pool.Exec(ctx,
		`UPDATE outbox_events SET published_at = $2 WHERE id = ANY($1)`,
		ids, publishedAt,
	)
	return err
}
