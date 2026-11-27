package top.roomio.data.profile

import com.russhwolf.settings.Settings
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlin.random.Random
import top.roomio.domain.profile.ProfileAvatarId
import top.roomio.domain.profile.ThemeColor

@Serializable
private data class InitialPreferences(val avatar: String, val color: String)

/** Shared bootstrap makes repository construction order irrelevant and retries reuse the same seed. */
internal fun initializeProfilePreferences(settings: Settings, existingSession: Boolean = false, random: Random = Random.Default) {
    if (settings.getBoolean("profile.defaults-initialized.v1", false)) return
    val key = "profile.initial-defaults.v1"
    val pending = settings.getStringOrNull(key)
    val defaults = if (pending != null) Json.decodeFromString<InitialPreferences>(pending) else {
        val existing = existingSession || settings.keys.isNotEmpty()
        InitialPreferences(
            avatar = (if (existing) ProfileAvatarId.COMET else ProfileAvatarId.entries.random(random)).name,
            color = (if (existing) ThemeColor.ROOMIO else ThemeColor.entries.filter { it != ThemeColor.ROOMIO }.random(random)).name,
        ).also { settings.putString(key, Json.encodeToString(it)) }
    }
    // Never replace a stored manual decision, including the original default.
    if (!settings.hasKey("profile.avatar")) settings.putString("profile.avatar", defaults.avatar)
    if (!settings.hasKey("appearance.color")) settings.putString("appearance.color", defaults.color)
    settings.putBoolean("profile.defaults-initialized.v1", true)
}
