package voice

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/mintturtle/watchparty/backend/internal/room"
)

// MembershipService is the subset of room behavior voice needs. Membership is
// keyed by identity ID for token issuance; SetVoiceConnected is keyed by
// membership ID because that is the participant identity LiveKit reports.
type MembershipService interface {
	Membership(ctx context.Context, roomID, identityID string) (room.Membership, error)
	SetVoiceConnected(ctx context.Context, roomID, membershipID string, connected bool) (room.Membership, error)
}

// RoomAdmin removes LiveKit rooms when a party closes.
type RoomAdmin interface {
	DeleteRoom(ctx context.Context, roomName string) error
}

// Service issues voice tokens and reconciles voice presence. Voice failures
// never block room or playback behavior.
type Service struct {
	issuer  *Issuer
	members MembershipService
	admin   RoomAdmin
}

// NewService builds the voice service.
func NewService(issuer *Issuer, members MembershipService, admin RoomAdmin) *Service {
	return &Service{issuer: issuer, members: members, admin: admin}
}

// Enabled reports whether voice tokens can be issued.
func (s *Service) Enabled() bool {
	return s.issuer != nil && s.issuer.Configured()
}

// SessionToken issues a room-scoped LiveKit token to an active member.
func (s *Service) SessionToken(ctx context.Context, roomID, identityID string) (Token, error) {
	if !s.Enabled() {
		return Token{}, ErrDisabled
	}
	membership, err := s.members.Membership(ctx, roomID, identityID)
	if err != nil {
		return Token{}, ErrNotMember
	}
	if membership.LeftAt != nil {
		return Token{}, ErrNotMember
	}
	return s.issuer.Issue(TokenRequest{
		RoomID:       roomID,
		MembershipID: membership.ID,
		DisplayName:  membership.DisplayName,
		Avatar:       membership.Avatar,
	})
}

// HandleWebhook verifies and applies a signed LiveKit event. It is a no-op when
// voice is disabled.
func (s *Service) HandleWebhook(ctx context.Context, rawToken string, body []byte) error {
	if !s.Enabled() {
		return ErrDisabled
	}
	event, err := s.issuer.VerifyWebhook(rawToken, body)
	if err != nil {
		return err
	}
	var presenceErr error
	switch event.Event {
	case "participant_joined":
		_, presenceErr = s.members.SetVoiceConnected(ctx, event.Room.Name, event.Participant.Identity, true)
	case "participant_left":
		_, presenceErr = s.members.SetVoiceConnected(ctx, event.Room.Name, event.Participant.Identity, false)
	}
	if errors.Is(presenceErr, room.ErrNotFound) {
		// The seat is already gone; there is nothing left to reconcile.
		return nil
	}
	return presenceErr
}

// CloseRoomResources removes the LiveKit room when voice is enabled. Errors are
// intentionally swallowed by callers because voice must not block closure.
func (s *Service) CloseRoomResources(ctx context.Context, roomID string) error {
	if !s.Enabled() || s.admin == nil {
		return nil
	}
	return s.admin.DeleteRoom(ctx, roomID)
}

// LiveKitAdmin deletes LiveKit rooms through the server Twirp API.
type LiveKitAdmin struct {
	baseURL string
	issuer  *Issuer
	client  *http.Client
}

// NewLiveKitAdmin builds an admin client for the given LiveKit URL.
func NewLiveKitAdmin(baseURL string, issuer *Issuer) *LiveKitAdmin {
	return &LiveKitAdmin{
		baseURL: baseURL,
		issuer:  issuer,
		client:  &http.Client{Timeout: 5 * time.Second},
	}
}

// DeleteRoom removes a LiveKit room. Removing an already-absent room is not an
// error.
func (a *LiveKitAdmin) DeleteRoom(ctx context.Context, roomName string) error {
	if a.issuer == nil || !a.issuer.Configured() {
		return ErrNotConfigured
	}
	adminToken, err := a.issuer.issueAdminToken()
	if err != nil {
		return err
	}
	payload, err := json.Marshal(map[string]string{"room": roomName})
	if err != nil {
		return err
	}
	request, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		a.baseURL+"/twirp/livekit.RoomService/DeleteRoom",
		bytes.NewReader(payload),
	)
	if err != nil {
		return err
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer "+adminToken)
	response, err := a.client.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode >= 300 {
		return fmt.Errorf("livekit delete room failed: %s", response.Status)
	}
	return nil
}

func (i *Issuer) issueAdminToken() (string, error) {
	now := i.clock.Now()
	claims := liveKitClaims{
		Video: videoGrant{RoomAdmin: true, RoomCreate: true, RoomList: true},
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    i.apiKey,
			Subject:   "watchparty-admin",
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Minute)),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(i.apiSecret)
}
