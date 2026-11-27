package room

import "errors"

var (
	// ErrNotFound is returned when a room or membership does not exist.
	ErrNotFound = errors.New("room not found")
	// ErrEnded is returned when a room has already closed.
	ErrEnded = errors.New("room ended")
	// ErrFull is returned when a room has no available seat.
	ErrFull = errors.New("room full")
	// ErrAlreadyInRoom is returned when an identity already holds an active
	// membership in a different room.
	ErrAlreadyInRoom = errors.New("identity already in a room")
	// ErrNotMember is returned when an identity is not a member of the room.
	ErrNotMember = errors.New("not a room member")
	// ErrInvalidCode is returned when a party code cannot be normalized.
	ErrInvalidCode = errors.New("invalid party code")
	// ErrDuplicateCode is returned when a generated party code already exists.
	ErrDuplicateCode = errors.New("duplicate party code")
)
