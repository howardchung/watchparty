package top.roomio.data.observability

import top.roomio.data.party.AppSessionLog

internal fun configureJavaSentry(options: io.sentry.SentryOptions, environment: String, platform: String, osMajor: String?) {
    options.dsn = MonitoringConfig.sentryDsn
    options.environment = environment
    options.release = MonitoringConfig.release.ifEmpty { null }
    options.isSendDefaultPii = false
    options.maxBreadcrumbs = 0
    options.setBeforeSend { event, hint ->
        hint.clearAttachments()
        hint.screenshot = null
        hint.viewHierarchy = null
        hint.tombstone = null
        event.user = null
        event.serverName = null
        event.request = null
        event.message = null
        event.extras?.clear()
        event.contexts.clear()
        event.tags?.clear()
        event.setTag("platform", platform)
        osMajor?.takeIf { it.matches(Regex("[0-9]{1,3}")) }?.let { event.setTag("os.major", it) }
        event.transaction = null
        event.fingerprints = null
        event.breadcrumbs = if (event.timestamp.time < AppSessionLog.startedMillis) emptyList() else AppSessionLog.crashTrail().map { io.sentry.Breadcrumb(it).apply { category = "application" } }
        event.threads?.forEach { thread -> thread.name = null }
        event.exceptions?.forEach {
            it.type = safeNativeType(it.type)
            it.value = it.type
            it.mechanism?.description = null
            it.mechanism?.data = null
        }
        val stacks = event.exceptions.orEmpty().mapNotNull { it.stacktrace } + event.threads.orEmpty().mapNotNull { it.stacktrace }
        stacks.forEach { it.registers = null }
        stacks.flatMap { it.frames.orEmpty() }.forEach { frame ->
            frame.absPath = null
            frame.filename = frame.filename?.substringAfterLast('/')?.substringAfterLast('\\')?.takeIf { it.matches(Regex("[A-Za-z0-9_$.-]+\\.(kt|java)")) }
            frame.contextLine = null
            frame.unknown = null
        }
        event
    }
}
