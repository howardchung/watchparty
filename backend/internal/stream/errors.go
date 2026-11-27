package stream

import "errors"

var (
	// ErrNotFound is returned when a room has no stream row yet.
	ErrNotFound = errors.New("stream not found")
	// ErrRoomNotFound is returned when the room does not exist.
	ErrRoomNotFound = errors.New("room not found")
	// ErrForbidden is returned when the caller may not manage the stream.
	ErrForbidden = errors.New("stream forbidden")
	// ErrActive is returned when starting a stream while one is active.
	ErrActive = errors.New("stream already active")
	// ErrNoActiveStream is returned when aborting without an active stream.
	ErrNoActiveStream = errors.New("no active stream")
	// ErrInvalidURL is returned when a stream URL is not an acceptable HTTPS URL.
	ErrInvalidURL = errors.New("invalid stream url")
)
