# Integrated Settings choosers

The stakeholder approved **Spotlight avatars + Color garden + the focused language picker** for the main application. Browser and shared native Settings now use these treatments by default, with no design selector or preview-only data in the user flow. Open Settings normally, or use `/?preview=settings-populated` for a local fixture. The former final-review URL still renders the same integrated screen.

## Avatar and color

Spotlight keeps 96px/dp unselected character art and 176px/dp selected art in a tonal tile spanning two columns. Compact layouts use two columns; expanded layouts use three. Avatar changes remain drafts until Save and are discarded on Back.

Color garden shows the original brand palette and all twenty-four named seeds as a grid of labeled swatches. The current color appears above the grid. A selected swatch gains a border, rounded shape, tonal fill and check, so color alone never communicates selection. The grid scrolls within a bounded region, adapts to available width, and supports native radio/keyboard selection. Choosing a color immediately applies and persists its light/dark palette through the existing preference boundary. Default selection restores the existing brand palette; it does not generate an approximation from the default seed. Persistence failure keeps the existing retry message and behavior.

## Language

The focused picker contains **only English and فارسی**. The earlier ten extra language entries were layout fixtures and are not integrated into Settings. The catalog can grow later without changing the picker interaction.

The Settings row opens a dialog on expanded windows and a bottom sheet on compact windows. Search matches native/translated names, locale tags and Farsi/Persian aliases. No results offers Show all languages recovery. Choosing a radio stages the selection inside the picker. Cancel, Close, Escape/Back discard that staged choice. The explicit Use action copies it into the profile draft; Save applies avatar, localized name and language together. Back from Settings discards profile edits. Opening and dismissing the picker do not change the app language.

Browser components live in `clients/web/src/components/`; shared native pickers live in `clients/native/sharedUI/.../profile/SettingsPickers.kt`. The main screen does not import the historical design-study components. The integrated screen is used in the standard Settings destination and local Settings fixture.

## Copy and relevant states

Preserve the approved English/Persian conversational catalogs and the requested copy removals. Do not restore the profile subtitle, color helper sentences, repeated language instructions, Browse 12 languages or the Native names caption. Avatar guidance and save timing remain as approved.

Initial/populated/selected, pressed/hover/focus, staged/cancelled language selection, search/no-results recovery, Save loading, failure/draft retention/retry and disabled controls are represented. Catalogs are bundled and work offline; loading/empty/network-error catalog states are not applicable. Offline profile saving follows the existing live client recovery path. Browser color persistence failure retains the applied color and select-again guidance; native keeps its existing preference-error flow.

## Validation

Web TypeScript/Vite production build; focused browser regressions for main Settings language Save/reload, Back discard, failure/retry, avatar naming and all twenty-five color choices; English/Persian focused-picker cancellation, search, keyboard use and compact dark/150% text layout. Native Android debug assembly and targeted shared JVM profile/color/language UI checks, with compact Persian and expanded English screenshots reviewed. No physical Android device runtime validation on this Linux host. Deployment is a separate step.

Integration verification: eleven focused Chrome checks and four locale/palette unit tests passed. Seven targeted native profile/picker tests passed; after the final compact-sheet width refinement, both bilingual picker tests and Android assembly passed again. Web build passed. Browser evidence is under `/tmp/watchparty-settings-*-e2e.log`; native screenshots are `/tmp/watchparty-settings-integrated-{en,fa}-{colors,dialog}.png`. The native desktop renderer captures dialogs in a separate window; physical Android runtime checks remain outside this validation.

First-time personalization: random avatar/theme defaults are persisted before registration and never rerolled for existing users. Current TV Boy, Alien Employee and Wolf Barista labels replace the preceding names without changing avatar IDs or historical chat snapshots.
