# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.2] - 2026-09-13

### Fixed

- `AgentPanel` / `useAgentStream`: a repeated `tool-call` SSE event with the same `toolCallId` updates the existing card (name, label, input) instead of adding a duplicate bubble.

## [0.4.1] - 2026-09-13

### Changed

- `DesktopIcon` no longer wraps the default Fluent icon in a frosted squircle plate.
- Meadow desktop icon grid uses a tighter icon–label gap and nav padding.

### Upgrade notes

- `.nonla-desktop-icon-plate` is removed. Custom default-icon chrome should go through `DesktopIcon` `media`.

## [0.4.0] - 2026-09-13

### Added

- `Pagination`: Ant Design-style pager (`align`, `showTotal`, `showQuickJumper`, `showSizeChanger`, `simple`, `hideOnSinglePage`, `responsive`, size changer, jump ellipses). Types: `PaginationAlign`, `PaginationSemanticSlot`, `PaginationSizeChangerProps`.
- `Table` `pagination` forwards the same Pagination options (`showTotal`, `showQuickJumper`, `align`, …).
- `OverlayScroll` `autoHeight` and a horizontal overlay thumb.
- `ButtonCopy` / `CodeBlockCopyButton` `size` (`ControlSize`).
- Tailwind theme colors `--color-well` / `--color-well-strong`; `.nonla-chat-tool-result-ok`.
- Public types: `DesktopHeaderProps`, `DesktopWindowProps`, `WindowHeaderProps`.

### Changed

- `DesktopHeader` slots are `left` / `right` (was `logo` / `leading` / `trailing` / `profile`).
- `DesktopWindow` chrome is `left` · title (double-click expands) · `right`. `WindowHeader` fills those slots from a child (`left` / `right`, not `children`).
- `Spin` `variant="agent"` matrix uses brand cells and explicit small / default / large metrics. `variant="subAgent"` removed (same as `agent`).
- `CodeBlock` body uses `OverlayScroll`.
- Chat tool / message UI: lucide icons, `Spin variant="agent"` for running tools, quieter tool cards.

### Fixed

- Escape on an open Modal no longer closes `DesktopWindow`.
- Input number / password / search icons follow control size.

### Upgrade notes

- `DesktopHeader`: `logo` + `leading` → `left`; `trailing` + `profile` → `right`.
- `WindowHeader`: pass `left` / `right` instead of `children`.
- Replace `Spin variant="subAgent"` with `variant="agent"`.
- `ButtonCopy` / `CodeBlockCopyButton` `size` is `"small" | "default" | "large"`, not the native button attribute.
- Standalone `Pagination`: `showSizeChanger` turns on when `total > 50` unless `simple` or you pass `false`. `Table` still defaults `showSizeChanger={false}`.

## [0.3.0] - 2026-09-12

### Added

- `Splitter` / `Splitter.Panel` — resizable split panels (`orientation`, min/max size, `onResize`).
- `ColorPicker` panel: saturation/brightness, hue/alpha, HEX / RGB / HSB, presets, `showText`, `allowClear`, sizes.
- `Color` helper (`toHexString`, `toRgbString`, `toHsbString`, `toCssString`).

### Changed

- `ColorPicker` public API now matches Ant Design-style props (`value` / `onChange(color, css)`, `size` as control size). SchemaForm `color` fields use the new picker.

### Upgrade notes

- Replace `ColorPicker` usage: `onChange` is `(color: Color, css: string) => void`; `size` is `"small" | "default" | "large"`; `presets` is optional `{ label, colors }[]`.
- Store `Color` in controlled mode to avoid HEX round-trip drift.

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

[0.4.2]: https://github.com/devnonla/devnonla-ui/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/devnonla/devnonla-ui/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/devnonla/devnonla-ui/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/devnonla/devnonla-ui/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/devnonla/devnonla-ui/compare/v0.1.0...v0.2.0
