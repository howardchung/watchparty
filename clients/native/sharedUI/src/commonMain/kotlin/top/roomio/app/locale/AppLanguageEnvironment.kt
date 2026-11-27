package top.roomio.app.locale

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import top.roomio.domain.profile.AppLanguage

/** One persisted profile language drives resource selection and logical layout together. */
@Composable
internal fun AppLanguageEnvironment(language: AppLanguage, content: @Composable () -> Unit) {
    PlatformLanguageEnvironment(language.tag) {
        CompositionLocalProvider(LocalLayoutDirection provides
            if (language == AppLanguage.PERSIAN) LayoutDirection.Rtl else LayoutDirection.Ltr,
            content = content,
        )
    }
}

@Composable
internal expect fun PlatformLanguageEnvironment(tag: String, content: @Composable () -> Unit)
