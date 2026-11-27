package top.roomio.data.party

import io.ktor.http.URLBuilder
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class BackendAuthorizationScopeTest {
    private val backend = "http://10.0.2.2:8081"
    @Test
    fun differentOriginsNeverMatchBackendBearerOrigin() {
        assertTrue(hasBackendOrigin(URLBuilder("$backend/v1/rooms").build(), backend))
        assertFalse(hasBackendOrigin(URLBuilder("http://10.0.2.2:9099/v1/rooms").build(), backend))
        assertFalse(hasBackendOrigin(URLBuilder("http://attacker.test:8081/v1/rooms").build(), backend))
        assertFalse(hasBackendOrigin(URLBuilder("https://10.0.2.2:8081/v1/rooms").build(), backend))
    }
}
