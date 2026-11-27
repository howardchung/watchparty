package top.roomio.app.navigation

import top.roomio.app.diagnostics.loggedRunCatching

import io.ktor.http.URLBuilder
import io.ktor.http.URLProtocol
import io.ktor.http.Url

/** Public browser/app contract. The backend remains responsible for room validation. */
internal object RoomInviteLinks {
    fun create(code: String): String = URLBuilder("https://watchparty.top/").apply {
        parameters.append("invite", code)
    }.buildString()

    fun codeFrom(url: String): String? {
        if (url.length > 2048) return null
        val parsed = loggedRunCatching("RoomInviteLinks.run1") { Url(url) }.getOrNull() ?: return null
        if (parsed.protocol != URLProtocol.HTTPS || parsed.host != "watchparty.top" ||
            parsed.port != 443 || parsed.user != null || parsed.password != null ||
            parsed.encodedPath !in listOf("", "/")
        ) return null
        val codes = parsed.parameters.getAll("invite") ?: return null
        if (codes.size != 1) return null
        // Bound untrusted input; invalid/expired codes get the preview's recovery UI.
        return codes.single().trim().takeIf { code ->
            code.isNotEmpty() && code.length <= 64 && code.all { it.isLetterOrDigit() || it in " _-" }
        }
    }
}
