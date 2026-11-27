package voice

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/mintturtle/watchparty/backend/internal/platform"
)

// TokenRequest describes the member receiving a voice token.
type TokenRequest struct {
	RoomID       string
	MembershipID string
	DisplayName  string
	Avatar       string
}

// Token is a room-scoped LiveKit join credential.
type Token struct {
	Token     string    `json:"token"`
	URL       string    `json:"url"`
	ExpiresAt time.Time `json:"expiresAt"`
}

// WebhookEvent is a signed LiveKit server event.
type WebhookEvent struct {
	Event       string             `json:"event"`
	Room        WebhookRoom        `json:"room"`
	Participant WebhookParticipant `json:"participant"`
}

// WebhookRoom identifies the room in a webhook event. Its name is our room ID.
type WebhookRoom struct {
	Name string `json:"name"`
}

// WebhookParticipant identifies the participant; its identity is our
// membership ID.
type WebhookParticipant struct {
	Identity string `json:"identity"`
}

type videoGrant struct {
	RoomJoin          bool     `json:"roomJoin"`
	Room              string   `json:"room"`
	CanPublish        bool     `json:"canPublish"`
	CanSubscribe      bool     `json:"canSubscribe"`
	CanPublishData    bool     `json:"canPublishData"`
	CanPublishSources []string `json:"canPublishSources,omitempty"`
	RoomAdmin         bool     `json:"roomAdmin"`
	RoomCreate        bool     `json:"roomCreate"`
	RoomList          bool     `json:"roomList"`
}

type liveKitClaims struct {
	Name     string     `json:"name,omitempty"`
	Metadata string     `json:"metadata,omitempty"`
	Video    videoGrant `json:"video"`
	jwt.RegisteredClaims
}

type webhookClaims struct {
	SHA256 string `json:"sha256"`
	jwt.RegisteredClaims
}

// Issuer signs LiveKit access tokens and verifies signed webhooks.
type Issuer struct {
	url       string
	apiKey    string
	apiSecret []byte
	ttl       time.Duration
	clock     platform.Clock
}

// NewIssuer builds a LiveKit issuer.
func NewIssuer(url, apiKey, apiSecret string, ttl time.Duration, clock platform.Clock) *Issuer {
	return &Issuer{url: url, apiKey: apiKey, apiSecret: []byte(apiSecret), ttl: ttl, clock: clock}
}

// Configured reports whether the issuer has usable credentials.
func (i *Issuer) Configured() bool {
	return i.url != "" && i.apiKey != "" && len(i.apiSecret) > 0
}

// Issue creates a five-minute room-scoped token. Grants allow microphone
// publishing and subscription and deny video, data, recording, and admin.
func (i *Issuer) Issue(request TokenRequest) (Token, error) {
	if !i.Configured() {
		return Token{}, ErrNotConfigured
	}
	now := i.clock.Now()
	expiresAt := now.Add(i.ttl)

	metadata := "{}"
	if encoded, err := json.Marshal(map[string]string{"avatar": request.Avatar}); err == nil {
		metadata = string(encoded)
	}
	claims := liveKitClaims{
		Name:     request.DisplayName,
		Metadata: metadata,
		Video: videoGrant{
			RoomJoin:          true,
			Room:              request.RoomID,
			CanPublish:        true,
			CanSubscribe:      true,
			CanPublishData:    false,
			CanPublishSources: []string{"microphone"},
			RoomAdmin:         false,
			RoomCreate:        false,
		},
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    i.apiKey,
			Subject:   request.MembershipID,
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
		},
	}
	signed, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(i.apiSecret)
	if err != nil {
		return Token{}, err
	}
	return Token{Token: signed, URL: i.url, ExpiresAt: expiresAt}, nil
}

// VerifyWebhook validates the Authorization token and decodes the event body.
func (i *Issuer) VerifyWebhook(rawToken string, body []byte) (WebhookEvent, error) {
	if !i.Configured() {
		return WebhookEvent{}, ErrNotConfigured
	}
	claims := &webhookClaims{}
	token, err := jwt.ParseWithClaims(rawToken, claims, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidWebhook
		}
		return i.apiSecret, nil
	}, jwt.WithTimeFunc(i.clock.Now))
	if err != nil || !token.Valid {
		return WebhookEvent{}, ErrInvalidWebhook
	}
	if claims.SHA256 != "" {
		sum := sha256.Sum256(body)
		if claims.SHA256 != base64.StdEncoding.EncodeToString(sum[:]) {
			return WebhookEvent{}, ErrInvalidWebhook
		}
	}
	var event WebhookEvent
	if err := json.Unmarshal(body, &event); err != nil {
		return WebhookEvent{}, ErrInvalidWebhook
	}
	return event, nil
}
