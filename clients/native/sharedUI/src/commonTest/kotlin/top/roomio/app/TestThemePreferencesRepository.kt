package top.roomio.app

import kotlinx.coroutines.flow.MutableStateFlow
import top.roomio.domain.profile.ThemeColor
import top.roomio.domain.profile.ThemePreferencesRepository

internal class TestThemePreferencesRepository : ThemePreferencesRepository {
    override val color = MutableStateFlow(ThemeColor.ROOMIO)
    var failWrites = false
    override fun selectColor(color: ThemeColor): Result<Unit> {
        if (failWrites) return Result.failure(IllegalStateException("Storage unavailable"))
        this.color.value = color
        return Result.success(Unit)
    }
}
