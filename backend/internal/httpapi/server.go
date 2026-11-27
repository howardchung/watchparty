package httpapi

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/identity"
	"github.com/mintturtle/watchparty/backend/internal/platform"
	"github.com/mintturtle/watchparty/backend/internal/realtime"
	"github.com/mintturtle/watchparty/backend/internal/room"
	"github.com/mintturtle/watchparty/backend/internal/stream"
	"github.com/mintturtle/watchparty/backend/internal/voice"
)

// Deps are the collaborators required by the HTTP server.
type Deps struct {
	Identity           *identity.Service
	Rooms              *room.Service
	Streams            *stream.Service
	Realtime           *realtime.Hub
	Tickets            realtime.TicketStore
	Voice              *voice.Service
	Clock              platform.Clock
	Logger             *slog.Logger
	RealtimeTicketTTL  time.Duration
	RateLimitPerMinute int
	IdempotencyTTL     time.Duration
}

// Server wires HTTP handlers to domain services.
type Server struct {
	identity          *identity.Service
	rooms             *room.Service
	streams           *stream.Service
	realtime          *realtime.Hub
	tickets           realtime.TicketStore
	voice             *voice.Service
	clock             platform.Clock
	logger            *slog.Logger
	realtimeTicketTTL time.Duration
	rateLimiter       *rateLimiter
	idempotency       *idempotencyStore
}

// NewServer builds the HTTP server.
func NewServer(deps Deps) *Server {
	idempotencyTTL := deps.IdempotencyTTL
	if idempotencyTTL <= 0 {
		idempotencyTTL = 10 * time.Minute
	}
	ticketTTL := deps.RealtimeTicketTTL
	if ticketTTL <= 0 {
		ticketTTL = 30 * time.Second
	}
	return &Server{
		identity:          deps.Identity,
		rooms:             deps.Rooms,
		streams:           deps.Streams,
		realtime:          deps.Realtime,
		tickets:           deps.Tickets,
		voice:             deps.Voice,
		clock:             deps.Clock,
		logger:            deps.Logger,
		realtimeTicketTTL: ticketTTL,
		rateLimiter:       newRateLimiter(deps.RateLimitPerMinute, time.Minute, deps.Clock),
		idempotency:       newIdempotencyStore(idempotencyTTL, deps.Clock),
	}
}

// Handler returns the fully wired HTTP handler.
func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", s.handleHealth)
	mux.HandleFunc("GET /readyz", s.handleHealth)

	mux.HandleFunc("POST /v1/guest-sessions", s.handleCreateGuestSession)
	mux.HandleFunc("POST /v1/guest-sessions/refresh", s.handleRefreshGuestSession)
	mux.Handle("POST /v1/guest-sessions/revoke", s.requireAuth(http.HandlerFunc(s.handleRevokeGuestSession)))
	mux.Handle("PATCH /v1/guest-sessions/profile", s.requireAuth(http.HandlerFunc(s.handleUpdateProfile)))

	mux.Handle("POST /v1/rooms", s.requireAuth(s.idempotent(s.handleCreateRoom)))
	mux.Handle("GET /v1/rooms/{code}/preview", s.requireAuth(http.HandlerFunc(s.handlePreviewRoom)))
	mux.Handle("POST /v1/rooms/{code}/join", s.requireAuth(s.idempotent(s.handleJoinRoom)))
	mux.Handle("GET /v1/rooms/{roomId}/snapshot", s.requireAuth(http.HandlerFunc(s.handleSnapshot)))
	mux.Handle("POST /v1/rooms/{roomId}/leave", s.requireAuth(http.HandlerFunc(s.handleLeaveRoom)))

	mux.Handle("POST /v1/rooms/{roomId}/stream/start", s.requireAuth(s.idempotent(s.handleStartStream)))
	mux.Handle("POST /v1/rooms/{roomId}/stream/abort", s.requireAuth(s.idempotent(s.handleAbortStream)))

	mux.Handle("POST /v1/rooms/{roomId}/realtime-ticket", s.requireAuth(http.HandlerFunc(s.handleRealtimeTicket)))
	mux.HandleFunc("GET /v1/rooms/{roomId}/realtime", s.handleRealtimeSocket)

	mux.Handle("POST /v1/rooms/{roomId}/voice/session-token", s.requireAuth(http.HandlerFunc(s.handleVoiceToken)))
	mux.HandleFunc("POST /internal/livekit/webhook", s.handleLiveKitWebhook)

	return s.withRecovery(s.withRequestID(s.withLogging(s.withRateLimit(mux))))
}

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
