import java.io.FileInputStream
import java.util.Properties
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.compose.compiler)
    alias(libs.plugins.android.application)
    alias(libs.plugins.sentry.android)
}

sentry {
    org.set(providers.environmentVariable("SENTRY_ORG"))
    projectName.set("watchparty-native")
    includeProguardMapping.set(true)
    autoUploadProguardMapping.set(providers.environmentVariable("SENTRY_AUTH_TOKEN").map { it.isNotBlank() }.orElse(false))
    uploadNativeSymbols.set(false)
    includeSourceContext.set(false)
    telemetry.set(false)
    tracingInstrumentation { enabled.set(false) }
    autoInstallation { enabled.set(false) }
}

// Release signing is configured from a local, untracked keystore.properties.
// Without it the module still configures and builds debug variants.
val keystorePropertiesFile = rootProject.file("keystore.properties")
val keystoreProperties = Properties().apply {
    if (keystorePropertiesFile.exists()) {
        FileInputStream(keystorePropertiesFile).use { load(it) }
    }
}
val hasReleaseSigning = keystorePropertiesFile.exists()

android {
    namespace = "top.roomio.app.androidApp"
    compileSdk = 36
    buildToolsVersion = "37.0.0"
    buildFeatures { buildConfig = true }

    defaultConfig {
        minSdk = 23
        targetSdk = 36

        applicationId = "top.watchparty.app"
        versionCode = 17
        versionName = "1.4.1"
    }

    signingConfigs {
        if (hasReleaseSigning) {
            create("release") {
                storeFile = rootProject.file(keystoreProperties.getProperty("storeFile"))
                storePassword = keystoreProperties.getProperty("storePassword")
                keyAlias = keystoreProperties.getProperty("keyAlias")
                keyPassword = keystoreProperties.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
            if (hasReleaseSigning) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

androidComponents {
    onVariants(selector().withBuildType("release")) { variant ->
        // Direct APK distribution: compress .so files; Android extracts them at install.
        variant.packaging.jniLibs.useLegacyPackaging.set(true)
    }
}

kotlin {
    compilerOptions { jvmTarget.set(JvmTarget.JVM_17) }
}

dependencies {
    implementation(project(":app"))
    implementation(libs.androidx.activityCompose)
}
