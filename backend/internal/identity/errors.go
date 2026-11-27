package identity

import "errors"

var (
	// ErrNotFound is returned when an identity or session does not exist.
	ErrNotFound = errors.New("identity not found")
	// ErrInvalidProfile is returned when profile fields fail validation.
	ErrInvalidProfile = errors.New("invalid profile")
	// ErrInvalidToken is returned when a token is malformed or unsigned.
	ErrInvalidToken = errors.New("invalid token")
	// ErrSessionExpired is returned when a refresh session is past its expiry.
	ErrSessionExpired = errors.New("refresh session expired")
	// ErrSessionRevoked is returned when a refresh session was already revoked.
	ErrSessionRevoked = errors.New("refresh session revoked")
)
