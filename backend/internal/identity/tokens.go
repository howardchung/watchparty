package identity

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/mintturtle/watchparty/backend/internal/platform"
)

const accessTokenIssuer = "watchparty"

type accessClaims struct {
	TokenType string `json:"typ"`
	jwt.RegisteredClaims
}

// TokenManager issues and validates access tokens and opaque refresh tokens.
type TokenManager struct {
	secret    []byte
	accessTTL time.Duration
	clock     platform.Clock
}

// NewTokenManager builds a token manager for the given HMAC secret.
func NewTokenManager(secret string, accessTTL time.Duration, clock platform.Clock) *TokenManager {
	return &TokenManager{secret: []byte(secret), accessTTL: accessTTL, clock: clock}
}

// IssueAccess returns a short-lived signed access token for an identity.
func (m *TokenManager) IssueAccess(identityID string) (string, time.Time, error) {
	now := m.clock.Now()
	expiresAt := now.Add(m.accessTTL)
	claims := accessClaims{
		TokenType: "access",
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    accessTokenIssuer,
			Subject:   identityID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
		},
	}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(m.secret)
	if err != nil {
		return "", time.Time{}, err
	}
	return token, expiresAt, nil
}

// ParseAccess validates an access token and returns the identity ID.
func (m *TokenManager) ParseAccess(raw string) (string, error) {
	claims := &accessClaims{}
	token, err := jwt.ParseWithClaims(raw, claims, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return m.secret, nil
	}, jwt.WithIssuer(accessTokenIssuer), jwt.WithExpirationRequired(), jwt.WithTimeFunc(m.clock.Now))
	if err != nil || !token.Valid {
		return "", ErrInvalidToken
	}
	if claims.TokenType != "access" || claims.Subject == "" {
		return "", ErrInvalidToken
	}
	return claims.Subject, nil
}

// NewRefreshToken returns a fresh opaque token and the hash to persist.
func NewRefreshToken() (raw string, hash string, err error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", "", err
	}
	raw = base64.RawURLEncoding.EncodeToString(buf)
	return raw, HashRefreshToken(raw), nil
}

// HashRefreshToken derives the storage hash for an opaque refresh token.
func HashRefreshToken(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}
