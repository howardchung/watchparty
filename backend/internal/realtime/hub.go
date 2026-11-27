package realtime

import (
	"context"
	"encoding/json"
	"log/slog"
	"sync"
	"time"

	"github.com/coder/websocket"

	"github.com/mintturtle/watchparty/backend/internal/events"
	"github.com/mintturtle/watchparty/backend/internal/platform"
	"github.com/mintturtle/watchparty/backend/internal/room"
	"github.com/mintturtle/watchparty/backend/internal/stream"
)

const (
	writeTimeout   = 10 * time.Second
	sendBufferSize = 32
)

// RoomService is the subset of room behavior realtime needs.
type RoomService interface {
	Get(ctx context.Context, roomID string) (room.Room, error)
	Memberships(ctx context.Context, roomID string) ([]room.Membership, error)
	MarkConnected(ctx context.Context, roomID, identityID string) (room.Membership, error)
	MarkDisconnected(ctx context.Context, roomID, identityID string) (room.Membership, error)
}

// StreamService is the subset of stream behavior realtime needs.
type StreamService interface {
	Current(ctx context.Context, roomID string) (stream.Stream, error)
}

// Hub tracks room connections and delivers durable events and snapshots.
type Hub struct {
	mu          sync.RWMutex
	connections map[string]map[*Connection]struct{}

	// presenceMu serializes presence transitions so a stale connection's
	// disconnect can never mark a member absent after a newer connection has
	// already marked them present.
	presenceMu sync.Mutex

	roomService   RoomService
	streamService StreamService
	syncEngine    *SyncEngine
	clock         platform.Clock
	logger        *slog.Logger
}

// NewHub builds a realtime hub.
func NewHub(roomService RoomService, streamService StreamService, engine *SyncEngine, clock platform.Clock, logger *slog.Logger) *Hub {
	return &Hub{
		connections:   make(map[string]map[*Connection]struct{}),
		roomService:   roomService,
		streamService: streamService,
		syncEngine:    engine,
		clock:         clock,
		logger:        logger,
	}
}

// Publish implements the outbox sink by broadcasting a durable event to every
// connection in the room.
func (h *Hub) Publish(_ context.Context, event events.Event) error {
	message, err := json.Marshal(eventMessage{
		Type:    serverEvent,
		Topic:   event.Topic,
		EventID: event.ID,
		Payload: json.RawMessage(event.Payload),
	})
	if err != nil {
		return err
	}
	h.broadcast(event.RoomID, message)
	return nil
}

// Serve runs the connection lifecycle for an accepted WebSocket.
func (h *Hub) Serve(ctx context.Context, ws *websocket.Conn, ticket Ticket) error {
	connection := &Connection{
		hub:      h,
		ws:       ws,
		ticket:   ticket,
		send:     make(chan []byte, sendBufferSize),
		overflow: make(chan struct{}),
	}

	// A member may briefly have overlapping connections while reconnecting
	// (the old socket has not been detected as dead yet). Only mark the member
	// connected when the first connection attaches and disconnected when the
	// last one detaches, so a stale disconnect never flips a present member to
	// absent. The presence mutex keeps each transition atomic with respect to
	// a competing connect/disconnect of the same membership.
	h.presenceMu.Lock()
	if h.register(ticket.RoomID, connection) {
		if _, err := h.roomService.MarkConnected(ctx, ticket.RoomID, ticket.IdentityID); err != nil {
			h.logger.Warn("realtime mark connected failed", "error", err)
		}
	}
	h.presenceMu.Unlock()

	defer func() {
		h.presenceMu.Lock()
		defer h.presenceMu.Unlock()
		if h.unregister(ticket.RoomID, connection) {
			detachCtx, cancelDetach := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancelDetach()
			if _, err := h.roomService.MarkDisconnected(detachCtx, ticket.RoomID, ticket.IdentityID); err != nil {
				h.logger.Warn("realtime mark disconnected failed", "error", err)
			}
		}
	}()

	writeCtx, cancelWrite := context.WithCancel(ctx)
	defer cancelWrite()
	go connection.writePump(writeCtx)

	if snapshot, err := h.snapshot(ctx, ticket.RoomID); err == nil {
		connection.enqueue(snapshot)
	} else {
		h.logger.Warn("realtime snapshot failed", "error", err)
	}

	return connection.readPump(ctx)
}

func (h *Hub) snapshot(ctx context.Context, roomID string) ([]byte, error) {
	r, err := h.roomService.Get(ctx, roomID)
	if err != nil {
		return nil, err
	}
	memberships, err := h.roomService.Memberships(ctx, roomID)
	if err != nil {
		return nil, err
	}
	summaries := make([]room.MemberSummary, 0, len(memberships))
	for _, membership := range memberships {
		if membership.LeftAt != nil {
			continue
		}
		summaries = append(summaries, membership.Summary())
	}
	current, err := h.streamService.Current(ctx, roomID)
	if err != nil {
		return nil, err
	}
	return json.Marshal(snapshotMessage{Type: serverSnapshot, Room: r, Members: summaries, Stream: current})
}

func (h *Hub) register(roomID string, connection *Connection) bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.connections[roomID] == nil {
		h.connections[roomID] = make(map[*Connection]struct{})
	}
	isFirst := h.memberConnectionCountLocked(roomID, connection.ticket.MembershipID) == 0
	h.connections[roomID][connection] = struct{}{}
	return isFirst
}

func (h *Hub) unregister(roomID string, connection *Connection) bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	current, ok := h.connections[roomID]
	if !ok {
		return false
	}
	delete(current, connection)
	isLast := h.memberConnectionCountLocked(roomID, connection.ticket.MembershipID) == 0
	if len(current) == 0 {
		delete(h.connections, roomID)
	}
	return isLast
}

func (h *Hub) memberConnectionCountLocked(roomID, membershipID string) int {
	count := 0
	for connection := range h.connections[roomID] {
		if connection.ticket.MembershipID == membershipID {
			count++
		}
	}
	return count
}

func (h *Hub) broadcast(roomID string, message []byte) {
	h.mu.RLock()
	targets := make([]*Connection, 0, len(h.connections[roomID]))
	for connection := range h.connections[roomID] {
		targets = append(targets, connection)
	}
	h.mu.RUnlock()
	for _, connection := range targets {
		connection.enqueue(message)
	}
}

// Connection is a single authenticated room WebSocket.
type Connection struct {
	hub    *Hub
	ws     *websocket.Conn
	ticket Ticket
	send   chan []byte

	// overflow is closed the first time the send buffer fills. The write pump
	// then closes the socket so the client reconnects and reseeds from a full
	// snapshot rather than silently missing durable events.
	overflow  chan struct{}
	closeOnce sync.Once
}

func (c *Connection) readPump(ctx context.Context) error {
	c.ws.SetReadLimit(8 * 1024)
	for {
		_, data, err := c.ws.Read(ctx)
		if err != nil {
			return err
		}
		var message clientMessage
		if err := json.Unmarshal(data, &message); err != nil {
			c.sendError("INVALID_MESSAGE", "message is not valid JSON")
			continue
		}
		c.handle(message)
	}
}

func (c *Connection) handle(message clientMessage) {
	switch message.Type {
	case clientPing:
		c.enqueueMust(controlMessage{Type: serverPong})
	case clientPlaybackReport:
		if message.StreamSessionID == "" {
			c.sendError("STALE_STREAM_REVISION", "a stream session is required")
			return
		}
		c.hub.syncEngine.Record(Report{
			RoomID:          c.ticket.RoomID,
			MembershipID:    c.ticket.MembershipID,
			StreamSessionID: message.StreamSessionID,
			PositionMs:      message.PositionMs,
			Playing:         message.Playing,
			ReceivedAt:      c.hub.clock.Now(),
		})
	case clientSyncRequest:
		if message.StreamSessionID == "" {
			c.sendError("STALE_STREAM_REVISION", "a stream session is required")
			return
		}
		result := c.hub.syncEngine.Sync(c.ticket.RoomID, message.StreamSessionID, message.PositionMs)
		c.enqueueMust(syncResultMessage{
			Type:             serverSyncResult,
			Status:           result.Status,
			TargetPositionMs: result.TargetMs,
			RequestID:        message.RequestID,
		})
	case clientAck:
		// Delivery is at-least-once; acknowledgements need no server state.
	default:
		c.sendError("UNKNOWN_MESSAGE", "unsupported message type")
	}
}

func (c *Connection) writePump(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case <-c.overflow:
			// The consumer cannot keep up. Drop the connection so the client
			// reconnects and receives a fresh snapshot; a dropped durable event
			// would otherwise go unnoticed until the next reconnect.
			_ = c.ws.CloseNow()
			return
		case message, ok := <-c.send:
			if !ok {
				return
			}
			writeCtx, cancel := context.WithTimeout(ctx, writeTimeout)
			err := c.ws.Write(writeCtx, websocket.MessageText, message)
			cancel()
			if err != nil {
				return
			}
		}
	}
}

func (c *Connection) enqueue(message []byte) {
	select {
	case c.send <- message:
	default:
		c.signalOverflow()
	}
}

func (c *Connection) signalOverflow() {
	c.closeOnce.Do(func() { close(c.overflow) })
}

func (c *Connection) enqueueMust(value any) {
	encoded, err := json.Marshal(value)
	if err != nil {
		return
	}
	c.enqueue(encoded)
}

func (c *Connection) sendError(code, message string) {
	c.enqueueMust(errorMessage{Type: serverError, Code: code, Message: message})
}

// controlMessage carries messages that have no fields beyond their type.
type controlMessage struct {
	Type string `json:"type"`
}
