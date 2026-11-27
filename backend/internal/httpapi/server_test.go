package httpapi_test

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/coder/websocket"

	"github.com/mintturtle/watchparty/backend/internal/httpapi"
	"github.com/mintturtle/watchparty/backend/internal/identity"
	"github.com/mintturtle/watchparty/backend/internal/memory"
	"github.com/mintturtle/watchparty/backend/internal/platform"
	"github.com/mintturtle/watchparty/backend/internal/realtime"
	"github.com/mintturtle/watchparty/backend/internal/room"
	"github.com/mintturtle/watchparty/backend/internal/stream"
)

const testSecret = "0123456789abcdef0123456789abcdef"

type testEnv struct {
	rooms  *room.Service
	server *httptest.Server
}

func newTestEnv(t *testing.T) *testEnv {
	t.Helper()
	clock := platform.NewManualClock(time.Unix(1_700_000_000, 0))
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	outbox := memory.NewOutbox()
	roomStore := memory.NewRoomStore(outbox)
	streamStore := memory.NewStreamStore(outbox)
	roomService := room.NewService(roomStore, nil, clock, 30*time.Second, 24*time.Hour)
	streamService := stream.NewService(streamStore, roomService, clock)
	roomService.SetStreams(streamService)
	identityService := identity.NewService(memory.NewIdentityStore(), identity.NewTokenManager(testSecret, 15*time.Minute, clock), clock, 90*24*time.Hour)
	syncEngine := realtime.NewSyncEngine(15*time.Second, clock)
	hub := realtime.NewHub(roomService, streamService, syncEngine, clock, logger)

	server := httpapi.NewServer(httpapi.Deps{
		Identity:           identityService,
		Rooms:              roomService,
		Streams:            streamService,
		Realtime:           hub,
		Tickets:            realtime.NewMemoryTicketStore(),
		Clock:              clock,
		Logger:             logger,
		RealtimeTicketTTL:  30 * time.Second,
		RateLimitPerMinute: 0,
		IdempotencyTTL:     10 * time.Minute,
	})
	httpServer := httptest.NewServer(server.Handler())
	t.Cleanup(httpServer.Close)
	return &testEnv{rooms: roomService, server: httpServer}
}

type sessionBody struct {
	Identity struct {
		ID string `json:"id"`
	} `json:"identity"`
	AccessToken string `json:"accessToken"`
}

func (e *testEnv) createGuest(t *testing.T, name string) sessionBody {
	t.Helper()
	response := e.post(t, "/v1/guest-sessions", "", map[string]string{"name": name, "avatar": "COMET", "language": "en"})
	if response.status != http.StatusCreated {
		t.Fatalf("create guest: status %d body %s", response.status, response.body)
	}
	var session sessionBody
	if err := json.Unmarshal(response.body, &session); err != nil {
		t.Fatalf("decode session: %v", err)
	}
	return session
}

type roomBody struct {
	Room struct {
		ID    string `json:"id"`
		Code  string `json:"code"`
		Title string `json:"title"`
	} `json:"room"`
	Membership struct {
		ID      string `json:"id"`
		IsOwner bool   `json:"isOwner"`
	} `json:"membership"`
}

func TestRoomLifecycleOverHTTP(t *testing.T) {
	env := newTestEnv(t)
	owner := env.createGuest(t, "Mira")

	created := env.post(t, "/v1/rooms", owner.AccessToken, map[string]string{"title": "Friday night"})
	if created.status != http.StatusCreated {
		t.Fatalf("create room: status %d body %s", created.status, created.body)
	}
	var roomRecord roomBody
	if err := json.Unmarshal(created.body, &roomRecord); err != nil {
		t.Fatalf("decode room: %v", err)
	}
	if !roomRecord.Membership.IsOwner {
		t.Fatal("expected creator to be owner")
	}

	preview := env.get(t, "/v1/rooms/"+roomRecord.Room.Code+"/preview", owner.AccessToken)
	if preview.status != http.StatusOK {
		t.Fatalf("preview: status %d body %s", preview.status, preview.body)
	}

	// The owner must be present to control the stream.
	if _, err := env.rooms.MarkConnected(context.Background(), roomRecord.Room.ID, owner.Identity.ID); err != nil {
		t.Fatalf("mark connected: %v", err)
	}
	started := env.post(t, "/v1/rooms/"+roomRecord.Room.ID+"/stream/start", owner.AccessToken, map[string]string{"url": "https://cdn.example.com/film.mp4"})
	if started.status != http.StatusCreated {
		t.Fatalf("start stream: status %d body %s", started.status, started.body)
	}

	ticket := env.post(t, "/v1/rooms/"+roomRecord.Room.ID+"/realtime-ticket", owner.AccessToken, nil)
	if ticket.status != http.StatusCreated {
		t.Fatalf("ticket: status %d body %s", ticket.status, ticket.body)
	}

	snapshot := env.get(t, "/v1/rooms/"+roomRecord.Room.ID+"/snapshot", owner.AccessToken)
	if snapshot.status != http.StatusOK {
		t.Fatalf("snapshot: status %d body %s", snapshot.status, snapshot.body)
	}
	var snapshotBody struct {
		Stream struct {
			State string `json:"state"`
		} `json:"stream"`
	}
	if err := json.Unmarshal(snapshot.body, &snapshotBody); err != nil {
		t.Fatalf("decode snapshot: %v", err)
	}
	if snapshotBody.Stream.State != "ACTIVE" {
		t.Fatalf("expected ACTIVE stream, got %s", snapshotBody.Stream.State)
	}
}

func TestHTTPErrorMappingAndIdempotency(t *testing.T) {
	env := newTestEnv(t)
	owner := env.createGuest(t, "Mira")

	unauthenticated := env.get(t, "/v1/rooms/MOON-42/preview", "")
	if unauthenticated.status != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", unauthenticated.status)
	}

	notFound := env.get(t, "/v1/rooms/MOON-42/preview", owner.AccessToken)
	if notFound.status != http.StatusNotFound {
		t.Fatalf("expected 404, got %d body %s", notFound.status, notFound.body)
	}

	first := env.postIdempotent(t, "/v1/rooms", owner.AccessToken, "key-1", map[string]string{"title": "Once"})
	second := env.postIdempotent(t, "/v1/rooms", owner.AccessToken, "key-1", map[string]string{"title": "Once"})
	if first.status != http.StatusCreated {
		t.Fatalf("expected 201, got %d", first.status)
	}
	if second.replayed != "true" {
		t.Fatalf("expected replayed response, got header %q", second.replayed)
	}
	if !bytes.Equal(first.body, second.body) {
		t.Fatalf("expected identical replay body")
	}
}

type response struct {
	status   int
	body     []byte
	replayed string
}

// TestRealtimeSocketUpgradesAndSyncs guards the middleware chain against
// breaking WebSocket hijacking and exercises snapshot, playback telemetry, and
// sync end to end through the HTTP server.
func TestRealtimeSocketUpgradesAndSyncs(t *testing.T) {
	env := newTestEnv(t)
	owner := env.createGuest(t, "Mira")

	created := env.post(t, "/v1/rooms", owner.AccessToken, map[string]string{"title": "Live"})
	if created.status != http.StatusCreated {
		t.Fatalf("create room: status %d body %s", created.status, created.body)
	}
	var roomRecord roomBody
	if err := json.Unmarshal(created.body, &roomRecord); err != nil {
		t.Fatalf("decode room: %v", err)
	}

	ticketResponse := env.post(t, "/v1/rooms/"+roomRecord.Room.ID+"/realtime-ticket", owner.AccessToken, nil)
	if ticketResponse.status != http.StatusCreated {
		t.Fatalf("ticket: status %d body %s", ticketResponse.status, ticketResponse.body)
	}
	var ticket struct {
		Ticket string `json:"ticket"`
	}
	if err := json.Unmarshal(ticketResponse.body, &ticket); err != nil {
		t.Fatalf("decode ticket: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	wsURL := strings.Replace(env.server.URL, "http", "ws", 1) + "/v1/rooms/" + roomRecord.Room.ID + "/realtime?ticket=" + ticket.Ticket
	connection, _, err := websocket.Dial(ctx, wsURL, nil)
	if err != nil {
		t.Fatalf("websocket dial: %v", err)
	}
	defer connection.Close(websocket.StatusNormalClosure, "")

	readMessage := func() map[string]any {
		readCtx, cancelRead := context.WithTimeout(ctx, 5*time.Second)
		defer cancelRead()
		_, data, err := connection.Read(readCtx)
		if err != nil {
			t.Fatalf("websocket read: %v", err)
		}
		message := map[string]any{}
		_ = json.Unmarshal(data, &message)
		return message
	}
	writeMessage := func(value any) {
		encoded, _ := json.Marshal(value)
		if err := connection.Write(ctx, websocket.MessageText, encoded); err != nil {
			t.Fatalf("websocket write: %v", err)
		}
	}

	if message := readMessage(); message["type"] != "snapshot" {
		t.Fatalf("expected snapshot, got %v", message["type"])
	}

	started := env.post(t, "/v1/rooms/"+roomRecord.Room.ID+"/stream/start", owner.AccessToken, map[string]string{"url": "https://cdn.example.com/film.mp4"})
	if started.status != http.StatusCreated {
		t.Fatalf("start stream: status %d body %s", started.status, started.body)
	}
	var streamBody struct {
		Stream struct {
			SessionID string `json:"sessionId"`
		} `json:"stream"`
	}
	if err := json.Unmarshal(started.body, &streamBody); err != nil {
		t.Fatalf("decode stream: %v", err)
	}
	if !bytes.Contains(started.body, []byte(`"sessionId"`)) {
		t.Fatalf("stream payload must use camelCase field names, got %s", started.body)
	}

	writeMessage(map[string]any{"type": "playback.report", "streamSessionId": streamBody.Stream.SessionID, "positionMs": 5000, "playing": true})
	writeMessage(map[string]any{"type": "sync.request", "streamSessionId": streamBody.Stream.SessionID, "positionMs": 1000})

	var syncResult map[string]any
	for i := 0; i < 15; i++ {
		message := readMessage()
		if message["type"] == "sync.result" {
			syncResult = message
			break
		}
	}
	if syncResult == nil {
		t.Fatal("expected a sync.result message")
	}
	if syncResult["status"] != "APPLIED" {
		t.Fatalf("expected APPLIED, got %v", syncResult["status"])
	}
	if target, _ := syncResult["targetPositionMs"].(float64); target != 5000 {
		t.Fatalf("expected target 5000, got %v", target)
	}
}

// TestRealtimeReconnectKeepsOwnerPresent guards against a stale disconnect
// clobbering a newer connect. A client that reconnects before the server has
// detected its old socket as dead briefly has two overlapping connections for
// the same membership; the owner must remain present until the last one
// detaches.
func TestRealtimeReconnectKeepsOwnerPresent(t *testing.T) {
	env := newTestEnv(t)
	owner := env.createGuest(t, "Mira")

	created := env.post(t, "/v1/rooms", owner.AccessToken, map[string]string{"title": "Live"})
	if created.status != http.StatusCreated {
		t.Fatalf("create room: status %d body %s", created.status, created.body)
	}
	var roomRecord roomBody
	if err := json.Unmarshal(created.body, &roomRecord); err != nil {
		t.Fatalf("decode room: %v", err)
	}
	roomID := roomRecord.Room.ID

	issueTicket := func() string {
		t.Helper()
		resp := env.post(t, "/v1/rooms/"+roomID+"/realtime-ticket", owner.AccessToken, nil)
		if resp.status != http.StatusCreated {
			t.Fatalf("ticket: status %d body %s", resp.status, resp.body)
		}
		var ticket struct {
			Ticket string `json:"ticket"`
		}
		if err := json.Unmarshal(resp.body, &ticket); err != nil {
			t.Fatalf("decode ticket: %v", err)
		}
		return ticket.Ticket
	}

	dial := func(ticket string) *websocket.Conn {
		t.Helper()
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		wsURL := strings.Replace(env.server.URL, "http", "ws", 1) + "/v1/rooms/" + roomID + "/realtime?ticket=" + ticket
		connection, _, err := websocket.Dial(ctx, wsURL, nil)
		if err != nil {
			t.Fatalf("websocket dial: %v", err)
		}
		// Consume the initial snapshot so the connection is fully attached.
		readCtx, cancelRead := context.WithTimeout(ctx, 5*time.Second)
		defer cancelRead()
		_, _, err = connection.Read(readCtx)
		if err != nil {
			t.Fatalf("websocket read: %v", err)
		}
		return connection
	}

	first := dial(issueTicket())
	second := dial(issueTicket())

	ownerPresent := func() bool {
		t.Helper()
		snap := env.get(t, "/v1/rooms/"+roomID+"/snapshot", owner.AccessToken)
		if snap.status != http.StatusOK {
			t.Fatalf("snapshot: status %d body %s", snap.status, snap.body)
		}
		var body struct {
			Members []struct {
				IsOwner bool `json:"isOwner"`
				Present bool `json:"present"`
			} `json:"members"`
		}
		if err := json.Unmarshal(snap.body, &body); err != nil {
			t.Fatalf("decode snapshot: %v", err)
		}
		for _, m := range body.Members {
			if m.IsOwner {
				return m.Present
			}
		}
		t.Fatal("owner membership missing from snapshot")
		return false
	}

	if !ownerPresent() {
		t.Fatal("expected owner present while connected")
	}

	_ = first.Close(websocket.StatusNormalClosure, "")

	// The owner must stay present because the second connection is still
	// attached, even after the server processes the first connection's
	// disconnect.
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		if !ownerPresent() {
			t.Fatal("owner incorrectly marked absent while a live connection remains")
		}
		time.Sleep(25 * time.Millisecond)
	}

	_ = second.Close(websocket.StatusNormalClosure, "")
}

func (e *testEnv) post(t *testing.T, path, token string, payload any) response {
	t.Helper()
	return e.do(t, http.MethodPost, path, token, payload, "")
}

func (e *testEnv) postIdempotent(t *testing.T, path, token, key string, payload any) response {
	t.Helper()
	return e.do(t, http.MethodPost, path, token, payload, key)
}

func (e *testEnv) get(t *testing.T, path, token string) response {
	t.Helper()
	return e.do(t, http.MethodGet, path, token, nil, "")
}

func (e *testEnv) do(t *testing.T, method, path, token string, payload any, idempotencyKey string) response {
	t.Helper()
	var body io.Reader
	if payload != nil {
		encoded, err := json.Marshal(payload)
		if err != nil {
			t.Fatalf("encode payload: %v", err)
		}
		body = bytes.NewReader(encoded)
	}
	request, err := http.NewRequest(method, e.server.URL+path, body)
	if err != nil {
		t.Fatalf("request: %v", err)
	}
	if token != "" {
		request.Header.Set("Authorization", "Bearer "+token)
	}
	if idempotencyKey != "" {
		request.Header.Set("Idempotency-Key", idempotencyKey)
	}
	httpResponse, err := e.server.Client().Do(request)
	if err != nil {
		t.Fatalf("do request: %v", err)
	}
	defer httpResponse.Body.Close()
	responseBody, err := io.ReadAll(httpResponse.Body)
	if err != nil {
		t.Fatalf("read body: %v", err)
	}
	return response{status: httpResponse.StatusCode, body: responseBody, replayed: httpResponse.Header.Get("Idempotency-Replayed")}
}
