package top.roomio.data.party

import top.roomio.data.diagnostics.loggedRunCatching

import com.russhwolf.settings.Settings
import dev.zacsweers.metro.Inject
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import top.roomio.domain.party.Room

/** Stores only room metadata, scoped to backend and durable guest identity. */
@Inject
class LastRoomStore(private val settings: Settings, private val json: Json) {
    @Serializable
    private data class SavedRoom(val id: String, val code: String, val title: String, val ownerIdentityId: String)

    private fun key(backend: String, identity: String) = "last-room:$backend:$identity"

    fun read(backend: String, identity: String): Room? = loggedRunCatching("LastRoomStore.run1") {
        val raw = settings.getStringOrNull(key(backend, identity)) ?: return null
        val saved = json.decodeFromString<SavedRoom>(raw)
        Room(saved.id, saved.code, saved.title, saved.ownerIdentityId, false)
    }.getOrNull()

    fun remember(backend: String, identity: String, room: Room) {
        if (room.ended) return
        loggedRunCatching("LastRoomStore.run2") {
            settings.putString(key(backend, identity), json.encodeToString(SavedRoom(room.id, room.code, room.title, room.ownerIdentityId)))
        }
    }

    fun forget(backend: String, identity: String, codeOrId: String) {
        val saved = read(backend, identity) ?: return
        if (saved.code == codeOrId || saved.id == codeOrId) settings.remove(key(backend, identity))
    }
}
