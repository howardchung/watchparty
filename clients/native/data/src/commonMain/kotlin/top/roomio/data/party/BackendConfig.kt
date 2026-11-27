package top.roomio.data.party

/** The sole service origin for product APIs and guest authentication. */
data class BackendConfig(val baseUrl: String)

internal data class BackendOverrides(val backendUrl: String? = null)
internal expect fun platformBackendOverrides(): BackendOverrides
