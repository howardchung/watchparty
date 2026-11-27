package top.roomio.data.party

/** Desktop intentionally keeps credentials only in process memory until an OS keychain adapter exists. */
private class JvmSecureCredentialStorage : SecureCredentialStorage {
    private var value: String? = null
    override fun read(): String? = value
    override fun write(value: String) { this.value = value }
    override fun clear() { value = null }
}

internal actual fun createSecureCredentialStorage(): SecureCredentialStorage = JvmSecureCredentialStorage()
