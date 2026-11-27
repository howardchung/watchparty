package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/coder/websocket"

	"github.com/mintturtle/watchparty/backend/internal/identity"
	"github.com/mintturtle/watchparty/backend/internal/platform"
	"github.com/mintturtle/watchparty/backend/internal/realtime"
	"github.com/mintturtle/watchparty/backend/internal/room"
	"github.com/mintturtle/watchparty/backend/internal/stream"
	"github.com/mintturtle/watchparty/backend/internal/voice"
)

const maxRequestBody = 1 << 20

func decodeJSON(w http.ResponseWriter, r *http.Request, target any) bool {
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxRequestBody)).Decode(target); err != nil {
		writeErrorCode(w, http.StatusBadRequest, "INVALID_JSON", "request body is not valid JSON")
		return false
	}
	return true
}

type guestSessionRequest struct {
	Name     string `json:"name"`
	Avatar   string `json:"avatar"`
	Language string `json:"language"`
}

type sessionResponse struct {
	Identity         identity.GuestIdentity `json:"identity"`
	AccessToken      string                 `json:"accessToken"`
	AccessExpiresAt  time.Time              `json:"accessExpiresAt"`
	RefreshToken     string                 `json:"refreshToken"`
	RefreshExpiresAt time.Time              `json:"refreshExpiresAt"`
}

func toSessionResponse(session identity.Session) sessionResponse {
	return sessionResponse{
		Identity:         session.Identity,
		AccessToken:      session.AccessToken,
		AccessExpiresAt:  session.AccessExpiresAt,
		RefreshToken:     session.RefreshToken,
		RefreshExpiresAt: session.RefreshExpiresAt,
	}
}

func (s *Server) handleCreateGuestSession(w http.ResponseWriter, r *http.Request) {
	var body guestSessionRequest
	if !decodeJSON(w, r, &body) {
		return
	}
	session, err := s.identity.Create(r.Context(), body.Name, body.Avatar, body.Language)
	if err != nil {
		s.writeError(w, r, err)
		return
	}
	writeJSON(w, http.StatusCreated, toSessionResponse(session))
}

type refreshRequest struct {
	RefreshToken string `json:"refreshToken"`
}

func (s *Server) handleRefreshGuestSession(w http.ResponseWriter, r *http.Request) {
	var body refreshRequest
	if !decodeJSON(w, r, &body) {
		return
	}
	session, err := s.identity.Refresh(r.Context(), body.RefreshToken)
	if err != nil {
		s.writeError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, toSessionResponse(session))
}

func (s *Server) handleRevokeGuestSession(w http.ResponseWriter, r *http.Request) {
	var body refreshRequest
	if !decodeJSON(w, r, &body) {
		return
	}
	if err := s.identity.Revoke(r.Context(), body.RefreshToken); err != nil {
		s.writeError(w, r, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type profileResponse struct {
	Identity identity.GuestIdentity `json:"identity"`
}

func (s *Server) handleUpdateProfile(w http.ResponseWriter, r *http.Request) {
	var body guestSessionRequest
	if !decodeJSON(w, r, &body) {
		return
	}
	updated, err := s.identity.UpdateProfile(r.Context(), identityFrom(r.Context()), body.Name, body.Avatar, body.Language)
	if err != nil {
		s.writeError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, profileResponse{Identity: updated})
}

type createRoomRequest struct {
	Title string `json:"title"`
}

type roomResponse struct {
	Room       room.Room       `json:"room"`
	Membership room.Membership `json:"membership"`
}

func (s *Server) handleCreateRoom(w http.ResponseWriter, r *http.Request) {
	identityID := identityFrom(r.Context())
	guest, err := s.identity.Identity(r.Context(), identityID)
	if err != nil {
		s.writeError(w, r, err)
		return
	}
	var body createRoomRequest
	if !decodeJSON(w, r, &body) {
		return
	}
	created, membership, err := s.rooms.Create(r.Context(), identityID, guest.Name, guest.Avatar, body.Title)
	if err != nil {
		s.writeError(w, r, err)
		return
	}
	writeJSON(w, http.StatusCreated, roomResponse{Room: created, Membership: membership})
}

func (s *Server) handlePreviewRoom(w http.ResponseWriter, r *http.Request) {
	preview, err := s.rooms.Preview(r.Context(), r.PathValue("code"))
	if err != nil {
		s.writeError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, preview)
}

func (s *Server) handleJoinRoom(w http.ResponseWriter, r *http.Request) {
	identityID := identityFrom(r.Context())
	guest, err := s.identity.Identity(r.Context(), identityID)
	if err != nil {
		s.writeError(w, r, err)
		return
	}
	joined, membership, err := s.rooms.Join(r.Context(), r.PathValue("code"), identityID, guest.Name, guest.Avatar)
	if err != nil {
		s.writeError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, roomResponse{Room: joined, Membership: membership})
}

type snapshotResponse struct {
	Room    room.Room            `json:"room"`
	Members []room.MemberSummary `json:"members"`
	Stream  stream.Stream        `json:"stream"`
}

func (s *Server) handleSnapshot(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	roomID := r.PathValue("roomId")
	if _, err := s.rooms.Membership(ctx, roomID, identityFrom(ctx)); err != nil {
		s.writeError(w, r, err)
		return
	}
	roomRecord, err := s.rooms.Get(ctx, roomID)
	if err != nil {
		s.writeError(w, r, err)
		return
	}
	memberships, err := s.rooms.Memberships(ctx, roomID)
	if err != nil {
		s.writeError(w, r, err)
		return
	}
	members := make([]room.MemberSummary, 0, len(memberships))
	for _, membership := range memberships {
		if membership.LeftAt != nil {
			continue
		}
		members = append(members, membership.Summary())
	}
	current, err := s.streams.Current(ctx, roomID)
	if err != nil {
		s.writeError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, snapshotResponse{Room: roomRecord, Members: members, Stream: current})
}

type leaveResponse struct {
	RoomClosed bool `json:"roomClosed"`
}

func (s *Server) handleLeaveRoom(w http.ResponseWriter, r *http.Request) {
	closed, err := s.rooms.Leave(r.Context(), r.PathValue("roomId"), identityFrom(r.Context()))
	if err != nil {
		s.writeError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, leaveResponse{RoomClosed: closed})
}

type startStreamRequest struct {
	URL string `json:"url"`
}

type streamResponse struct {
	Stream stream.Stream `json:"stream"`
}

func (s *Server) handleStartStream(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	roomID := r.PathValue("roomId")
	identityID := identityFrom(ctx)
	var body startStreamRequest
	if !decodeJSON(w, r, &body) {
		return
	}
	started, err := s.streams.Start(ctx, roomID, identityID, body.URL)
	if err != nil {
		s.writeStreamError(w, r, roomID, identityID, err)
		return
	}
	writeJSON(w, http.StatusCreated, streamResponse{Stream: started})
}

func (s *Server) handleAbortStream(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	roomID := r.PathValue("roomId")
	identityID := identityFrom(ctx)
	aborted, err := s.streams.Abort(ctx, roomID, identityID)
	if err != nil {
		s.writeStreamError(w, r, roomID, identityID, err)
		return
	}
	writeJSON(w, http.StatusOK, streamResponse{Stream: aborted})
}

// writeStreamError distinguishes an absent owner from a plain authorization
// failure so clients can show the right message.
func (s *Server) writeStreamError(w http.ResponseWriter, r *http.Request, roomID, identityID string, err error) {
	if errors.Is(err, stream.ErrForbidden) {
		membership, memberErr := s.rooms.Membership(r.Context(), roomID, identityID)
		if memberErr == nil && membership.IsOwner && !membership.Present() {
			writeErrorCode(w, http.StatusForbidden, "OWNER_ABSENT", "the owner is not present")
			return
		}
	}
	s.writeError(w, r, err)
}

type realtimeTicketResponse struct {
	Ticket    string    `json:"ticket"`
	ExpiresAt time.Time `json:"expiresAt"`
}

func (s *Server) handleRealtimeTicket(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	roomID := r.PathValue("roomId")
	identityID := identityFrom(ctx)
	membership, err := s.rooms.Membership(ctx, roomID, identityID)
	if err != nil {
		s.writeError(w, r, err)
		return
	}
	if membership.LeftAt != nil {
		writeErrorCode(w, http.StatusForbidden, "NOT_A_MEMBER", "not a room member")
		return
	}
	ticket := realtime.Ticket{
		ID:           platform.NewID(),
		RoomID:       roomID,
		IdentityID:   identityID,
		MembershipID: membership.ID,
		ExpiresAt:    s.clock.Now().Add(s.realtimeTicketTTL),
	}
	if err := s.tickets.Issue(ticket); err != nil {
		s.writeError(w, r, err)
		return
	}
	writeJSON(w, http.StatusCreated, realtimeTicketResponse{Ticket: ticket.ID, ExpiresAt: ticket.ExpiresAt})
}

func (s *Server) handleRealtimeSocket(w http.ResponseWriter, r *http.Request) {
	roomID := r.PathValue("roomId")
	ticketID := r.URL.Query().Get("ticket")
	if ticketID == "" {
		writeErrorCode(w, http.StatusUnauthorized, "INVALID_TICKET", "missing realtime ticket")
		return
	}
	ticket, err := s.tickets.Consume(ticketID, s.clock.Now())
	if err != nil {
		s.writeError(w, r, err)
		return
	}
	if ticket.RoomID != roomID {
		writeErrorCode(w, http.StatusUnauthorized, "INVALID_TICKET", "ticket does not match room")
		return
	}
	connection, err := websocket.Accept(w, r, &websocket.AcceptOptions{OriginPatterns: []string{"*"}})
	if err != nil {
		s.logger.Warn("realtime upgrade failed", "error", err)
		return
	}
	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()
	if err := s.realtime.Serve(ctx, connection, ticket); err != nil && !errors.Is(err, context.Canceled) {
		s.logger.Debug("realtime connection closed", "error", err)
	}
	_ = connection.Close(websocket.StatusNormalClosure, "")
}

func (s *Server) handleVoiceToken(w http.ResponseWriter, r *http.Request) {
	if s.voice == nil || !s.voice.Enabled() {
		writeErrorCode(w, http.StatusServiceUnavailable, "VOICE_DISABLED", "voice is not available")
		return
	}
	token, err := s.voice.SessionToken(r.Context(), r.PathValue("roomId"), identityFrom(r.Context()))
	if err != nil {
		s.writeError(w, r, err)
		return
	}
	writeJSON(w, http.StatusCreated, token)
}

func (s *Server) handleLiveKitWebhook(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, maxRequestBody))
	if err != nil {
		writeErrorCode(w, http.StatusBadRequest, "INVALID_WEBHOOK", "could not read webhook body")
		return
	}
	token := strings.TrimSpace(strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer "))
	if token == "" {
		writeErrorCode(w, http.StatusUnauthorized, "INVALID_WEBHOOK", "missing webhook signature")
		return
	}
	if s.voice == nil {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if err := s.voice.HandleWebhook(r.Context(), token, body); err != nil {
		if errors.Is(err, voice.ErrDisabled) {
			// Voice is disabled; acknowledge so LiveKit stops retrying.
			w.WriteHeader(http.StatusNoContent)
			return
		}
		s.writeError(w, r, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
