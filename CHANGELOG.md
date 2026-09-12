# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-09-12

### Added

- `Shimmer` — sweep highlight for live status text (`import { Shimmer } from "devnonla-ui"`).
- `<App>` ConfigProvider: `componentSize`, `useApp()`, `useToken()`, `usePopupContainer()`, plus in-tree `message.*` / `Modal.confirm` holders.
- `getDesignToken()` and `useControlSize()` — live `--nonla-*` snapshot and size resolution (control prop → App `componentSize` → default).
- Theme knobs `--nonla-z-base` / `--nonla-z-desktop` / `--nonla-z-window` / `--nonla-z-header` / `--nonla-z-popup-base` (derived `--nonla-z-drawer` / `--nonla-z-modal` / `--nonla-z-message` / `--nonla-z-popup`).
- `AgentPanel` `toolUis` and `toolHooks` — extra tool cards win over builtins; hooks match by `name` (omit / `"*"` for every tool).
- Chat helpers: `matchesToolName`, `matchesToolHook`, `builtinToolUis`, `matchesToolUIName`, `isToolRunning`.

### Changed

- Default `--nonla-brand` `#eb9d29` → `#f18d00`; `--nonla-solid-fg` charcoal → white (Button primary, Tag solid, Checkbox).
- Tailwind spacing `control-sm` / `field-sm` 28 → 24, `control-lg` / `field-lg` 36 → 40 (aligned with height knobs 24 / 32 / 40).
- Overlays (Select, Dropdown, DatePicker, Modal, Drawer, …) portal through `App getPopupContainer`.
- Desktop window / icon plates use token z-index layers and `--nonla-window-glass`.
- `.dark` is no longer an alias of the light seed block.

### Upgrade notes

- Put one `<App>` near the root so `message.*`, `Modal.confirm`, overlays, and `componentSize` share theme.
- Brand fill labels: override `--nonla-solid-fg` / `colors.solidFg` if you still want charcoal on amber.
- Replace class `nonla-chat-shimmer` with `Shimmer` or `.nonla-shimmer`.
- `resolveToolUI(toolName, extras?)` — second argument is optional; extra UIs are checked first.

[0.2.0]: https://github.com/devnonla/devnonla-ui/compare/v0.1.0...v0.2.0
