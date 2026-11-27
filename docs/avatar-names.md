# Avatar names

The localized character names below label the avatar picker and provide initial profile names. Users can rename themselves in Settings.

| Avatar ID | English name | Persian name / picker label |
| --- | --- | --- |
| comet | Ice Queen | ملکهٔ یخی |
| mint | Frog Wizard | قورباغهٔ جادوگر |
| sunny | Skeleton Detective | کارآگاه اسکلتی |
| berry | Captain Octopus | کاپیتان اختاپوس |
| cloud | TV Boy | پسر تلویزیونی |
| ember | Alien Employee | کارمند فضایی |
| nova | Robot Poet | ربات شاعر |
| orbit | Wolf Barista | گرگ باریستا |
| prism | Professor Fox | پروفسور روباه |
| echo | Bookworm Dragon | اژدهای کتاب‌خوان |
| spark | Frankie | فرانکی |
| bloom | Mummy Barista | مومیایی باریستا |

The profile pencil opens the name editor. Confirming a trimmed name of 1–48 Unicode code points updates the profile draft. Save commits name, avatar and language together. Names stay independent of avatar and language changes. Rooms use the saved profile when admitting the user. Historical messages keep their sender snapshots.

Duplicate names and avatars are allowed, including within one room. Authentication, ownership, membership, voice and chat use UUIDs rather than display names. Existing You/Owner indicators distinguish roles, but two other guests with the same avatar remain visually ambiguous. Do not invent numeric suffixes or restrict avatar availability.

## Validation

On 2026-11-12, verification in an isolated checkout containing only the avatar feature passed: browser production build and 96 unit tests; backend TypeScript build and 12 unit tests; Android debug assembly and app JVM dependency-graph compilation. Focused native profile, persistence, ViewModel and Compose checks passed (27 passed, one existing skip).

Earlier cross-client validation passed five Chrome checks covering Save, draft discard, failed Save/retry, reload persistence and compact/expanded Persian layouts, plus ten real PostgreSQL/Socket.IO integration checks. The duplicate-name integration case verifies separate credentials, owner/member roles and chat senders, plus migration preservation of membership IDs, ownership and historical chat names.

Two native rendering tests passed for compact dark Persian at 150% text scale and expanded light English. Reviewed screenshots confirm that avatar names wrap within the grid, custom text inputs are absent, and Save persists the selected name/avatar pair. Physical Android runtime verification was not performed on this Linux host. No deployment was performed.


### Language-based names (DD-061)

Verified locally on 2026-11-12: 98 web unit tests and production build; five Chrome checks covering Save/retry/discard, Persian names, reload, switching back to English, and compact dark/expanded light RTL layouts; backend typecheck, 16 unit tests, and the real PostgreSQL avatar integration test including Persian creation/refresh and migration preservation. Native verification passed five persistence tests, ten presentation tests, three Compose UI tests, and Android debug assembly. Reviewed compact Persian large-text and expanded English native renders. No deployment was performed.

Commit verification in an isolated checkout also passed: web production build, 97 unit tests and five Chrome checks; backend typecheck, 12 unit tests and the real PostgreSQL avatar/migration test. The earlier 18 focused native tests and Android debug assembly cover the same native source included in this commit.
