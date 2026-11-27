package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"

	"github.com/mintturtle/watchparty/backend/internal/events"
	"github.com/mintturtle/watchparty/backend/internal/room"
)

type rowScanner interface {
	Scan(dest ...any) error
}

// CreateRoomWithOwner implements room.Repository.
func (s *Store) CreateRoomWithOwner(ctx context.Context, r room.Room, owner room.Membership, event *events.Event) error {
	return s.inTx(ctx, func(tx pgx.Tx) error {
		if _, err := tx.Exec(ctx,
			`INSERT INTO rooms (id, code, title, owner_identity_id, created_at, ended_at, tombstone_until)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			r.ID, r.Code, r.Title, r.OwnerIdentityID, r.CreatedAt, r.EndedAt, r.TombstoneUntil,
		); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, insertMembershipSQL,
			owner.ID, owner.RoomID, owner.IdentityID, owner.DisplayName, owner.Avatar, owner.IsOwner,
			owner.JoinedAt, owner.LeftAt, owner.GraceExpiresAt, owner.WSConnected, owner.LiveKitConnected,
		); err != nil {
			return err
		}
		return insertEvents(ctx, tx, []*events.Event{event})
	})
}

// GetRoomByCode implements room.Repository.
func (s *Store) GetRoomByCode(ctx context.Context, code string) (room.Room, error) {
	return scanRoom(s.pool.QueryRow(ctx,
		`SELECT id, code, title, owner_identity_id, created_at, ended_at, tombstone_until
		 FROM rooms WHERE code = $1`, code))
}

// GetRoomByID implements room.Repository.
func (s *Store) GetRoomByID(ctx context.Context, id string) (room.Room, error) {
	return scanRoom(s.pool.QueryRow(ctx,
		`SELECT id, code, title, owner_identity_id, created_at, ended_at, tombstone_until
		 FROM rooms WHERE id = $1`, id))
}

// ListActiveRoomIDs implements room.Repository.
func (s *Store) ListActiveRoomIDs(ctx context.Context, _ time.Time) ([]string, error) {
	rows, err := s.pool.Query(ctx, `SELECT id FROM rooms WHERE ended_at IS NULL`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, rows.Err()
}

// ListMemberships implements room.Repository.
func (s *Store) ListMemberships(ctx context.Context, roomID string) ([]room.Membership, error) {
	rows, err := s.pool.Query(ctx, selectMembershipSQL+` WHERE room_id = $1`, roomID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var memberships []room.Membership
	for rows.Next() {
		membership, err := scanMembership(rows)
		if err != nil {
			return nil, err
		}
		memberships = append(memberships, membership)
	}
	return memberships, rows.Err()
}

// GetMembership implements room.Repository.
func (s *Store) GetMembership(ctx context.Context, roomID, identityID string) (room.Membership, error) {
	return scanMembership(s.pool.QueryRow(ctx,
		selectMembershipSQL+` WHERE room_id = $1 AND identity_id = $2`, roomID, identityID))
}

// GetMembershipByID implements room.Repository.
func (s *Store) GetMembershipByID(ctx context.Context, roomID, membershipID string) (room.Membership, error) {
	return scanMembership(s.pool.QueryRow(ctx,
		selectMembershipSQL+` WHERE room_id = $1 AND id = $2`, roomID, membershipID))
}

// FindActiveMembershipByIdentity implements room.Repository.
func (s *Store) FindActiveMembershipByIdentity(ctx context.Context, identityID string, now time.Time) (room.Membership, error) {
	return scanMembership(s.pool.QueryRow(ctx,
		selectMembershipSQL+`
		 WHERE identity_id = $1
		   AND left_at IS NULL
		   AND (ws_connected OR livekit_connected OR (grace_expires_at IS NOT NULL AND grace_expires_at > $2))
		 LIMIT 1`, identityID, now))
}

// JoinRoom implements room.Repository.
func (s *Store) JoinRoom(ctx context.Context, membership room.Membership, evts ...*events.Event) error {
	return s.inTx(ctx, func(tx pgx.Tx) error {
		if _, err := tx.Exec(ctx, insertMembershipSQL+`
			ON CONFLICT (room_id, identity_id) DO UPDATE SET
				display_name = EXCLUDED.display_name,
				avatar = EXCLUDED.avatar,
				left_at = EXCLUDED.left_at,
				grace_expires_at = EXCLUDED.grace_expires_at,
				joined_at = EXCLUDED.joined_at,
				ws_connected = EXCLUDED.ws_connected,
				livekit_connected = EXCLUDED.livekit_connected`,
			membership.ID, membership.RoomID, membership.IdentityID, membership.DisplayName, membership.Avatar,
			membership.IsOwner, membership.JoinedAt, membership.LeftAt, membership.GraceExpiresAt,
			membership.WSConnected, membership.LiveKitConnected,
		); err != nil {
			return err
		}
		return insertEvents(ctx, tx, evts)
	})
}

// UpdateMembership implements room.Repository.
func (s *Store) UpdateMembership(ctx context.Context, membership room.Membership, evts ...*events.Event) error {
	return s.inTx(ctx, func(tx pgx.Tx) error {
		tag, err := tx.Exec(ctx,
			`UPDATE memberships SET
				display_name = $2,
				avatar = $3,
				is_owner = $4,
				joined_at = $5,
				left_at = $6,
				grace_expires_at = $7,
				ws_connected = $8,
				livekit_connected = $9
			 WHERE id = $1`,
			membership.ID, membership.DisplayName, membership.Avatar, membership.IsOwner, membership.JoinedAt,
			membership.LeftAt, membership.GraceExpiresAt, membership.WSConnected, membership.LiveKitConnected,
		)
		if err != nil {
			return err
		}
		if tag.RowsAffected() == 0 {
			return room.ErrNotFound
		}
		return insertEvents(ctx, tx, evts)
	})
}

// MarkRoomEnded implements room.Repository.
func (s *Store) MarkRoomEnded(ctx context.Context, roomID string, endedAt, tombstoneUntil time.Time, event *events.Event) error {
	return s.inTx(ctx, func(tx pgx.Tx) error {
		if _, err := tx.Exec(ctx,
			`UPDATE rooms SET ended_at = $2, tombstone_until = $3 WHERE id = $1`,
			roomID, endedAt, tombstoneUntil,
		); err != nil {
			return err
		}
		return insertEvents(ctx, tx, []*events.Event{event})
	})
}

// PurgeTombstones implements room.Repository.
func (s *Store) PurgeTombstones(ctx context.Context, before time.Time) ([]string, error) {
	rows, err := s.pool.Query(ctx,
		`DELETE FROM rooms WHERE tombstone_until IS NOT NULL AND tombstone_until < $1 RETURNING id`, before)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var purged []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		purged = append(purged, id)
	}
	return purged, rows.Err()
}

const selectMembershipSQL = `SELECT
	id, room_id, identity_id, display_name, avatar, is_owner,
	joined_at, left_at, grace_expires_at, ws_connected, livekit_connected
	FROM memberships`

const insertMembershipSQL = `INSERT INTO memberships (
	id, room_id, identity_id, display_name, avatar, is_owner,
	joined_at, left_at, grace_expires_at, ws_connected, livekit_connected
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`

func scanRoom(row rowScanner) (room.Room, error) {
	var r room.Room
	err := row.Scan(&r.ID, &r.Code, &r.Title, &r.OwnerIdentityID, &r.CreatedAt, &r.EndedAt, &r.TombstoneUntil)
	if errors.Is(err, pgx.ErrNoRows) {
		return room.Room{}, room.ErrNotFound
	}
	return r, err
}

func scanMembership(row rowScanner) (room.Membership, error) {
	var m room.Membership
	err := row.Scan(
		&m.ID, &m.RoomID, &m.IdentityID, &m.DisplayName, &m.Avatar, &m.IsOwner,
		&m.JoinedAt, &m.LeftAt, &m.GraceExpiresAt, &m.WSConnected, &m.LiveKitConnected,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return room.Membership{}, room.ErrNotFound
	}
	return m, err
}

func insertEvents(ctx context.Context, tx pgx.Tx, evts []*events.Event) error {
	for _, event := range evts {
		if event == nil {
			continue
		}
		if _, err := tx.Exec(ctx,
			`INSERT INTO outbox_events (id, room_id, topic, payload, created_at)
			 VALUES ($1, $2, $3, $4::jsonb, $5)`,
			event.ID, event.RoomID, event.Topic, string(event.Payload), event.CreatedAt,
		); err != nil {
			return err
		}
	}
	return nil
}
