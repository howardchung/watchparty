rootProject.name = "watchparty"

pluginManagement {
    repositories {
        if (System.getenv("GITHUB_ACTIONS") != "true") maven(url = "https://maven.myket.ir")
        google {
            content { 
              	includeGroupByRegex("com\\.android.*")
              	includeGroupByRegex("com\\.google.*")
              	includeGroupByRegex("androidx.*")
              	includeGroupByRegex("android.*")
            }
        }
        gradlePluginPortal()
        mavenCentral()
    }
}
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

dependencyResolutionManagement {
    repositories {
        if (System.getenv("GITHUB_ACTIONS") != "true") maven(url = "https://maven.myket.ir")
        google {
            content { 
              	includeGroupByRegex("com\\.android.*")
              	includeGroupByRegex("com\\.google.*")
              	includeGroupByRegex("androidx.*")
              	includeGroupByRegex("android.*")
            }
        }
        mavenCentral()
    }
}
include(":sharedUI")
include(":domain")
include(":data")
include(":app")
include(":androidApp")
include(":desktopApp")
