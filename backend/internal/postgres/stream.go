package postgres

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"

	"github.com/mintturtle/watchparty/backend/internal/events"
	"github.com/mintturtle/watchparty/backend/internal/stream"
)

// Get implements stream.Repository.
func (s *Store) Get(ctx context.Context, roomID string) (stream.Stream, error) {
	var current stream.Stream
	err := s.pool.QueryRow(ctx,
		`SELECT room_id, id, session_id, revision, state, url, started_at, aborted_at, updated_at
		 FROM streams WHERE room_id = $1`,
		roomID,
	).Scan(
		&current.RoomID, &current.ID, &current.SessionID, &current.Revision, &current.State,
		&current.URL, &current.StartedAt, &current.AbortedAt, &current.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return stream.Stream{}, stream.ErrNotFound
	}
	return current, err
}

// Save implements stream.Repository.
func (s *Store) Save(ctx context.Context, current stream.Stream, event *events.Event) error {
	return s.inTx(ctx, func(tx pgx.Tx) error {
		if _, err := tx.Exec(ctx,
			`INSERT INTO streams (room_id, id, session_id, revision, state, url, started_at, aborted_at, updated_at)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
			 ON CONFLICT (room_id) DO UPDATE SET
				id = EXCLUDED.id,
				session_id = EXCLUDED.session_id,
				revision = EXCLUDED.revision,
				state = EXCLUDED.state,
				url = EXCLUDED.url,
				started_at = EXCLUDED.started_at,
				aborted_at = EXCLUDED.aborted_at,
				updated_at = EXCLUDED.updated_at`,
			current.RoomID, current.ID, current.SessionID, current.Revision, string(current.State),
			current.URL, current.StartedAt, current.AbortedAt, current.UpdatedAt,
		); err != nil {
			return err
		}
		return insertEvents(ctx, tx, []*events.Event{event})
	})
}
