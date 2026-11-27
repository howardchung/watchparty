package httpapi

import (
	"bufio"
	"bytes"
	"net"
	"net/http"
	"sync"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/platform"
)

// idempotencyStore caches successful responses for repeated Idempotency-Key
// values so retries do not repeat side effects.
type idempotencyStore struct {
	mu      sync.Mutex
	entries map[string]idempotencyEntry
	ttl     time.Duration
	clock   platform.Clock
}

type idempotencyEntry struct {
	status    int
	body      []byte
	expiresAt time.Time
}

func newIdempotencyStore(ttl time.Duration, clock platform.Clock) *idempotencyStore {
	return &idempotencyStore{entries: make(map[string]idempotencyEntry), ttl: ttl, clock: clock}
}

func (s *idempotencyStore) get(key string, now time.Time) (idempotencyEntry, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	entry, ok := s.entries[key]
	if !ok {
		return idempotencyEntry{}, false
	}
	if !now.Before(entry.expiresAt) {
		delete(s.entries, key)
		return idempotencyEntry{}, false
	}
	return entry, true
}

func (s *idempotencyStore) put(key string, entry idempotencyEntry) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.entries[key] = entry
}

type recordingWriter struct {
	http.ResponseWriter
	status int
	body   bytes.Buffer
}

func (w *recordingWriter) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}

func (w *recordingWriter) Write(data []byte) (int, error) {
	if w.status == 0 {
		w.status = http.StatusOK
	}
	w.body.Write(data)
	return w.ResponseWriter.Write(data)
}

func (w *recordingWriter) Unwrap() http.ResponseWriter { return w.ResponseWriter }

func (w *recordingWriter) Flush() {
	if flusher, ok := w.ResponseWriter.(http.Flusher); ok {
		flusher.Flush()
	}
}

func (w *recordingWriter) Hijack() (net.Conn, *bufio.ReadWriter, error) {
	hijacker, ok := w.ResponseWriter.(http.Hijacker)
	if !ok {
		return nil, nil, http.ErrNotSupported
	}
	return hijacker.Hijack()
}

// idempotent wraps a handler so a repeated Idempotency-Key replays the stored
// successful response for the same identity.
func (s *Server) idempotent(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		key := r.Header.Get("Idempotency-Key")
		if key == "" {
			next(w, r)
			return
		}
		cacheKey := identityFrom(r.Context()) + ":" + key
		if entry, ok := s.idempotency.get(cacheKey, s.clock.Now()); ok {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Idempotency-Replayed", "true")
			w.WriteHeader(entry.status)
			_, _ = w.Write(entry.body)
			return
		}
		recorder := &recordingWriter{ResponseWriter: w}
		next(recorder, r)
		if recorder.status >= 200 && recorder.status < 300 {
			s.idempotency.put(cacheKey, idempotencyEntry{
				status:    recorder.status,
				body:      recorder.body.Bytes(),
				expiresAt: s.clock.Now().Add(s.idempotency.ttl),
			})
		}
	}
}
