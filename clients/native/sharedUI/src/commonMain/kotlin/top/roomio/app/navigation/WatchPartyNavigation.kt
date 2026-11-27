package top.roomio.app.navigation

import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.backhandler.BackHandler
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.navigation3.rememberViewModelStoreNavEntryDecorator
import androidx.navigation3.runtime.NavKey
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.runtime.rememberSaveableStateHolderNavEntryDecorator
import androidx.navigation3.ui.NavDisplay
import androidx.savedstate.serialization.SavedStateConfiguration
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.polymorphic
import kotlinx.serialization.modules.subclass
import top.roomio.app.home.HomeAction
import top.roomio.app.home.HomeScreen
import top.roomio.app.manager.ManagerMode
import top.roomio.app.manager.PartyManagerAction
import top.roomio.app.manager.PartyManagerEffect
import top.roomio.app.manager.PartyManagerScreen
import top.roomio.app.profile.SettingsAction
import top.roomio.app.profile.SettingsEffect
import top.roomio.app.profile.SettingsScreen
import top.roomio.app.preview.RoomPreviewAction
import top.roomio.app.preview.RoomPreviewEffect
import top.roomio.app.preview.RoomPreviewScreen
import top.roomio.app.platform.rememberNotificationPermissionRequest
import top.roomio.app.room.RoomAction
import top.roomio.app.room.RoomEffect
import top.roomio.app.room.RoomScreen
import top.roomio.app.ui.PresentationGraph

@Serializable
internal data object HomeRoute : NavKey

@Serializable
internal data object ProfileRoute : NavKey

@Serializable
internal data class PartyManagerRoute(
    val initialMode: PartyManagerMode,
) : NavKey

@Serializable
internal enum class PartyManagerMode { CREATE, JOIN }

@Serializable
internal data class RoomPreviewRoute(
    val partyCode: String,
) : NavKey

@Serializable
internal data class RoomRoute(
    val roomId: String,
    val asOwner: Boolean,
) : NavKey

@OptIn(ExperimentalComposeUiApi::class)
@Composable
internal fun WatchPartyNavigation(
    presentationGraph: PresentationGraph,
    modifier: Modifier = Modifier,
) {
    val savedStateConfiguration = remember {
        SavedStateConfiguration {
            serializersModule = SerializersModule {
                polymorphic(NavKey::class) {
                    subclass(HomeRoute.serializer())
                    subclass(ProfileRoute.serializer())
                    subclass(PartyManagerRoute.serializer())
                    subclass(RoomPreviewRoute.serializer())
                    subclass(RoomRoute.serializer())
                }
            }
        }
    }
    val backStack = rememberNavBackStack(
        savedStateConfiguration,
        HomeRoute,
    )
    fun navigate(route: NavKey) {
        if (backStack.lastOrNull() != route) {
            backStack.add(route)
        }
    }

    fun navigateBack() {
        if (backStack.size > 1) {
            backStack.removeLastOrNull()
        }
    }

    fun navigateHome() {
        while (backStack.size > 1) {
            backStack.removeLastOrNull()
        }
    }

    // A notification tap asks the app to reopen the room it is keeping alive.
    val roomLaunchRequests = rememberRoomLaunchRequests()
    LaunchedEffect(roomLaunchRequests) {
        roomLaunchRequests.collect { request ->
            when (request) {
                is RoomLaunchRequest.Room -> navigate(RoomRoute(request.roomId, request.asOwner))
                is RoomLaunchRequest.Invite -> navigate(RoomPreviewRoute(request.code))
            }
        }
    }

    NavDisplay(
        backStack = backStack,
        modifier = modifier,
        onBack = ::navigateBack,
        entryDecorators = listOf(
            rememberSaveableStateHolderNavEntryDecorator(),
            rememberViewModelStoreNavEntryDecorator(),
        ),
        entryProvider = entryProvider {
            entry<HomeRoute> {
                val viewModel = viewModel { presentationGraph.homeViewModel }
                androidx.lifecycle.compose.LifecycleEventEffect(androidx.lifecycle.Lifecycle.Event.ON_RESUME) {
                    viewModel.refreshLastRoom()
                }
                val state by viewModel.state.collectAsStateWithLifecycle()
                HomeScreen(
                    state = state,
                    onAction = { action ->
                        when (action) {
                            is HomeAction.Report -> viewModel.onReportAction(action.action)
                            HomeAction.SettingsClicked -> navigate(ProfileRoute)
                            HomeAction.CreatePartyClicked -> navigate(
                                PartyManagerRoute(PartyManagerMode.CREATE),
                            )
                            HomeAction.JoinPartyClicked -> navigate(
                                PartyManagerRoute(PartyManagerMode.JOIN),
                            )
                            HomeAction.OpenRoomClicked -> state.roomPreview?.code?.takeIf { it.isNotBlank() }?.let {
                                navigate(RoomPreviewRoute(it))
                            }
                        }
                    },
                )
            }
            entry<ProfileRoute> {
                val viewModel = viewModel { presentationGraph.settingsViewModel }
                LaunchedEffect(viewModel) {
                    viewModel.effects.collect { effect ->
                        when (effect) {
                            SettingsEffect.PROFILE_SAVED -> navigateBack()
                        }
                    }
                }
                val state by viewModel.state.collectAsStateWithLifecycle()
                SettingsScreen(
                    state = state,
                    onAction = { action ->
                        viewModel.onAction(action)
                        when (action) {
                            SettingsAction.BackClicked -> navigateBack()
                            SettingsAction.SaveClicked,
                            is SettingsAction.AvatarSelected,
                            is SettingsAction.ColorSelected,
                            is SettingsAction.LanguageSelected,
                            -> Unit
                        }
                    },
                )
            }
            entry<PartyManagerRoute> { route ->
                val initialMode = when (route.initialMode) {
                    PartyManagerMode.CREATE -> ManagerMode.CREATE
                    PartyManagerMode.JOIN -> ManagerMode.JOIN
                }
                val viewModel = viewModel {
                    presentationGraph.partyManagerViewModelFactory.create(
                        initialMode = initialMode,
                        loading = false,
                        codeError = false,
                    )
                }
                LaunchedEffect(viewModel) {
                    viewModel.effects.collect { effect ->
                        when (effect) {
                            is PartyManagerEffect.Created ->
                                navigate(RoomRoute(roomId = effect.roomId, asOwner = true))
                            is PartyManagerEffect.PreviewReady ->
                                navigate(RoomPreviewRoute(effect.code))
                            // Connectivity and generic failures are shown by the screen.
                            else -> Unit
                        }
                    }
                }
                val state by viewModel.state.collectAsStateWithLifecycle()
                PartyManagerScreen(
                    state = state,
                    effects = viewModel.effects,
                    onAction = { action ->
                        viewModel.onAction(action)
                        if (action == PartyManagerAction.BackClicked) {
                            navigateBack()
                        }
                    },
                )
            }
            entry<RoomPreviewRoute> { route ->
                val viewModel = viewModel {
                    presentationGraph.roomPreviewViewModelFactory.create(route.partyCode)
                }
                LaunchedEffect(viewModel) {
                    viewModel.effects.collect { effect ->
                        when (effect) {
                            is RoomPreviewEffect.Joined ->
                                navigate(RoomRoute(roomId = effect.roomId, asOwner = effect.asOwner))
                            // Connectivity and generic failures are shown by the screen.
                            else -> Unit
                        }
                    }
                }
                val state by viewModel.state.collectAsStateWithLifecycle()
                RoomPreviewScreen(
                    state = state,
                    effects = viewModel.effects,
                    onAction = { action ->
                        viewModel.onAction(action)
                        if (action == RoomPreviewAction.BackClicked) {
                            navigateBack()
                        }
                    },
                )
            }
            entry<RoomRoute> { route ->
                val viewModel = viewModel {
                    presentationGraph.roomViewModelFactory.create(route.roomId, route.asOwner)
                }
                // The background room notification needs the runtime permission
                // to stay visible on Android 13+.
                val requestNotificationPermission = rememberNotificationPermissionRequest()
                LaunchedEffect(Unit) { requestNotificationPermission() }
                // Leaving from the notification emits the same effect as the
                // in-room leave button so the app returns home either way.
                LaunchedEffect(viewModel) {
                    viewModel.effects.collect { effect ->
                        if (effect == RoomEffect.Left) navigateHome()
                    }
                }
                val state by viewModel.state.collectAsStateWithLifecycle()
                // Back asks before leaving the room instead of dropping home.
                BackHandler(enabled = !state.leaveOpen) {
                    if (state.fullscreenMode) {
                        viewModel.onAction(RoomAction.ToggleFullscreenClicked)
                    } else {
                        viewModel.onAction(RoomAction.LeaveClicked)
                    }
                }
                RoomScreen(
                    state = state,
                    effects = viewModel.effects,
                    onAction = viewModel::onAction,
                )
            }
        },
        transitionSpec = {
            (
                slideInHorizontally(
                    initialOffsetX = { width -> width / 10 },
                    animationSpec = tween(300),
                ) + fadeIn(animationSpec = tween(300))
                ) togetherWith fadeOut(animationSpec = tween(200))
        },
        popTransitionSpec = {
            fadeIn(animationSpec = tween(250)) togetherWith (
                slideOutHorizontally(
                    targetOffsetX = { width -> width / 10 },
                    animationSpec = tween(250),
                ) + fadeOut(animationSpec = tween(200))
                )
        },
        predictivePopTransitionSpec = {
            fadeIn(animationSpec = tween(250)) togetherWith (
                slideOutHorizontally(
                    targetOffsetX = { width -> width / 10 },
                    animationSpec = tween(250),
                ) + fadeOut(animationSpec = tween(200))
                )
        },
    )
}
