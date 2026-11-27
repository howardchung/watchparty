package stream_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/memory"
	"github.com/mintturtle/watchparty/backend/internal/platform"
	"github.com/mintturtle/watchparty/backend/internal/stream"
)

type allowAuth struct{ allowed bool }

func (a allowAuth) CanManageStream(context.Context, string, string) (bool, error) {
	return a.allowed, nil
}

func newService(allowed bool, clock platform.Clock) (*stream.Service, *memory.Outbox) {
	outbox := memory.NewOutbox()
	store := memory.NewStreamStore(outbox)
	return stream.NewService(store, allowAuth{allowed: allowed}, clock), outbox
}

func TestStartCreatesActiveStream(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, outbox := newService(true, clock)

	started, err := service.Start(context.Background(), "room-1", "owner-1", "  https://cdn.example.com/film.mp4  ")
	if err != nil {
		t.Fatalf("start: %v", err)
	}
	if started.State != stream.StateActive {
		t.Fatalf("expected active, got %s", started.State)
	}
	if started.Revision != 1 {
		t.Fatalf("expected revision 1, got %d", started.Revision)
	}
	if started.SessionID == "" {
		t.Fatal("expected a stream session id")
	}
	if started.URL != "https://cdn.example.com/film.mp4" {
		t.Fatalf("expected normalized url, got %q", started.URL)
	}

	state, err := service.CurrentState(context.Background(), "room-1")
	if err != nil {
		t.Fatalf("current state: %v", err)
	}
	if state != stream.StateActive {
		t.Fatalf("expected ACTIVE, got %s", state)
	}
	if len(outbox.Snapshot()) != 1 {
		t.Fatalf("expected one outbox event, got %d", len(outbox.Snapshot()))
	}
}

func TestStartRequiresAuthorization(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, _ := newService(false, clock)

	if _, err := service.Start(context.Background(), "room-1", "guest-1", "https://cdn.example.com/film.mp4"); !errors.Is(err, stream.ErrForbidden) {
		t.Fatalf("expected ErrForbidden, got %v", err)
	}
}

func TestStartRejectsNonHTTPS(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, _ := newService(true, clock)

	for _, raw := range []string{"http://cdn.example.com/film.mp4", "ftp://x/y", "not-a-url", ""} {
		if _, err := service.Start(context.Background(), "room-1", "owner-1", raw); !errors.Is(err, stream.ErrInvalidURL) {
			t.Fatalf("expected ErrInvalidURL for %q, got %v", raw, err)
		}
	}
}

func TestStartWhileActiveFails(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, _ := newService(true, clock)

	if _, err := service.Start(context.Background(), "room-1", "owner-1", "https://cdn.example.com/one.mp4"); err != nil {
		t.Fatalf("start: %v", err)
	}
	if _, err := service.Start(context.Background(), "room-1", "owner-1", "https://cdn.example.com/two.mp4"); !errors.Is(err, stream.ErrActive) {
		t.Fatalf("expected ErrActive, got %v", err)
	}
}

func TestAbortStopsStream(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, _ := newService(true, clock)

	if _, err := service.Start(context.Background(), "room-1", "owner-1", "https://cdn.example.com/film.mp4"); err != nil {
		t.Fatalf("start: %v", err)
	}
	aborted, err := service.Abort(context.Background(), "room-1", "owner-1")
	if err != nil {
		t.Fatalf("abort: %v", err)
	}
	if aborted.State != stream.StateAborted || aborted.Revision != 2 {
		t.Fatalf("unexpected aborted stream %+v", aborted)
	}
	if _, err := service.Abort(context.Background(), "room-1", "owner-1"); !errors.Is(err, stream.ErrNoActiveStream) {
		t.Fatalf("expected ErrNoActiveStream, got %v", err)
	}
}

func TestCurrentStateDefaultsToEmpty(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, _ := newService(true, clock)

	state, err := service.CurrentState(context.Background(), "missing")
	if err != nil {
		t.Fatalf("current state: %v", err)
	}
	if state != stream.StateEmpty {
		t.Fatalf("expected EMPTY, got %s", state)
	}
}
