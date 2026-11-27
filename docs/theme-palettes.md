# Named theme palettes

The accepted seeds below apply to browser and native settings (DD-043). These exact user-selected values are the product contract, regardless of future Google Calendar palette changes.

Use Material 2021 Tonal Spot, standard contrast (0), in light and dark modes. The swatch displays the seed, while application components consume generated semantic roles. watchparty default retains the original cinema palette.

| Name | Seed |
| --- | --- |
| Tomato | `#D50000` |
| Flamingo | `#E67C73` |
| Tangerine | `#F4511E` |
| Pumpkin | `#EF6C00` |
| Mango | `#F09300` |
| Banana | `#F6BF26` |
| Citron | `#E4C441` |
| Avocado | `#C0CA33` |
| Pistachio | `#7CB342` |
| Basil | `#0B8043` |
| Eucalyptus | `#009688` |
| Sage | `#33B679` |
| Peacock | `#039BE5` |
| Cobalt | `#4285F4` |
| Blueberry | `#3F51B5` |
| Lavender | `#7986CB` |
| Wisteria | `#B39DDB` |
| Amethyst | `#9E69AF` |
| Grape | `#8E24AA` |
| Radicchio | `#AD1457` |
| Cherry Blossom | `#D81B60` |
| Cocoa | `#795548` |
| Graphite | `#616161` |
| Birch | `#A79B8E` |

## Verification (2026-11-11)

- Browser production build and seed/contrast unit tests pass. All 24 choices pass browser acceptance in light and dark modes, with persistence and default reset. Compact/expanded large-text RTL, keyboard selection, and local-storage failure recovery pass; screenshots reviewed.
- Native preference and settings tests, native Compose picker interaction at compact/expanded sizes with dark RTL large text, app graph compilation, and Android debug assembly pass. Verification used a separate source-identical checkout because concurrent workspace builds collided on generated outputs.
