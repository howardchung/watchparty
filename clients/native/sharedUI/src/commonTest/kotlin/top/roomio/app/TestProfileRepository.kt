package top.roomio.app

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import top.roomio.domain.profile.ProfileAvatarId
import top.roomio.domain.profile.ProfileRepository
import top.roomio.domain.profile.UserProfile

internal class TestProfileRepository(
    initialProfile: UserProfile = UserProfile("Nika", ProfileAvatarId.COMET),
) : ProfileRepository {
    private val mutableProfile = MutableStateFlow(initialProfile)

    override fun observeProfile() = mutableProfile.asStateFlow()

    override fun currentProfile() = mutableProfile.value

    override fun saveProfile(profile: UserProfile): Result<Unit> {
        mutableProfile.value = profile
        return Result.success(Unit)
    }
}
