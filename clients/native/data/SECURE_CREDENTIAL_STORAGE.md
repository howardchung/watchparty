# Credential persistence

Backend access/refresh credentials, their expiry, service origin, and matching guest
identity are serialized atomically to `SecureCredentialStorage`. Android encrypts
this payload with AES-256-GCM using Android Keystore. Non-secret user preferences remain in Multiplatform Settings.

Recognizable credentials from the retired authentication provider are discarded once
at cutover. Historical platform storage aliases are retained solely to read and clear
that old record. There is no provider SDK or network integration. Corrupt credentials,
platform-store errors, origin mismatches, and server outages never silently create a
replacement identity. The Party Manager offers a confirmed reset for permanent errors.

Desktop/JVM credentials remain process-memory-only; durable desktop sessions require
a future OS credential-store adapter. Android retains identities across restart.
