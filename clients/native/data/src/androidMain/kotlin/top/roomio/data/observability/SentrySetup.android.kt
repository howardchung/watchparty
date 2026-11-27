package top.roomio.data.observability

import android.os.Build
import io.sentry.kotlin.multiplatform.Sentry

internal actual fun initializeSentry(environment: String) {
    Sentry.initWithPlatformOptions { options ->
        options.isAttachScreenshot = false
        options.isAttachViewHierarchy = false
        options.isAttachAnrThreadDump = false
        options.isAttachRawTombstone = false
        // Raw NDK crash envelopes bypass the Java projection. Android can supply parsed tombstones.
        options.isEnableNdk = false
        options.isTombstoneEnabled = true
        configureJavaSentry(options, environment, "Android", Build.VERSION.RELEASE.substringBefore('.'))
    }
}
