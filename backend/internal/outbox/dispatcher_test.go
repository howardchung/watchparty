package outbox_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/events"
	"github.com/mintturtle/watchparty/backend/internal/memory"
	"github.com/mintturtle/watchparty/backend/internal/outbox"
	"github.com/mintturtle/watchparty/backend/internal/platform"
)

type recordingSink struct {
	published []string
	failOn    string
}

func (s *recordingSink) Publish(_ context.Context, event events.Event) error {
	if s.failOn != "" && event.ID == s.failOn {
		return errors.New("sink unavailable")
	}
	s.published = append(s.published, event.ID)
	return nil
}

func TestDispatcherPublishesAndMarks(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	store := memory.NewOutbox()
	ctx := context.Background()
	for _, topic := range []string{events.TopicRoomCreated, events.TopicMemberJoined} {
		event, err := events.New("room-1", topic, map[string]string{"k": topic}, clock.Now())
		if err != nil {
			t.Fatalf("event: %v", err)
		}
		if err := store.Append(ctx, *event); err != nil {
			t.Fatalf("append: %v", err)
		}
	}

	sink := &recordingSink{}
	dispatcher := outbox.NewDispatcher(store, sink, clock, time.Second)

	count, err := dispatcher.Step(ctx)
	if err != nil {
		t.Fatalf("step: %v", err)
	}
	if count != 2 || len(sink.published) != 2 {
		t.Fatalf("expected 2 published, got count=%d published=%d", count, len(sink.published))
	}

	again, err := dispatcher.Step(ctx)
	if err != nil {
		t.Fatalf("second step: %v", err)
	}
	if again != 0 {
		t.Fatalf("expected no more events, got %d", again)
	}
}

func TestDispatcherRetriesFailedDelivery(t *testing.T) {
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	store := memory.NewOutbox()
	ctx := context.Background()
	first, _ := events.New("room-1", events.TopicRoomCreated, map[string]string{"n": "1"}, clock.Now())
	second, _ := events.New("room-1", events.TopicMemberJoined, map[string]string{"n": "2"}, clock.Now())
	_ = store.Append(ctx, *first)
	_ = store.Append(ctx, *second)

	sink := &recordingSink{failOn: second.ID}
	dispatcher := outbox.NewDispatcher(store, sink, clock, time.Second)

	count, err := dispatcher.Step(ctx)
	if err != nil {
		t.Fatalf("step: %v", err)
	}
	if count != 1 || len(sink.published) != 1 {
		t.Fatalf("expected one delivery before failure, got count=%d published=%d", count, len(sink.published))
	}

	sink.failOn = ""
	count, err = dispatcher.Step(ctx)
	if err != nil {
		t.Fatalf("retry step: %v", err)
	}
	if count != 1 || len(sink.published) != 2 {
		t.Fatalf("expected retry to deliver remaining event, got count=%d published=%d", count, len(sink.published))
	}
}
