package top.roomio.data.party

/** Platform-backed storage for backend guest credentials. Implementations must never store plaintext. */
interface SecureCredentialStorage {
    fun read(): String?
    fun write(value: String)
    fun clear()
}

internal expect fun createSecureCredentialStorage(): SecureCredentialStorage
