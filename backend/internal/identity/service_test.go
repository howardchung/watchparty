package identity_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/identity"
	"github.com/mintturtle/watchparty/backend/internal/memory"
	"github.com/mintturtle/watchparty/backend/internal/platform"
)

const testSecret = "0123456789abcdef0123456789abcdef"

func newService(clock platform.Clock) *identity.Service {
	store := memory.NewIdentityStore()
	tokens := identity.NewTokenManager(testSecret, 15*time.Minute, clock)
	return identity.NewService(store, tokens, clock, 90*24*time.Hour)
}

func TestCreateValidatesAndIssuesSession(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service := newService(clock)

	session, err := service.Create(context.Background(), "  Mira  ", "COMET", "en")
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if session.Identity.Name != "Mira" {
		t.Fatalf("expected trimmed name, got %q", session.Identity.Name)
	}
	if session.AccessToken == "" || session.RefreshToken == "" {
		t.Fatal("expected non-empty tokens")
	}
	if !session.AccessExpiresAt.Equal(clock.Now().Add(15 * time.Minute)) {
		t.Fatalf("unexpected access expiry %s", session.AccessExpiresAt)
	}

	subject, err := service.Authenticate(session.AccessToken)
	if err != nil {
		t.Fatalf("authenticate: %v", err)
	}
	if subject != session.Identity.ID {
		t.Fatalf("expected subject %q, got %q", session.Identity.ID, subject)
	}
}

func TestInvalidProfileIsRejected(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service := newService(clock)

	cases := []struct {
		name, avatar, language string
	}{
		{"", "COMET", "en"},
		{"Mira", "", "en"},
		{"Mira", "COMET", ""},
	}
	for _, tc := range cases {
		if _, err := service.Create(context.Background(), tc.name, tc.avatar, tc.language); !errors.Is(err, identity.ErrInvalidProfile) {
			t.Fatalf("expected ErrInvalidProfile for %+v, got %v", tc, err)
		}
	}
}

func TestRefreshRotatesAndDetectsReuse(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service := newService(clock)

	first, err := service.Create(context.Background(), "Mira", "COMET", "en")
	if err != nil {
		t.Fatalf("create: %v", err)
	}

	rotated, err := service.Refresh(context.Background(), first.RefreshToken)
	if err != nil {
		t.Fatalf("refresh: %v", err)
	}
	if rotated.RefreshToken == first.RefreshToken {
		t.Fatal("expected refresh token rotation")
	}

	if _, err := service.Refresh(context.Background(), first.RefreshToken); !errors.Is(err, identity.ErrSessionRevoked) {
		t.Fatalf("expected ErrSessionRevoked on reuse, got %v", err)
	}
	// Reuse detection revokes the whole family, including the rotated token.
	if _, err := service.Refresh(context.Background(), rotated.RefreshToken); !errors.Is(err, identity.ErrSessionRevoked) {
		t.Fatalf("expected rotated session revoked, got %v", err)
	}
}

func TestRefreshRejectsExpiredSession(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service := newService(clock)

	session, err := service.Create(context.Background(), "Mira", "COMET", "en")
	if err != nil {
		t.Fatalf("create: %v", err)
	}

	clock.Advance(91 * 24 * time.Hour)

	if _, err := service.Refresh(context.Background(), session.RefreshToken); !errors.Is(err, identity.ErrSessionExpired) {
		t.Fatalf("expected ErrSessionExpired, got %v", err)
	}
}

func TestRefreshRejectsUnknownToken(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service := newService(clock)

	if _, err := service.Refresh(context.Background(), "not-a-real-token"); !errors.Is(err, identity.ErrInvalidToken) {
		t.Fatalf("expected ErrInvalidToken, got %v", err)
	}
}

func TestUpdateProfilePersistsValidatedValues(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service := newService(clock)

	session, err := service.Create(context.Background(), "Mira", "COMET", "en")
	if err != nil {
		t.Fatalf("create: %v", err)
	}

	updated, err := service.UpdateProfile(context.Background(), session.Identity.ID, " Nika ", "BERRY", "de")
	if err != nil {
		t.Fatalf("update: %v", err)
	}
	if updated.Name != "Nika" || updated.Avatar != "BERRY" || updated.Language != "de" {
		t.Fatalf("unexpected profile %+v", updated)
	}

	if _, err := service.UpdateProfile(context.Background(), session.Identity.ID, "", "BERRY", "de"); !errors.Is(err, identity.ErrInvalidProfile) {
		t.Fatalf("expected ErrInvalidProfile, got %v", err)
	}
}

func TestAuthenticateRejectsTamperedToken(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service := newService(clock)

	session, err := service.Create(context.Background(), "Mira", "COMET", "en")
	if err != nil {
		t.Fatalf("create: %v", err)
	}

	if _, err := service.Authenticate(session.AccessToken + "x"); !errors.Is(err, identity.ErrInvalidToken) {
		t.Fatalf("expected ErrInvalidToken, got %v", err)
	}
}
