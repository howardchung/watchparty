package top.roomio.app

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.lifecycle.viewmodel.compose.viewModel
import dev.zacsweers.metro.AppScope
import dev.zacsweers.metro.DependencyGraph
import dev.zacsweers.metro.createGraph
import top.roomio.app.ui.WatchPartyUi
import top.roomio.data.party.PartyDataBindings
import top.roomio.data.profile.ProfileDataBindings
import top.roomio.domain.party.RealtimeClient
import top.roomio.domain.party.RoomRepository
import top.roomio.domain.party.SessionKeeper
import top.roomio.domain.party.SessionRepository
import top.roomio.domain.party.VoiceClient
import top.roomio.domain.party.VoiceCoordinator
import top.roomio.domain.profile.ProfileRepository

@DependencyGraph(
    AppScope::class,
    bindingContainers = [ProfileDataBindings::class, PartyDataBindings::class, top.roomio.data.launcher.LauncherIconDataBindings::class],
)
internal interface WatchPartyAppGraph {
    val retainedGraphFactory: RetainedAppGraph.Factory
    val observability: top.roomio.data.observability.AppObservability
    val launcherIconController: top.roomio.domain.launcher.LauncherIconController
    val themePreferencesRepository: top.roomio.domain.profile.ThemePreferencesRepository
    val profileRepository: ProfileRepository
    val sessionRepository: SessionRepository
    val roomRepository: RoomRepository
    val realtimeClient: RealtimeClient
    val voiceClient: VoiceClient
    val voiceCoordinator: VoiceCoordinator
    val sessionKeeper: SessionKeeper
}

@Composable
fun App(
    onThemeChanged: @Composable (isDark: Boolean) -> Unit = {},
    onAppNameChanged: (String) -> Unit = {},
) {
    // Navigation ViewModels survive Activity recreation and must keep using this graph.
    val retainedGraph = viewModel<RetainedAppGraph> {
        top.roomio.data.party.initializeAppLogging()
        val graph = createGraph<WatchPartyAppGraph>()
        graph.retainedGraphFactory.create(graph)
    }
    val graph = retainedGraph.graph
    retainedGraph.startMonitoring()
    val themePreferences = remember(graph) { graph.themePreferencesRepository }
    val launcherIconController = remember(graph) { graph.launcherIconController }
    WatchPartyUi(
        profileRepository = graph.profileRepository,
        themePreferencesRepository = themePreferences,
        launcherIconController = launcherIconController,
        sessionRepository = graph.sessionRepository,
        roomRepository = graph.roomRepository,
        realtimeClient = graph.realtimeClient,
        voiceCoordinator = graph.voiceCoordinator,
        sessionKeeper = graph.sessionKeeper,
        onThemeChanged = onThemeChanged,
        onAppNameChanged = onAppNameChanged,
    )
}
