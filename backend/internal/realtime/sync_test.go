package realtime_test

import (
	"errors"
	"testing"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/platform"
	"github.com/mintturtle/watchparty/backend/internal/realtime"
)

func TestSyncUnavailableWithoutReports(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	engine := realtime.NewSyncEngine(15*time.Second, clock)

	result := engine.Sync("room-1", "session-1", 0)
	if result.Status != realtime.SyncUnavailable {
		t.Fatalf("expected UNAVAILABLE, got %s", result.Status)
	}
}

func TestSyncProjectsPlayingPositions(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	engine := realtime.NewSyncEngine(15*time.Second, clock)

	engine.Record(realtime.Report{
		RoomID:          "room-1",
		MembershipID:    "member-a",
		StreamSessionID: "session-1",
		PositionMs:      1_000,
		Playing:         true,
		ReceivedAt:      clock.Now(),
	})
	clock.Advance(3 * time.Second)

	result := engine.Sync("room-1", "session-1", 500)
	if result.Status != realtime.SyncApplied {
		t.Fatalf("expected APPLIED, got %s", result.Status)
	}
	if result.TargetMs != 4_000 {
		t.Fatalf("expected projected target 4000, got %d", result.TargetMs)
	}
}

func TestSyncNeverRewindsRequester(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	engine := realtime.NewSyncEngine(15*time.Second, clock)

	engine.Record(realtime.Report{
		RoomID:          "room-1",
		MembershipID:    "member-a",
		StreamSessionID: "session-1",
		PositionMs:      4_000,
		Playing:         false,
		ReceivedAt:      clock.Now(),
	})

	result := engine.Sync("room-1", "session-1", 10_000)
	if result.Status != realtime.SyncAlreadyLeading {
		t.Fatalf("expected ALREADY_LEADING, got %s", result.Status)
	}
	if result.TargetMs != 10_000 {
		t.Fatalf("expected requester position preserved, got %d", result.TargetMs)
	}
}

func TestSyncIgnoresStaleAndOtherSessions(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	engine := realtime.NewSyncEngine(15*time.Second, clock)

	engine.Record(realtime.Report{
		RoomID:          "room-1",
		MembershipID:    "member-a",
		StreamSessionID: "session-1",
		PositionMs:      9_000,
		Playing:         false,
		ReceivedAt:      clock.Now(),
	})
	engine.Record(realtime.Report{
		RoomID:          "room-1",
		MembershipID:    "member-b",
		StreamSessionID: "session-old",
		PositionMs:      50_000,
		Playing:         false,
		ReceivedAt:      clock.Now(),
	})

	if result := engine.Sync("room-1", "session-2", 0); result.Status != realtime.SyncUnavailable {
		t.Fatalf("expected UNAVAILABLE for unknown session, got %s", result.Status)
	}

	clock.Advance(16 * time.Second)
	if result := engine.Sync("room-1", "session-1", 0); result.Status != realtime.SyncUnavailable {
		t.Fatalf("expected UNAVAILABLE for stale report, got %s", result.Status)
	}
}

func TestSyncSelectsGreatestFreshPosition(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	engine := realtime.NewSyncEngine(15*time.Second, clock)

	engine.Record(realtime.Report{RoomID: "room-1", MembershipID: "a", StreamSessionID: "s", PositionMs: 2_000, Playing: false, ReceivedAt: clock.Now()})
	engine.Record(realtime.Report{RoomID: "room-1", MembershipID: "b", StreamSessionID: "s", PositionMs: 6_000, Playing: false, ReceivedAt: clock.Now()})
	engine.Record(realtime.Report{RoomID: "room-1", MembershipID: "c", StreamSessionID: "s", PositionMs: 1_000, Playing: false, ReceivedAt: clock.Now()})

	result := engine.Sync("room-1", "s", 0)
	if result.TargetMs != 6_000 || result.Status != realtime.SyncApplied {
		t.Fatalf("expected target 6000 APPLIED, got %+v", result)
	}
}

func TestTicketsAreSingleUseAndExpire(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	store := realtime.NewMemoryTicketStore()

	ticket := realtime.Ticket{
		ID:           "ticket-1",
		RoomID:       "room-1",
		IdentityID:   "identity-1",
		MembershipID: "membership-1",
		ExpiresAt:    clock.Now().Add(30 * time.Second),
	}
	if err := store.Issue(ticket); err != nil {
		t.Fatalf("issue: %v", err)
	}
	if _, err := store.Consume(ticket.ID, clock.Now()); err != nil {
		t.Fatalf("first consume: %v", err)
	}
	if _, err := store.Consume(ticket.ID, clock.Now()); !errors.Is(err, realtime.ErrTicketNotFound) {
		t.Fatalf("expected ErrTicketNotFound on reuse, got %v", err)
	}

	expiring := ticket
	expiring.ID = "ticket-2"
	_ = store.Issue(expiring)
	clock.Advance(31 * time.Second)
	if _, err := store.Consume(expiring.ID, clock.Now()); !errors.Is(err, realtime.ErrTicketExpired) {
		t.Fatalf("expected ErrTicketExpired, got %v", err)
	}
}
