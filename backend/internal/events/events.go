// Package events defines durable room events used by the transactional
// outbox. Events are stored with the state change that produced them and are
// delivered to realtime clients by a separate dispatcher.
package events

import (
	"encoding/json"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/platform"
)

// Event topics delivered to room realtime clients.
const (
	TopicRoomCreated    = "room.created"
	TopicMemberJoined   = "member.joined"
	TopicMemberLeft     = "member.left"
	TopicMemberAbsent   = "member.absent"
	TopicMemberReturned = "member.returned"
	TopicOwnerPresence  = "owner.presence"
	TopicStreamStarted  = "stream.started"
	TopicStreamAborted  = "stream.aborted"
	TopicRoomClosed     = "room.closed"
)

// Event is a single durable room event queued for delivery.
type Event struct {
	ID        string
	RoomID    string
	Topic     string
	Payload   []byte
	CreatedAt time.Time
}

// New builds an event with a generated ID and a JSON-encoded payload.
func New(roomID, topic string, payload any, now time.Time) (*Event, error) {
	encoded, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return &Event{
		ID:        platform.NewID(),
		RoomID:    roomID,
		Topic:     topic,
		Payload:   encoded,
		CreatedAt: now,
	}, nil
}
