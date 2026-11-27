package room

import (
	"crypto/rand"
	"strings"
)

const (
	codeLength = 8
	// codeAlphabet is Crockford Base32: it excludes the ambiguous I, L, O, U.
	codeAlphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
)

// NewCode returns a random eight-character party code.
func NewCode() (string, error) {
	buf := make([]byte, codeLength)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	var sb strings.Builder
	sb.Grow(codeLength)
	for _, b := range buf {
		// len(codeAlphabet) == 32 divides 256 evenly, so this is unbiased.
		sb.WriteByte(codeAlphabet[int(b)%len(codeAlphabet)])
	}
	return sb.String(), nil
}

// NormalizeCode uppercases and canonicalizes a user supplied party code,
// folding ambiguous characters and separating punctuation.
func NormalizeCode(raw string) (string, error) {
	trimmed := strings.ToUpper(strings.TrimSpace(raw))
	var sb strings.Builder
	for _, r := range trimmed {
		switch r {
		case ' ', '-', '_':
			continue
		case 'I', 'L':
			r = '1'
		case 'O':
			r = '0'
		}
		if !strings.ContainsRune(codeAlphabet, r) {
			return "", ErrInvalidCode
		}
		sb.WriteRune(r)
	}
	if sb.Len() != codeLength {
		return "", ErrInvalidCode
	}
	return sb.String(), nil
}
