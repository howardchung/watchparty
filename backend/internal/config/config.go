package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

// Config holds runtime configuration sourced from environment variables.
type Config struct {
	Env                  string
	HTTPAddr             string
	DatabaseURL          string
	AccessTokenSecret    string
	AccessTokenTTL       time.Duration
	RefreshTokenTTL      time.Duration
	RealtimeTicketTTL    time.Duration
	DisconnectGrace      time.Duration
	TombstoneTTL         time.Duration
	PlaybackReportTTL    time.Duration
	PlaybackSyncWindow   time.Duration
	LiveKitURL           string
	LiveKitAPIKey        string
	LiveKitAPISecret     string
	LiveKitTokenTTL      time.Duration
	LogLevel             string
	RateLimitPerMinute   int
	RealtimeOutboxPeriod time.Duration
}

// Load reads configuration from the environment, applying defaults and
// validating the values required to run the API.
func Load() (Config, error) {
	cfg := Config{
		Env:                  env("HAM_APP_ENV", "development"),
		HTTPAddr:             env("HAM_HTTP_ADDR", ":8080"),
		DatabaseURL:          env("HAM_DATABASE_URL", ""),
		AccessTokenSecret:    env("HAM_ACCESS_TOKEN_SECRET", ""),
		AccessTokenTTL:       envDuration("HAM_ACCESS_TOKEN_TTL", 15*time.Minute),
		RefreshTokenTTL:      envDuration("HAM_REFRESH_TOKEN_TTL", 90*24*time.Hour),
		RealtimeTicketTTL:    envDuration("HAM_REALTIME_TICKET_TTL", 30*time.Second),
		DisconnectGrace:      envDuration("HAM_DISCONNECT_GRACE", 30*time.Second),
		TombstoneTTL:         envDuration("HAM_TOMBSTONE_TTL", 24*time.Hour),
		PlaybackReportTTL:    envDuration("HAM_PLAYBACK_REPORT_TTL", 15*time.Second),
		PlaybackSyncWindow:   envDuration("HAM_PLAYBACK_SYNC_WINDOW", 15*time.Second),
		LiveKitURL:           env("HAM_LIVEKIT_URL", ""),
		LiveKitAPIKey:        env("HAM_LIVEKIT_API_KEY", ""),
		LiveKitAPISecret:     env("HAM_LIVEKIT_API_SECRET", ""),
		LiveKitTokenTTL:      envDuration("HAM_LIVEKIT_TOKEN_TTL", 2*time.Hour),
		LogLevel:             env("HAM_LOG_LEVEL", "info"),
		RateLimitPerMinute:   envInt("HAM_RATE_LIMIT_PER_MINUTE", 120),
		RealtimeOutboxPeriod: envDuration("HAM_OUTBOX_PERIOD", 250*time.Millisecond),
	}

	if err := cfg.validate(); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func (c Config) validate() error {
	var problems []string
	if strings.TrimSpace(c.DatabaseURL) == "" {
		problems = append(problems, "HAM_DATABASE_URL is required")
	}
	if len(c.AccessTokenSecret) < 16 {
		problems = append(problems, "HAM_ACCESS_TOKEN_SECRET must be at least 16 characters")
	}
	if c.AccessTokenTTL <= 0 {
		problems = append(problems, "HAM_ACCESS_TOKEN_TTL must be positive")
	}
	if c.RefreshTokenTTL <= 0 {
		problems = append(problems, "HAM_REFRESH_TOKEN_TTL must be positive")
	}
	if c.RateLimitPerMinute < 0 {
		problems = append(problems, "HAM_RATE_LIMIT_PER_MINUTE must not be negative")
	}
	if len(problems) > 0 {
		return fmt.Errorf("invalid configuration: %s", strings.Join(problems, "; "))
	}
	return nil
}

// VoiceEnabled reports whether LiveKit credentials are configured.
func (c Config) VoiceEnabled() bool {
	return c.LiveKitURL != "" && c.LiveKitAPIKey != "" && c.LiveKitAPISecret != ""
}

// IsProduction reports whether the service runs in a production environment.
func (c Config) IsProduction() bool {
	return strings.EqualFold(c.Env, "production")
}

func env(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && strings.TrimSpace(value) != "" {
		return value
	}
	return fallback
}

func envDuration(key string, fallback time.Duration) time.Duration {
	raw, ok := os.LookupEnv(key)
	if !ok || strings.TrimSpace(raw) == "" {
		return fallback
	}
	value, err := time.ParseDuration(raw)
	if err != nil {
		return fallback
	}
	return value
}

func envInt(key string, fallback int) int {
	raw, ok := os.LookupEnv(key)
	if !ok || strings.TrimSpace(raw) == "" {
		return fallback
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return value
}

// ErrInvalid is returned when configuration cannot be validated.
var ErrInvalid = errors.New("invalid configuration")
