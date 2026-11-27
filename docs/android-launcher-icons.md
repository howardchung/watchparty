# Android Shared Screen launcher icons

The approved Shared Screen mark has 24 bundled Android color variants. Each background uses the exact named seed hex supplied by the stakeholder, independently of Material's generated primary color. The foreground uses either cream (`#FFF8E7`) or charcoal (`#18201C`), whichever has higher contrast against the seed. All variants share the same vector silhouette. Basil is the initial launcher icon and the icon for watchparty default.

## Theme integration

`LauncherIconController` is available from the Metro application graph. It exposes `isSupported`, `currentColor(): Result<LauncherIconColor>`, and `selectColor(LauncherIconColor): Result<Unit>`. Android supports switching; Desktop explicitly reports unsupported. The composition root passes the graph-owned controller to the shared presentation boundary.

The domain mapping explicitly associates all 24 named `ThemeColor` choices with their matching `LauncherIconColor`; `ROOMIO` maps to `BASIL`. The root presentation effect applies the saved choice on app launch and applies subsequent color changes immediately, independently of profile Save or network connectivity. It remains above navigation, so navigating between screens does not create another observer. Material primary colors, light/dark mode and dynamic system colors do not select another alias.

An icon failure preserves the saved theme and shows an accessible snackbar with Retry and dismissal. Retry applies the current choice again; changing theme cancels an obsolete pending retry. Dismissal stops that attempt; the next app launch reconciles again. Repeating an already applied choice is idempotent at the controller. Unsupported platforms do not attempt switching or show an error. A failed theme-preference write retains the previously saved theme and icon.

## Android behavior

- Twenty-four stable manifest aliases use `${applicationId}.launcher.<AliasSuffix>`. Basil is the only alias enabled by default. Keep names and default-enabled state stable across upgrades because Android persists component overrides.
- `AppActivity` remains enabled and owns invite-link filters. Only aliases have the launcher filter. Switching never disables the actual activity.
- Android 13/API 33 and newer update aliases atomically. Android 6–12 enable the replacement before disabling existing aliases. If an older-device update partially fails, return failure while keeping at least one launchable alias; retry repairs duplicates.
- PackageManager state is the source of truth, with no duplicate preference to drift. `currentColor()` fails explicitly if zero or multiple aliases are enabled.
- `DONT_KILL_APP` is requested. Launcher refresh timing, pinned-home-screen behavior, and OEM process behavior still need device acceptance; immediate refresh is not guaranteed.
- Adaptive icons and legacy vector launcher resources are included. A shared monochrome silhouette supports Android themed icons; the launcher can override the supplied colors when themed icons are enabled.
- The application fallback icon uses Shared Screen in Basil. Changing an alias does not dynamically recolor notification, splash, or system-settings artwork.

## Validation

Run `python3 clients/native/androidApp/tools/verify_launcher_icons.py` from the repository root to verify all enum/manifest/resource colors and defaults. Run data JVM tests for repeated selection, every color, API-specific ordering, partial failure and repair, unsupported platforms, and controller recreation. Build with `./gradlew :androidApp:assembleDebug` from `clients/native/`.

Launcher switching is local and offline. The existing theme picker supplies populated/selected/pressed states; no additional screen or loading/empty picker is introduced. Icon-update errors have Retry and dismissal. Hardware acceptance should cover at least API 23–32 and API 33+, cold launch, invite links, process restart, app upgrades, pinned shortcuts and themed icons.

Android references: [activity aliases](https://developer.android.com/guide/topics/manifest/activity-alias-element), [PackageManager component updates](https://developer.android.com/reference/android/content/pm/PackageManager#setComponentEnabledSettings(java.util.List)).
