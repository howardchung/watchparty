import java.util.Properties
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.android.kmp.library)
    alias(libs.plugins.kotlinx.serialization)
    alias(libs.plugins.metro)
    alias(libs.plugins.sentry.kmp)
}

abstract class GenerateMonitoringConfig : DefaultTask() {
    @get:Input abstract val configurationText: Property<String>
    @get:OutputDirectory abstract val outputDirectory: DirectoryProperty
    @TaskAction fun generate() {
        val values = Properties().apply { configurationText.get().reader().use { load(it) } }
        fun quoted(key: String): String = "\"" + values.getProperty(key, "").replace("\\", "\\\\").replace("\"", "\\\"").replace("$", "\\$") + "\""
        val output = outputDirectory.get().file("top/roomio/data/observability/MonitoringConfig.kt").asFile
        output.parentFile.mkdirs()
        output.writeText("""
            package top.roomio.data.observability
            internal object MonitoringConfig {
                const val sentryDsn = ${quoted("sentry.dsn")}
                const val posthogToken = ${quoted("posthog.token")}
                const val posthogHost = ${quoted("posthog.host")}
                const val release = ${quoted("release")}
            }
        """.trimIndent())
    }
}
val generateObservability by tasks.registering(GenerateMonitoringConfig::class) {
    configurationText.set(providers.fileContents(rootProject.layout.projectDirectory.file("observability.properties")).asText.orElse(""))
    outputDirectory.set(layout.buildDirectory.dir("generated/observability/kotlin"))
}

kotlin {
    android {
        namespace = "top.roomio.data"
        compileSdk = 36
        minSdk = 23
        compilerOptions { jvmTarget = JvmTarget.JVM_17 }
        androidResources {
            enable = true
        }
    }

    jvm {
        compilerOptions { jvmTarget = JvmTarget.JVM_17 }
    }

    sourceSets {
        commonMain { kotlin.srcDir(generateObservability) }
        commonMain.dependencies {
            implementation(project(":domain"))
            implementation(libs.kermit)
            implementation(libs.kotlinx.coroutines.core)
            implementation(libs.kotlinx.serialization.json)
            implementation(libs.kotlinx.datetime)
            implementation(libs.ktor.client.core)
            implementation(libs.ktor.client.content.negotiation)
            implementation(libs.ktor.client.websockets)
            implementation(libs.ktor.serialization.json)
            implementation(libs.ktor.client.logging)
            implementation(libs.multiplatformSettings)
        }

        androidMain { kotlin.srcDir("src/androidJvmMain/kotlin") }
        jvmMain { kotlin.srcDir("src/androidJvmMain/kotlin") }
        androidMain.dependencies {
            implementation(libs.kotlinx.coroutines.android)
            implementation(libs.ktor.client.okhttp)
            implementation(libs.stream.webrtc.android)
        }

        jvmMain.dependencies {
            implementation(libs.ktor.client.okhttp)
        }

        commonTest.dependencies {
            implementation(kotlin("test"))
            implementation(libs.multiplatformSettings.test)
            implementation(libs.kotlinx.coroutines.test)
            implementation(libs.ktor.client.mock)
        }
    }
}
