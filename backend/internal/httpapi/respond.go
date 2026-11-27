package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/mintturtle/watchparty/backend/internal/identity"
	"github.com/mintturtle/watchparty/backend/internal/realtime"
	"github.com/mintturtle/watchparty/backend/internal/room"
	"github.com/mintturtle/watchparty/backend/internal/stream"
	"github.com/mintturtle/watchparty/backend/internal/voice"
)

type errorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload != nil {
		_ = json.NewEncoder(w).Encode(payload)
	}
}

func writeErrorCode(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, errorBody{Code: code, Message: message})
}

// classify maps domain errors to HTTP status and stable machine codes.
func classify(err error) (status int, code string) {
	switch {
	case errors.Is(err, identity.ErrInvalidProfile):
		return http.StatusBadRequest, "INVALID_PROFILE"
	case errors.Is(err, identity.ErrInvalidToken):
		return http.StatusUnauthorized, "INVALID_TOKEN"
	case errors.Is(err, identity.ErrSessionExpired):
		return http.StatusUnauthorized, "SESSION_EXPIRED"
	case errors.Is(err, identity.ErrSessionRevoked):
		return http.StatusUnauthorized, "SESSION_REVOKED"
	case errors.Is(err, identity.ErrNotFound):
		return http.StatusNotFound, "IDENTITY_NOT_FOUND"
	case errors.Is(err, room.ErrNotFound):
		return http.StatusNotFound, "ROOM_NOT_FOUND"
	case errors.Is(err, room.ErrEnded):
		return http.StatusConflict, "ROOM_ENDED"
	case errors.Is(err, room.ErrFull):
		return http.StatusConflict, "ROOM_FULL"
	case errors.Is(err, room.ErrAlreadyInRoom):
		return http.StatusConflict, "ALREADY_IN_ROOM"
	case errors.Is(err, room.ErrNotMember):
		return http.StatusForbidden, "NOT_A_MEMBER"
	case errors.Is(err, room.ErrInvalidCode):
		return http.StatusBadRequest, "INVALID_PARTY_CODE"
	case errors.Is(err, stream.ErrForbidden):
		return http.StatusForbidden, "FORBIDDEN"
	case errors.Is(err, stream.ErrActive):
		return http.StatusConflict, "STALE_STREAM_REVISION"
	case errors.Is(err, stream.ErrNoActiveStream):
		return http.StatusConflict, "NO_ACTIVE_STREAM"
	case errors.Is(err, stream.ErrInvalidURL):
		return http.StatusBadRequest, "INVALID_STREAM_URL"
	case errors.Is(err, realtime.ErrTicketNotFound), errors.Is(err, realtime.ErrTicketExpired):
		return http.StatusUnauthorized, "INVALID_TICKET"
	case errors.Is(err, voice.ErrDisabled):
		return http.StatusServiceUnavailable, "VOICE_DISABLED"
	case errors.Is(err, voice.ErrNotMember):
		return http.StatusForbidden, "NOT_A_MEMBER"
	default:
		return http.StatusInternalServerError, "INTERNAL_ERROR"
	}
}

// writeError renders a domain error without leaking internal failure details.
func (s *Server) writeError(w http.ResponseWriter, r *http.Request, err error) {
	status, code := classify(err)
	message := err.Error()
	if status >= http.StatusInternalServerError {
		s.logger.Error("request failed", "code", code, "error", err, "path", r.URL.Path, "requestId", requestIDFrom(r.Context()))
		message = "internal error"
	}
	writeErrorCode(w, status, code, message)
}
