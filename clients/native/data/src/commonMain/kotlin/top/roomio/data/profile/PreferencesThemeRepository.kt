package top.roomio.data.profile

import top.roomio.data.diagnostics.loggedRunCatching

import com.russhwolf.settings.Settings
import dev.zacsweers.metro.Inject
import dev.zacsweers.metro.AppScope
import dev.zacsweers.metro.SingleIn
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import top.roomio.domain.profile.ThemeColor
import top.roomio.domain.profile.ThemePreferencesRepository

@SingleIn(AppScope::class)
@Inject
class PreferencesThemeRepository(private val settings: Settings) : ThemePreferencesRepository {
    init { initializeProfilePreferences(settings) }

    private val mutableColor = MutableStateFlow(
        ThemeColor.entries.firstOrNull { it.name == settings.getStringOrNull(KEY) } ?: ThemeColor.ROOMIO,
    )
    override val color = mutableColor.asStateFlow()

    override fun selectColor(color: ThemeColor): Result<Unit> = loggedRunCatching("PreferencesThemeRepository.run1") {
        settings.putString(KEY, color.name)
        mutableColor.value = color
    }

    private companion object { const val KEY = "appearance.color" }
}
