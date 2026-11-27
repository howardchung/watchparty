package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/mintturtle/watchparty/backend/internal/config"
	"github.com/mintturtle/watchparty/backend/internal/httpapi"
	"github.com/mintturtle/watchparty/backend/internal/identity"
	"github.com/mintturtle/watchparty/backend/internal/outbox"
	"github.com/mintturtle/watchparty/backend/internal/platform"
	"github.com/mintturtle/watchparty/backend/internal/postgres"
	"github.com/mintturtle/watchparty/backend/internal/realtime"
	"github.com/mintturtle/watchparty/backend/internal/room"
	"github.com/mintturtle/watchparty/backend/internal/stream"
	"github.com/mintturtle/watchparty/backend/internal/voice"
)

func main() {
	if len(os.Args) > 1 && os.Args[1] == "-healthcheck" {
		if err := healthcheck(); err != nil {
			os.Exit(1)
		}
		return
	}
	if err := run(); err != nil {
		slog.Error("fatal", "error", err)
		os.Exit(1)
	}
}

// healthcheck probes the local health endpoint. It backs the container
// healthcheck on distroless images that ship no shell or HTTP client.
func healthcheck() error {
	addr := os.Getenv("HAM_HTTP_ADDR")
	if addr == "" {
		addr = ":8080"
	}
	_, port, err := net.SplitHostPort(addr)
	if err != nil {
		port = "8080"
	}
	client := &http.Client{Timeout: 3 * time.Second}
	response, err := client.Get("http://127.0.0.1:" + port + "/healthz")
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("unhealthy: %s", response.Status)
	}
	return nil
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	logger := platform.NewLogger(cfg.LogLevel)
	clock := platform.SystemClock{}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	store, err := postgres.New(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer store.Close()
	if err := store.Migrate(ctx); err != nil {
		return err
	}

	// Compile-time verification that the store satisfies every repository port.
	var (
		_ identity.Repository = store
		_ room.Repository     = store
		_ stream.Repository   = store
		_ outbox.Store        = store
	)

	identityService := identity.NewService(
		store,
		identity.NewTokenManager(cfg.AccessTokenSecret, cfg.AccessTokenTTL, clock),
		clock,
		cfg.RefreshTokenTTL,
	)

	roomService := room.NewService(store, nil, clock, cfg.DisconnectGrace, cfg.TombstoneTTL)
	streamService := stream.NewService(store, roomService, clock)
	roomService.SetStreams(streamService)

	voiceIssuer := voice.NewIssuer(cfg.LiveKitURL, cfg.LiveKitAPIKey, cfg.LiveKitAPISecret, cfg.LiveKitTokenTTL, clock)
	var voiceAdmin voice.RoomAdmin
	if voiceIssuer.Configured() {
		voiceAdmin = voice.NewLiveKitAdmin(cfg.LiveKitURL, voiceIssuer)
	}
	voiceService := voice.NewService(voiceIssuer, roomService, voiceAdmin)
	roomService.WithCloser(voiceService)

	syncEngine := realtime.NewSyncEngine(cfg.PlaybackSyncWindow, clock)
	hub := realtime.NewHub(roomService, streamService, syncEngine, clock, logger)
	tickets := realtime.NewMemoryTicketStore()

	dispatcher := outbox.NewDispatcher(store, hub, clock, cfg.RealtimeOutboxPeriod)

	server := httpapi.NewServer(httpapi.Deps{
		Identity:           identityService,
		Rooms:              roomService,
		Streams:            streamService,
		Realtime:           hub,
		Tickets:            tickets,
		Voice:              voiceService,
		Clock:              clock,
		Logger:             logger,
		RealtimeTicketTTL:  cfg.RealtimeTicketTTL,
		RateLimitPerMinute: cfg.RateLimitPerMinute,
		IdempotencyTTL:     10 * time.Minute,
	})

	httpServer := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           server.Handler(),
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		if err := dispatcher.Run(ctx); err != nil && !errors.Is(err, context.Canceled) {
			logger.Error("outbox dispatcher stopped", "error", err)
		}
	}()
	go reconcileLoop(ctx, roomService, logger)
	go ticketPruneLoop(ctx, tickets, clock)

	serveErr := make(chan error, 1)
	go func() {
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serveErr <- err
		}
	}()

	logger.Info("api listening", "addr", cfg.HTTPAddr, "voiceEnabled", voiceService.Enabled())

	select {
	case err := <-serveErr:
		return err
	case <-ctx.Done():
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return httpServer.Shutdown(shutdownCtx)
}

func reconcileLoop(ctx context.Context, rooms *room.Service, logger *slog.Logger) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if err := rooms.Reconcile(ctx); err != nil {
				logger.Warn("room reconcile failed", "error", err)
			}
		}
	}
}

func ticketPruneLoop(ctx context.Context, tickets *realtime.MemoryTicketStore, clock platform.Clock) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			tickets.Prune(clock.Now())
		}
	}
}
