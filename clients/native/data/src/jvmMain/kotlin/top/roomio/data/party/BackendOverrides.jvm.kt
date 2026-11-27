package top.roomio.data.party

internal actual fun platformBackendOverrides(): BackendOverrides = BackendOverrides(
    backendUrl = System.getProperty("roomio.backendUrl"),
)
