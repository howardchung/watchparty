package top.roomio.app.profile

import org.jetbrains.compose.resources.DrawableResource
import watchparty.sharedui.generated.resources.Res
import watchparty.sharedui.generated.resources.avatar_berry
import watchparty.sharedui.generated.resources.avatar_bloom
import watchparty.sharedui.generated.resources.avatar_cloud
import watchparty.sharedui.generated.resources.avatar_comet
import watchparty.sharedui.generated.resources.avatar_echo
import watchparty.sharedui.generated.resources.avatar_ember
import watchparty.sharedui.generated.resources.avatar_mint
import watchparty.sharedui.generated.resources.avatar_nova
import watchparty.sharedui.generated.resources.avatar_orbit
import watchparty.sharedui.generated.resources.avatar_prism
import watchparty.sharedui.generated.resources.avatar_spark
import watchparty.sharedui.generated.resources.avatar_sunny
import top.roomio.domain.profile.ProfileAvatarId
import androidx.compose.runtime.Composable
import org.jetbrains.compose.resources.stringResource
import watchparty.sharedui.generated.resources.*

internal enum class ProfileAvatar(
    val label: String,
    val resource: DrawableResource,
) {
    COMET("Ice Queen", Res.drawable.avatar_comet),
    MINT("Frog Wizard", Res.drawable.avatar_mint),
    SUNNY("Skeleton Detective", Res.drawable.avatar_sunny),
    BERRY("Captain Octopus", Res.drawable.avatar_berry),
    CLOUD("TV Boy", Res.drawable.avatar_cloud),
    EMBER("Alien Employee", Res.drawable.avatar_ember),
    NOVA("Robot Poet", Res.drawable.avatar_nova),
    ORBIT("Wolf Barista", Res.drawable.avatar_orbit),
    PRISM("Professor Fox", Res.drawable.avatar_prism),
    ECHO("Bookworm Dragon", Res.drawable.avatar_echo),
    SPARK("Frankie", Res.drawable.avatar_spark),
    BLOOM("Mummy Barista", Res.drawable.avatar_bloom),
}

internal fun ProfileAvatarId.toPresentationAvatar(): ProfileAvatar =
    ProfileAvatar.valueOf(name)

internal fun ProfileAvatar.toDomainAvatar(): ProfileAvatarId =
    ProfileAvatarId.valueOf(name)

internal val ProfileAvatar.localizedLabel: String
    @Composable get() = stringResource(when (this) {
        ProfileAvatar.COMET -> Res.string.avatar_label_comet
        ProfileAvatar.MINT -> Res.string.avatar_label_mint
        ProfileAvatar.SUNNY -> Res.string.avatar_label_sunny
        ProfileAvatar.BERRY -> Res.string.avatar_label_berry
        ProfileAvatar.CLOUD -> Res.string.avatar_label_cloud
        ProfileAvatar.EMBER -> Res.string.avatar_label_ember
        ProfileAvatar.NOVA -> Res.string.avatar_label_nova
        ProfileAvatar.ORBIT -> Res.string.avatar_label_orbit
        ProfileAvatar.PRISM -> Res.string.avatar_label_prism
        ProfileAvatar.ECHO -> Res.string.avatar_label_echo
        ProfileAvatar.SPARK -> Res.string.avatar_label_spark
        ProfileAvatar.BLOOM -> Res.string.avatar_label_bloom
    })
