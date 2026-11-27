package realtime

import (
	"sync"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/platform"
)

// Report is a playback telemetry sample from a member.
type Report struct {
	RoomID          string
	MembershipID    string
	StreamSessionID string
	PositionMs      int64
	Playing         bool
	ReceivedAt      time.Time
}

// SyncStatus is the outcome of a sync request.
type SyncStatus string

const (
	// SyncApplied means the requester should move to the returned target.
	SyncApplied SyncStatus = "APPLIED"
	// SyncAlreadyLeading means the requester is at or ahead of the target and
	// must not be rewound.
	SyncAlreadyLeading SyncStatus = "ALREADY_LEADING"
	// SyncUnavailable means no fresh telemetry exists for the stream session.
	SyncUnavailable SyncStatus = "UNAVAILABLE"
)

// SyncResult carries only a target position and status. It never reveals
// participant drift or leader identity.
type SyncResult struct {
	TargetMs int64
	Status   SyncStatus
}

// SyncEngine retains recent playback reports and computes sync targets.
type SyncEngine struct {
	mu        sync.Mutex
	reports   map[string]map[string]Report
	retention time.Duration
	clock     platform.Clock
}

// NewSyncEngine builds a sync engine retaining reports for the given window.
func NewSyncEngine(retention time.Duration, clock platform.Clock) *SyncEngine {
	return &SyncEngine{
		reports:   make(map[string]map[string]Report),
		retention: retention,
		clock:     clock,
	}
}

// Record stores the latest report for a member.
func (e *SyncEngine) Record(report Report) {
	e.mu.Lock()
	defer e.mu.Unlock()
	byMember := e.reports[report.RoomID]
	if byMember == nil {
		byMember = make(map[string]Report)
		e.reports[report.RoomID] = byMember
	}
	byMember[report.MembershipID] = report
}

// Sync selects the greatest fresh position for the stream session and reports
// what the requester should do. The requester is never rewound.
func (e *SyncEngine) Sync(roomID, streamSessionID string, requesterPositionMs int64) SyncResult {
	e.mu.Lock()
	defer e.mu.Unlock()
	now := e.clock.Now()
	byMember := e.reports[roomID]
	best := int64(-1)
	for membershipID, report := range byMember {
		if report.StreamSessionID != streamSessionID {
			continue
		}
		age := now.Sub(report.ReceivedAt)
		if age > e.retention {
			delete(byMember, membershipID)
			continue
		}
		projected := report.PositionMs
		if report.Playing {
			projected += age.Milliseconds()
		}
		if projected > best {
			best = projected
		}
	}
	switch {
	case best < 0:
		return SyncResult{Status: SyncUnavailable}
	case best <= requesterPositionMs:
		return SyncResult{TargetMs: requesterPositionMs, Status: SyncAlreadyLeading}
	default:
		return SyncResult{TargetMs: best, Status: SyncApplied}
	}
}
