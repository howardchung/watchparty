package top.roomio.data.observability

internal actual fun monitoringEnvironment(): String = System.getProperty("watchparty.environment", "development")
