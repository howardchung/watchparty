package top.roomio.domain.profile

import kotlinx.coroutines.flow.Flow

data class UserProfile(
    val name: String,
    val avatar: ProfileAvatarId,
    val language: AppLanguage = AppLanguage.ENGLISH,
)

enum class ProfileAvatarId(val displayName: String, private val persianName: String) {
    COMET("Ice Queen", "ملکهٔ یخی"),
    MINT("Frog Wizard", "قورباغهٔ جادوگر"),
    SUNNY("Skeleton Detective", "کارآگاه اسکلتی"),
    BERRY("Captain Octopus", "کاپیتان اختاپوس"),
    CLOUD("TV Boy", "پسر تلویزیونی"),
    EMBER("Alien Employee", "کارمند فضایی"),
    NOVA("Robot Poet", "ربات شاعر"),
    ORBIT("Wolf Barista", "گرگ باریستا"),
    PRISM("Professor Fox", "پروفسور روباه"),
    ECHO("Bookworm Dragon", "اژدهای کتاب‌خوان"),
    SPARK("Frankie", "فرانکی"),
    BLOOM("Mummy Barista", "مومیایی باریستا");

    fun displayName(language: AppLanguage): String =
        if (language == AppLanguage.PERSIAN) persianName else displayName
}

interface ProfileRepository {
    fun observeProfile(): Flow<UserProfile>

    fun currentProfile(): UserProfile

    fun saveProfile(profile: UserProfile): Result<Unit>
}

/** Supported interface languages; stable tags are also used by the backend profile. */
enum class AppLanguage(val tag: String) {
    ENGLISH("en"), PERSIAN("fa");
    companion object {
        fun fromTag(tag: String): AppLanguage = entries.firstOrNull { it.tag == tag } ?: ENGLISH
    }
}
