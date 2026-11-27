package top.roomio.data.party

/** Deterministic fake for tests; production targets use OS-backed implementations. */
internal class MemorySecureCredentialStorage : SecureCredentialStorage {
    private var value: String? = null
    override fun read(): String? = value
    override fun write(value: String) { this.value = value }
    override fun clear() { value = null }
}
