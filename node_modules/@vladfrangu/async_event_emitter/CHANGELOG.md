# Changelog

All notable changes to this project will be documented in this file.

# [2.4.6](https://github.com/vladfrangu/async_event_emitter/compare/v2.4.6...v2.4.6) - (2024-08-21)

## 🐛 Bug Fixes

- Static `.on` returning wrong iterator types ([77ad774](https://github.com/vladfrangu/async_event_emitter/commit/77ad7741f75eeb499d217d7e93ce3fb5aab483ea))

# [2.4.5](https://github.com/vladfrangu/async_event_emitter/compare/v2.4.5...v2.4.5) - (2024-08-01)

## 🐛 Bug Fixes

- Brand each AEE instance so inference can work with AEE.on ([305b2c9](https://github.com/vladfrangu/async_event_emitter/commit/305b2c9bc7ccbe21355f8bbf4ee8c5a9cf460188))

# [2.4.4](https://github.com/vladfrangu/async_event_emitter/compare/v2.4.4...v2.4.4) - (2024-07-15)

## 🐛 Bug Fixes

- Accidentally inverted emit error event logic ([134ab3c](https://github.com/vladfrangu/async_event_emitter/commit/134ab3cf526137a0f014ed2984554a62a7714df7))

# [2.4.2](https://github.com/vladfrangu/async_event_emitter/compare/v2.4.2...v2.4.2) - (2024-07-09)

## 🐛 Bug Fixes

- Built types were wrong, causing inference issues ([28e9247](https://github.com/vladfrangu/async_event_emitter/commit/28e9247250e5a39f11a31efab88df334f05d6bfd))

# [2.4.1](https://github.com/vladfrangu/async_event_emitter/compare/v2.4.1...v2.4.1) - (2024-07-03)

## 🐛 Bug Fixes

- Correct strictness of types and overloads for certain methods ([75c7e19](https://github.com/vladfrangu/async_event_emitter/commit/75c7e191ffa65d2cfccf2dda4e4395427fb979f6))

# [2.4.0](https://github.com/vladfrangu/async_event_emitter/compare/v2.4.0...v2.4.0) - (2024-06-27)

## 🚀 Features

- Cleaner types, more correct types, the usual ([c1b0f75](https://github.com/vladfrangu/async_event_emitter/commit/c1b0f751f597d9dac5d10870f49f30b8b1dc4908))

# [2.3.0](https://github.com/vladfrangu/async_event_emitter/compare/v2.3.0...v2.3.0) - (2024-06-21)

## 🚀 Features

- Cleanup ignore comments ([0f4029e](https://github.com/vladfrangu/async_event_emitter/commit/0f4029e9935373e15073288da1841ffb39cc22d8))

# [2.2.4](https://github.com/vladfrangu/async_event_emitter/compare/v2.2.4...v2.2.4) - (2023-12-03)

## 🐛 Bug Fixes

- Correct import of CJS version in package.json (#3) ([8dc308c](https://github.com/vladfrangu/async_event_emitter/commit/8dc308c43fdf9a024a7d48e7219d75e4c9f597dd))

# [2.2.2](https://github.com/vladfrangu/async_event_emitter/compare/v2.2.1...v2.2.2) - (2023-05-11)

## 🐛 Bug Fixes

-   Listener count was always 0 for one listener ([9b78e19](https://github.com/vladfrangu/async_event_emitter/commit/9b78e1992db649004dee852359240b3d0baaac2d))

# [2.2.1](https://github.com/vladfrangu/async_event_emitter/compare/v2.2.0...v2.2.1) - (2023-04-08)

## 🐛 Bug Fixes

-   Include comment for throwing error on emit ([19de045](https://github.com/vladfrangu/async_event_emitter/commit/19de0452702a0d9e35e9241259d100ca6d6f5447))

# [2.2.0](https://github.com/vladfrangu/async_event_emitter/compare/v2.1.4...v2.2.0) - (2023-04-07)

## 🚀 Features

-   Speed 🚀 ([23eb908](https://github.com/vladfrangu/async_event_emitter/commit/23eb90852ff8a6ceb4d6105c6df44c646642efae))

# [2.1.4](https://github.com/vladfrangu/async_event_emitter/compare/v2.1.3...v2.1.4) - (2023-02-18)

## 🐛 Bug Fixes

-   Remove predefined error event to allow extensions ([4224bbe](https://github.com/vladfrangu/async_event_emitter/commit/4224bbeae5c25cb94d4073600a9dff7ae3abcceb))

# [2.1.2](https://github.com/vladfrangu/async_event_emitter/compare/v2.1.1...v2.1.2) - (2022-09-19)

## 🐛 Bug Fixes

-   Don't use any `@types/node` types ([e4babce](https://github.com/vladfrangu/async_event_emitter/commit/e4babce88c17befdb6f84c73c0de2e0602260681))

# [2.1.1](https://github.com/vladfrangu/async_event_emitter/compare/v2.1.0...v2.1.1) - (2022-09-19)

## 🐛 Bug Fixes

-   Correct type errors when building with other types too ([72a03ae](https://github.com/vladfrangu/async_event_emitter/commit/72a03ae1ac30456241b4003a7c2ea93d27e8de5e))

# [2.1.0](https://github.com/vladfrangu/async_event_emitter/compare/v2.0.1...v2.1.0) - (2022-09-18)

## 🚀 Features

-   Bring in line with nodejs EventEmitters ([5a14ed0](https://github.com/vladfrangu/async_event_emitter/commit/5a14ed04bf87ec6a34cd33e26e3f25f101f87bcd))

# [2.0.1](https://github.com/vladfrangu/async_event_emitter/compare/v2.0.0...v2.0.1) - (2022-07-09)

## 🐛 Bug Fixes

-   Error event not properly emitting ([b849b38](https://github.com/vladfrangu/async_event_emitter/commit/b849b387c36515c60234c06681bfd4ec32ee5336))

# [2.0.0](https://github.com/vladfrangu/async_event_emitter/compare/v1.0.1...v2.0.0) - (2022-06-29)

## 🚀 Features

-   Use stringified bigints instead of uuids for promise map ([8c69419](https://github.com/vladfrangu/async_event_emitter/commit/8c694199da1a0a231feb1be3b0d7cfdb18cefd0b))

    ### 💥 Breaking Changes:

# Changelog

All notable changes to this project will be documented in this file.
