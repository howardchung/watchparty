package top.roomio.data.party

import top.roomio.data.diagnostics.logHandledException

import android.util.Base64
import top.roomio.domain.party.PartyException
import com.russhwolf.settings.Settings
import java.security.KeyStore
import javax.crypto.AEADBadTagException
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/** AES/GCM envelope whose non-exportable key is held by Android Keystore. */
private class AndroidSecureCredentialStorage : SecureCredentialStorage {
    private val settings = Settings()

    override fun read(): String? {
        val encoded = settings.getStringOrNull(CIPHERTEXT_KEY) ?: return null
        val key = loadOrCreateKey()
        val payload = try {
            Base64.decode(encoded, Base64.NO_WRAP)
        } catch (handledError: IllegalArgumentException) {
            logHandledException("AndroidSecureCredentialStorage.catch1", handledError)
            throw PartyException("INVALID_TOKEN", "Saved guest credentials are unreadable; reset the guest identity")
        }
        if (payload.size < IV_BYTES + TAG_BITS / 8) {
            throw PartyException("INVALID_TOKEN", "Saved guest credentials are unreadable; reset the guest identity")
        }
        val iv = payload.copyOfRange(0, IV_BYTES)
        val encrypted = payload.copyOfRange(IV_BYTES, payload.size)
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(TAG_BITS, iv))
        return try {
            String(cipher.doFinal(encrypted), Charsets.UTF_8)
        } catch (handledError: AEADBadTagException) {
            logHandledException("AndroidSecureCredentialStorage.catch2", handledError)
            // Tampering, corruption, or restore without the original Keystore key.
            throw PartyException("INVALID_TOKEN", "Saved guest credentials cannot be decrypted; reset the guest identity")
        }
    }

    override fun write(value: String) {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, loadOrCreateKey())
        val payload = cipher.iv + cipher.doFinal(value.toByteArray(Charsets.UTF_8))
        settings.putString(CIPHERTEXT_KEY, Base64.encodeToString(payload, Base64.NO_WRAP))
    }

    override fun clear() {
        settings.remove(CIPHERTEXT_KEY)
        // Keep the alias; deleting it can invalidate data during concurrent app use.
    }

    private fun loadOrCreateKey(): SecretKey {
        val keyStore = KeyStore.getInstance(ANDROID_KEY_STORE).apply { load(null) }
        (keyStore.getKey(KEY_ALIAS, null) as? SecretKey)?.let { return it }
        return KeyGenerator.getInstance("AES", ANDROID_KEY_STORE).run {
            init(
                android.security.keystore.KeyGenParameterSpec.Builder(
                    KEY_ALIAS,
                    android.security.keystore.KeyProperties.PURPOSE_ENCRYPT or
                        android.security.keystore.KeyProperties.PURPOSE_DECRYPT,
                )
                    .setBlockModes(android.security.keystore.KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(android.security.keystore.KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setKeySize(256)
                    .setRandomizedEncryptionRequired(true)
                    .build(),
            )
            generateKey()
        }
    }

    private companion object {
        const val ANDROID_KEY_STORE = "AndroidKeyStore"
        const val KEY_ALIAS = "roomio.firebase.credentials.v1"
        const val CIPHERTEXT_KEY = "roomio.firebase.credentials.ciphertext.v1"
        const val TRANSFORMATION = "AES/GCM/NoPadding"
        const val IV_BYTES = 12
        const val TAG_BITS = 128
    }
}

internal actual fun createSecureCredentialStorage(): SecureCredentialStorage = AndroidSecureCredentialStorage()
