package voice_test

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/mintturtle/watchparty/backend/internal/platform"
	"github.com/mintturtle/watchparty/backend/internal/room"
	"github.com/mintturtle/watchparty/backend/internal/voice"
)

const (
	testAPIKey    = "api-key"
	testAPISecret = "api-secret-value"
	testURL       = "wss://livekit.example.com"
)

func TestIssueTokenRestrictsGrants(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	issuer := voice.NewIssuer(testURL, testAPIKey, testAPISecret, 5*time.Minute, clock)

	token, err := issuer.Issue(voice.TokenRequest{
		RoomID:       "room-1",
		MembershipID: "membership-1",
		DisplayName:  "Mira",
		Avatar:       "COMET",
	})
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	if token.URL != testURL {
		t.Fatalf("unexpected url %q", token.URL)
	}
	if !token.ExpiresAt.Equal(clock.Now().Add(5 * time.Minute)) {
		t.Fatalf("unexpected expiry %s", token.ExpiresAt)
	}

	parsed, err := jwt.Parse(token.Token, func(*jwt.Token) (any, error) {
		return []byte(testAPISecret), nil
	}, jwt.WithTimeFunc(clock.Now))
	if err != nil || !parsed.Valid {
		t.Fatalf("parse token: %v", err)
	}
	claims := parsed.Claims.(jwt.MapClaims)
	if claims["iss"] != testAPIKey || claims["sub"] != "membership-1" || claims["name"] != "Mira" {
		t.Fatalf("unexpected claims %+v", claims)
	}
	video, ok := claims["video"].(map[string]any)
	if !ok {
		t.Fatalf("missing video grant %+v", claims)
	}
	if video["room"] != "room-1" || video["roomJoin"] != true {
		t.Fatalf("unexpected room grant %+v", video)
	}
	if video["canPublish"] != true || video["canSubscribe"] != true {
		t.Fatalf("expected publish/subscribe grants %+v", video)
	}
	if video["canPublishData"] != false || video["roomAdmin"] != false {
		t.Fatalf("expected restricted grants %+v", video)
	}
	sources, _ := video["canPublishSources"].([]any)
	if len(sources) != 1 || sources[0] != "microphone" {
		t.Fatalf("expected microphone-only publishing, got %+v", sources)
	}
	metadata, _ := claims["metadata"].(string)
	var meta map[string]string
	if err := json.Unmarshal([]byte(metadata), &meta); err != nil || meta["avatar"] != "COMET" {
		t.Fatalf("unexpected metadata %q", metadata)
	}
}

func TestIssueRequiresConfiguration(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	issuer := voice.NewIssuer("", "", "", 5*time.Minute, clock)

	if issuer.Configured() {
		t.Fatal("expected issuer to be unconfigured")
	}
	if _, err := issuer.Issue(voice.TokenRequest{RoomID: "room-1", MembershipID: "m"}); !errors.Is(err, voice.ErrNotConfigured) {
		t.Fatalf("expected ErrNotConfigured, got %v", err)
	}
}

func TestVerifyWebhookAcceptsSignedBody(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	issuer := voice.NewIssuer(testURL, testAPIKey, testAPISecret, 5*time.Minute, clock)

	body, _ := json.Marshal(voice.WebhookEvent{
		Event:       "participant_joined",
		Room:        voice.WebhookRoom{Name: "room-1"},
		Participant: voice.WebhookParticipant{Identity: "membership-1"},
	})
	token := signWebhook(t, body, testAPISecret, clock.Now())

	event, err := issuer.VerifyWebhook(token, body)
	if err != nil {
		t.Fatalf("verify: %v", err)
	}
	if event.Event != "participant_joined" || event.Room.Name != "room-1" || event.Participant.Identity != "membership-1" {
		t.Fatalf("unexpected event %+v", event)
	}
}

func TestVerifyWebhookRejectsTamperedBody(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	issuer := voice.NewIssuer(testURL, testAPIKey, testAPISecret, 5*time.Minute, clock)

	body, _ := json.Marshal(voice.WebhookEvent{Event: "participant_left"})
	token := signWebhook(t, body, testAPISecret, clock.Now())

	if _, err := issuer.VerifyWebhook(token, []byte(`{"event":"participant_joined"}`)); !errors.Is(err, voice.ErrInvalidWebhook) {
		t.Fatalf("expected ErrInvalidWebhook, got %v", err)
	}
}

type fakeMembers struct {
	membership room.Membership
	found      bool
	voiceCalls []bool
	voiceIDs   []string
}

func (f *fakeMembers) Membership(context.Context, string, string) (room.Membership, error) {
	if !f.found {
		return room.Membership{}, room.ErrNotFound
	}
	return f.membership, nil
}

func (f *fakeMembers) SetVoiceConnected(_ context.Context, _, membershipID string, connected bool) (room.Membership, error) {
	f.voiceCalls = append(f.voiceCalls, connected)
	f.voiceIDs = append(f.voiceIDs, membershipID)
	return room.Membership{}, nil
}

func TestServiceSessionTokenRequiresMembership(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	issuer := voice.NewIssuer(testURL, testAPIKey, testAPISecret, 5*time.Minute, clock)
	members := &fakeMembers{found: false}
	service := voice.NewService(issuer, members, nil)

	if _, err := service.SessionToken(context.Background(), "room-1", "identity-1"); !errors.Is(err, voice.ErrNotMember) {
		t.Fatalf("expected ErrNotMember, got %v", err)
	}

	members.found = true
	members.membership = room.Membership{ID: "membership-1", RoomID: "room-1", IdentityID: "identity-1", DisplayName: "Mira", Avatar: "COMET"}
	if _, err := service.SessionToken(context.Background(), "room-1", "identity-1"); err != nil {
		t.Fatalf("expected token, got %v", err)
	}
}

func TestServiceWebhookUpdatesVoicePresence(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	issuer := voice.NewIssuer(testURL, testAPIKey, testAPISecret, 5*time.Minute, clock)
	members := &fakeMembers{}
	service := voice.NewService(issuer, members, nil)

	body, _ := json.Marshal(voice.WebhookEvent{Event: "participant_joined", Room: voice.WebhookRoom{Name: "room-1"}, Participant: voice.WebhookParticipant{Identity: "membership-1"}})
	token := signWebhook(t, body, testAPISecret, clock.Now())
	if err := service.HandleWebhook(context.Background(), token, body); err != nil {
		t.Fatalf("handle webhook: %v", err)
	}
	if len(members.voiceCalls) != 1 || !members.voiceCalls[0] {
		t.Fatalf("expected a voice-connected call, got %+v", members.voiceCalls)
	}
	if len(members.voiceIDs) != 1 || members.voiceIDs[0] != "membership-1" {
		t.Fatalf("expected the membership ID to be used, got %+v", members.voiceIDs)
	}
}

func signWebhook(t *testing.T, body []byte, secret string, now time.Time) string {
	t.Helper()
	sum := sha256.Sum256(body)
	claims := jwt.MapClaims{
		"sha256": base64.StdEncoding.EncodeToString(sum[:]),
		"iss":    testAPIKey,
		"iat":    now.Unix(),
		"exp":    now.Add(time.Minute).Unix(),
	}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
	if err != nil {
		t.Fatalf("sign webhook: %v", err)
	}
	return token
}
