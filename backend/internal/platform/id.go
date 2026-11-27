package platform

import "github.com/google/uuid"

// NewID returns a new random UUIDv4 string.
func NewID() string { return uuid.NewString() }
