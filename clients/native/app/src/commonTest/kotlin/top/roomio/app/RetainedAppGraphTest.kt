package top.roomio.app

import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.russhwolf.settings.MapSettings
import com.russhwolf.settings.Settings
import dev.zacsweers.metro.AppScope
import dev.zacsweers.metro.DependencyGraph
import dev.zacsweers.metro.Provides
import dev.zacsweers.metro.createGraphFactory
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotSame
import kotlin.test.assertSame
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import top.roomio.data.profile.PreferencesProfileRepository
import top.roomio.data.profile.PreferencesThemeRepository
import top.roomio.domain.profile.AppLanguage
import top.roomio.domain.profile.ProfileAvatarId
import top.roomio.domain.profile.ThemeColor

@DependencyGraph(AppScope::class)
internal interface ProfileTestGraph {
    val profile: PreferencesProfileRepository
    val theme: PreferencesThemeRepository

    @DependencyGraph.Factory
    fun interface Factory {
        fun create(@Provides settings: Settings): ProfileTestGraph
    }
}

@OptIn(ExperimentalCoroutinesApi::class)
class RetainedAppGraphTest {
    @Test
    fun recreatedHostAndNewSettingsKeepTheProfilesObservedBeforeRecreation() = runTest {
        Dispatchers.setMain(UnconfinedTestDispatcher(testScheduler))
        val store = ViewModelStore()
        try {
            val settings = MapSettings()
            val preferences = createGraphFactory<ProfileTestGraph.Factory>().create(settings)
            val graph = TestAppGraph(preferences)
            var creations = 0
            val factory = viewModelFactory {
                initializer { creations++; RetainedAppGraph(graph) }
            }
            fun host() = object : ViewModelStoreOwner { override val viewModelStore = store }
            val before = ViewModelProvider.create(host(), factory)[RetainedAppGraph::class]
            // Home keeps this flow and repository in its retained ViewModel.
            val homeRepository = before.graph.profileRepository
            val homeProfile = preferences.profile.observeProfile()
            val oldProfile = homeRepository.currentProfile()

            // A replacement Activity uses the same retained ViewModelStore.
            val after = ViewModelProvider.create(host(), factory)[RetainedAppGraph::class]
            val settingsRepository = after.graph.profileRepository
            assertSame(before, after)
            assertEquals(1, creations)
            assertSame(homeRepository, settingsRepository)
            val avatar = ProfileAvatarId.entries.first { it != oldProfile.avatar }
            settingsRepository.saveProfile(oldProfile.copy(avatar = avatar, language = AppLanguage.PERSIAN)).getOrThrow()
            assertEquals(avatar, homeProfile.value.avatar)
            assertEquals(AppLanguage.PERSIAN, homeProfile.value.language)
            assertEquals(homeProfile.value, after.graph.profileRepository.currentProfile())

            val homeTheme = before.graph.themePreferencesRepository
            val color = ThemeColor.entries.first { it != homeTheme.color.value }
            after.graph.themePreferencesRepository.selectColor(color).getOrThrow()
            assertSame(homeTheme, after.graph.themePreferencesRepository)
            assertEquals(color, homeTheme.color.value)

            // A genuinely new lifetime restores the saved selection from storage.
            val restored = createGraphFactory<ProfileTestGraph.Factory>().create(settings)
            assertNotSame(homeRepository, restored.profile)
            assertEquals(homeProfile.value, restored.profile.currentProfile())
        } finally {
            store.clear()
            Dispatchers.resetMain()
        }
    }

}

private class TestAppGraph(private val preferences: ProfileTestGraph) : WatchPartyAppGraph {
    override val profileRepository get() = preferences.profile
    override val themePreferencesRepository get() = preferences.theme
    override val retainedGraphFactory get() = error("Unused")
    override val observability get() = error("Monitoring is not started by this test")
    override val launcherIconController get() = error("Unused")
    override val sessionRepository get() = error("Unused")
    override val roomRepository get() = error("Unused")
    override val realtimeClient get() = error("Unused")
    override val voiceClient get() = error("Unused")
    override val voiceCoordinator get() = error("Unused")
    override val sessionKeeper get() = error("Unused")
}
