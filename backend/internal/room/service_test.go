package room_test

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/events"
	"github.com/mintturtle/watchparty/backend/internal/memory"
	"github.com/mintturtle/watchparty/backend/internal/platform"
	"github.com/mintturtle/watchparty/backend/internal/room"
	"github.com/mintturtle/watchparty/backend/internal/stream"
)

type staticStreams struct{ state stream.State }

func (s staticStreams) CurrentState(context.Context, string) (stream.State, error) {
	return s.state, nil
}

func newService(clock platform.Clock) (*room.Service, *memory.Outbox) {
	outbox := memory.NewOutbox()
	store := memory.NewRoomStore(outbox)
	service := room.NewService(store, staticStreams{state: stream.StateEmpty}, clock, 30*time.Second, 24*time.Hour)
	return service, outbox
}

func TestCreateRoomDefaults(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, _ := newService(clock)

	r, owner, err := service.Create(context.Background(), "owner-1", "Mira", "COMET", "")
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if len(r.Code) != 8 {
		t.Fatalf("expected an eight character code, got %q", r.Code)
	}
	if r.Title != "Mira's party" {
		t.Fatalf("unexpected default title %q", r.Title)
	}
	if !owner.IsOwner {
		t.Fatal("expected creator to be owner")
	}
	if owner.GraceExpiresAt == nil {
		t.Fatal("expected a pending connect deadline")
	}
}

func TestPreviewNormalizesCode(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, _ := newService(clock)

	r, _, err := service.Create(context.Background(), "owner-1", "Mira", "COMET", "Friday night")
	if err != nil {
		t.Fatalf("create: %v", err)
	}

	dashed := strings.ToLower(r.Code[:4] + "-" + r.Code[4:])
	preview, err := service.Preview(context.Background(), dashed)
	if err != nil {
		t.Fatalf("preview: %v", err)
	}
	if preview.Title != "Friday night" || preview.OwnerName != "Mira" {
		t.Fatalf("unexpected preview %+v", preview)
	}
	if preview.Availability != room.AvailabilityOpen {
		t.Fatalf("expected OPEN, got %s", preview.Availability)
	}
	if preview.ParticipantCount != 1 {
		t.Fatalf("expected one participant, got %d", preview.ParticipantCount)
	}
}

func TestGuestLimitReservesOwnerSeat(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, _ := newService(clock)
	ctx := context.Background()

	r, _, err := service.Create(ctx, "owner-1", "Mira", "COMET", "")
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	for i := 0; i < room.GuestLimit; i++ {
		if _, _, err := service.Join(ctx, r.Code, fmt.Sprintf("guest-%d", i), fmt.Sprintf("Guest %d", i), "BERRY"); err != nil {
			t.Fatalf("join guest %d: %v", i, err)
		}
	}
	if _, _, err := service.Join(ctx, r.Code, "guest-overflow", "Overflow", "BERRY"); !errors.Is(err, room.ErrFull) {
		t.Fatalf("expected ErrFull, got %v", err)
	}

	preview, _ := service.Preview(ctx, r.Code)
	if preview.Availability != room.AvailabilityFull {
		t.Fatalf("expected FULL, got %s", preview.Availability)
	}
}

func TestOwnerCanRejoinWhenGuestsFull(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, _ := newService(clock)
	ctx := context.Background()

	r, _, _ := service.Create(ctx, "owner-1", "Mira", "COMET", "")
	for i := 0; i < room.GuestLimit; i++ {
		if _, _, err := service.Join(ctx, r.Code, fmt.Sprintf("guest-%d", i), "Guest", "BERRY"); err != nil {
			t.Fatalf("join guest %d: %v", i, err)
		}
	}

	if closed, err := service.Leave(ctx, r.ID, "owner-1"); err != nil || closed {
		t.Fatalf("owner leave: closed=%v err=%v", closed, err)
	}
	_, owner, err := service.Join(ctx, r.Code, "owner-1", "Mira", "COMET")
	if err != nil {
		t.Fatalf("owner rejoin: %v", err)
	}
	if !owner.IsOwner {
		t.Fatal("expected owner seat to be restored")
	}
}

func TestExplicitLeaveOfLastMemberClosesRoom(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, outbox := newService(clock)
	ctx := context.Background()

	r, _, _ := service.Create(ctx, "owner-1", "Mira", "COMET", "")
	closed, err := service.Leave(ctx, r.ID, "owner-1")
	if err != nil {
		t.Fatalf("leave: %v", err)
	}
	if !closed {
		t.Fatal("expected the room to close on the last leave")
	}

	preview, err := service.Preview(ctx, r.Code)
	if err != nil {
		t.Fatalf("preview: %v", err)
	}
	if preview.Availability != room.AvailabilityEnded {
		t.Fatalf("expected ENDED, got %s", preview.Availability)
	}
	if !containsTopic(outbox.Snapshot(), events.TopicRoomClosed) {
		t.Fatal("expected a room.closed event")
	}
}

func TestOwnerLeaveEmitsOwnerPresence(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, outbox := newService(clock)
	ctx := context.Background()

	r, _, _ := service.Create(ctx, "owner-1", "Mira", "COMET", "")
	if _, _, err := service.Join(ctx, r.Code, "guest-1", "Guest", "BERRY"); err != nil {
		t.Fatalf("join: %v", err)
	}

	closed, err := service.Leave(ctx, r.ID, "owner-1")
	if err != nil {
		t.Fatalf("leave: %v", err)
	}
	if closed {
		t.Fatal("expected the room to stay open while a guest holds a seat")
	}

	var presence *events.Event
	for _, event := range outbox.Snapshot() {
		if event.Topic == events.TopicOwnerPresence {
			copy := event
			presence = &copy
		}
	}
	if presence == nil {
		t.Fatal("expected an owner.presence event when the owner leaves")
	}
	var payload struct {
		Present   bool   `json:"present"`
		OwnerName string `json:"ownerName"`
	}
	if err := json.Unmarshal(presence.Payload, &payload); err != nil {
		t.Fatalf("decode owner.presence: %v", err)
	}
	if payload.Present {
		t.Fatal("expected the leaving owner to be reported absent")
	}
}

func TestIdentityCannotJoinTwoRooms(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, _ := newService(clock)
	ctx := context.Background()

	first, _, _ := service.Create(ctx, "owner-1", "Mira", "COMET", "")
	second, _, _ := service.Create(ctx, "owner-2", "Nika", "MINT", "")

	if _, _, err := service.Join(ctx, first.Code, "guest-x", "Guest", "BERRY"); err != nil {
		t.Fatalf("first join: %v", err)
	}
	if _, _, err := service.Join(ctx, second.Code, "guest-x", "Guest", "BERRY"); !errors.Is(err, room.ErrAlreadyInRoom) {
		t.Fatalf("expected ErrAlreadyInRoom, got %v", err)
	}
}

func TestPresenceLifecycleAndGrace(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, _ := newService(clock)
	ctx := context.Background()

	r, _, _ := service.Create(ctx, "owner-1", "Mira", "COMET", "")
	if _, _, err := service.Join(ctx, r.Code, "guest-1", "Guest", "BERRY"); err != nil {
		t.Fatalf("join: %v", err)
	}

	connected, err := service.MarkConnected(ctx, r.ID, "guest-1")
	if err != nil {
		t.Fatalf("connect: %v", err)
	}
	if !connected.Present() {
		t.Fatal("expected member to be present after connect")
	}

	disconnected, err := service.MarkDisconnected(ctx, r.ID, "guest-1")
	if err != nil {
		t.Fatalf("disconnect: %v", err)
	}
	if disconnected.Present() {
		t.Fatal("expected member to be absent after disconnect")
	}
	if !disconnected.SeatHeld(clock.Now()) {
		t.Fatal("expected seat held during grace")
	}

	clock.Advance(31 * time.Second)
	if disconnected.SeatHeld(clock.Now()) {
		t.Fatal("expected seat released after grace")
	}
}

func TestSetVoiceConnectedResolvesMembershipID(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, _ := newService(clock)
	ctx := context.Background()

	r, owner, err := service.Create(ctx, "owner-1", "Mira", "COMET", "")
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if _, err := service.MarkConnected(ctx, r.ID, "owner-1"); err != nil {
		t.Fatalf("connect: %v", err)
	}
	if _, err := service.MarkDisconnected(ctx, r.ID, "owner-1"); err != nil {
		t.Fatalf("disconnect: %v", err)
	}

	// LiveKit webhooks identify the participant by membership ID, which differs
	// from the identity ID used elsewhere.
	if owner.ID == owner.IdentityID {
		t.Fatal("test requires distinct membership and identity IDs")
	}
	updated, err := service.SetVoiceConnected(ctx, r.ID, owner.ID, true)
	if err != nil {
		t.Fatalf("set voice connected: %v", err)
	}
	if !updated.LiveKitConnected {
		t.Fatal("expected the voice attachment to be recorded")
	}
	if !updated.Present() {
		t.Fatal("expected voice attachment to keep the member present")
	}

	released, err := service.SetVoiceConnected(ctx, r.ID, owner.ID, false)
	if err != nil {
		t.Fatalf("set voice disconnected: %v", err)
	}
	if released.LiveKitConnected {
		t.Fatal("expected the voice attachment to be cleared")
	}
}

func TestCanManageStreamRequiresPresentOwner(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, _ := newService(clock)
	ctx := context.Background()

	r, _, _ := service.Create(ctx, "owner-1", "Mira", "COMET", "")
	if ok, _ := service.CanManageStream(ctx, r.ID, "owner-1"); ok {
		t.Fatal("expected owner controls to require presence")
	}
	if _, err := service.MarkConnected(ctx, r.ID, "owner-1"); err != nil {
		t.Fatalf("connect owner: %v", err)
	}
	if ok, _ := service.CanManageStream(ctx, r.ID, "owner-1"); !ok {
		t.Fatal("expected present owner to manage the stream")
	}

	if _, _, err := service.Join(ctx, r.Code, "guest-1", "Guest", "BERRY"); err != nil {
		t.Fatalf("join: %v", err)
	}
	if _, err := service.MarkConnected(ctx, r.ID, "guest-1"); err != nil {
		t.Fatalf("connect guest: %v", err)
	}
	if ok, _ := service.CanManageStream(ctx, r.ID, "guest-1"); ok {
		t.Fatal("expected guests to be denied stream control")
	}
}

func TestReconcileClosesRoomAfterGrace(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, _ := newService(clock)
	ctx := context.Background()

	r, _, _ := service.Create(ctx, "owner-1", "Mira", "COMET", "")
	clock.Advance(31 * time.Second)
	if err := service.Reconcile(ctx); err != nil {
		t.Fatalf("reconcile: %v", err)
	}
	preview, err := service.Preview(ctx, r.Code)
	if err != nil {
		t.Fatalf("preview: %v", err)
	}
	if preview.Availability != room.AvailabilityEnded {
		t.Fatalf("expected ENDED, got %s", preview.Availability)
	}
}

func TestReconcilePurgesExpiredTombstone(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	service, _ := newService(clock)
	ctx := context.Background()

	r, _, _ := service.Create(ctx, "owner-1", "Mira", "COMET", "")
	if _, err := service.Leave(ctx, r.ID, "owner-1"); err != nil {
		t.Fatalf("leave: %v", err)
	}
	clock.Advance(25 * time.Hour)
	if err := service.Reconcile(ctx); err != nil {
		t.Fatalf("reconcile: %v", err)
	}
	if _, err := service.Preview(ctx, r.Code); !errors.Is(err, room.ErrNotFound) {
		t.Fatalf("expected ErrNotFound after purge, got %v", err)
	}
}

func containsTopic(items []events.Event, topic string) bool {
	for _, item := range items {
		if item.Topic == topic {
			return true
		}
	}
	return false
}
