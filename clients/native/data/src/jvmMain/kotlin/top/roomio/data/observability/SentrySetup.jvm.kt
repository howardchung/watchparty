package top.roomio.data.observability

import io.sentry.kotlin.multiplatform.Sentry

internal actual fun initializeSentry(environment: String) {
    Sentry.initWithPlatformOptions { options -> configureJvmSentryOptions(options, environment) }
}

internal fun configureJvmSentryOptions(options: io.sentry.SentryOptions, environment: String) =
    configureJavaSentry(options, environment, "Desktop", System.getProperty("os.version")?.substringBefore('.'))
