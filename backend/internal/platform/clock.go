package platform

import "time"

// Clock abstracts time so services and tests can be deterministic.
type Clock interface {
	Now() time.Time
}

// SystemClock reports the current UTC time.
type SystemClock struct{}

func (SystemClock) Now() time.Time { return time.Now().UTC() }
