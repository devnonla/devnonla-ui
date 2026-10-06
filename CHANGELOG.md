# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.11.0] - 2026-10-06

### Added

- `AgentAvatar`: a small animated character made of a shape and two eyes. `config` sets `shape` and `color` (options in `AGENT_AVATAR_PARTS`). `size` is in px. `motion` is `still` or `idle`; `idle` looks around and blinks. `look` turns the face to a fixed direction.
- `MarkdownViewer` runs `live-react` fences. Use `sandboxSrc` for markdown written by users or agents: the fence runs in an iframe with `sandbox="allow-scripts"`, so it cannot read the page's cookies, storage, or DOM. The frame is removed if it does not start, errors, or does not render in time. Use `trustedModules` only for markdown you wrote. It runs in the page itself.
- `mountReactCodeRunner` is the runner side of the sandbox. Call it from the page `sandboxSrc` points to. `ReactCodeSandbox`, `ReactCode`, and `ReactCodeFrame` are exported for direct use outside markdown.
- `live-react` results show a `Sandbox` or `Live` header. `showHeader={false}` on `MarkdownViewer`, `ReactCode`, or `ReactCodeSandbox` shows the result inline instead. The header has a `Preview` / `Code` tab for the source. `showCode={false}` removes the Code tab.
- A `live-react` fence runs only once its closing line is written, so a streaming reply never runs half a block.

### Changed

- `ChatWelcome` shows `AgentAvatar` as the default avatar, in place of the initial in a circle. A custom `avatar` still replaces it.

### Fixed

- Markdown tables cap cell width at 360px and wrap long text inside the cell, so one long line no longer stretches the table.

### Upgrade notes

- New dependency: `sucrase` (installed with `devnonla-ui`). Nothing to change if you don't use `live-react`.
- `live-react` is off unless you pass `sandboxSrc` or `trustedModules`. Without either, the fence renders as a normal code block. Use `trustedModules` only for markdown you wrote.

## [0.10.0] - 2026-10-05

### Added

- `Logo` with `variant` (`icon` | `text` | `full`) and `face` (`pixel` | `jakarta`). `size` sets the icon height. `color` recolors the mark and the wordmark; the eyes and the smile stay.
- `Typography`, `Text`, `Title`, `Paragraph`, and `Link`. Titles use levels 1–5. Decorations include `type`, `disabled`, `mark`, `code`, `keyboard`, `underline`, `delete`, `strong`, and `italic`.
- `MarkdownViewer` renders markdown for reading: headings, lists, tables, code, and mermaid. Agent replies use the same view.
- `ThemeSwitcher`, `setColorPreference`, and `getColorPreference`. The stored choice is `light`, `dark`, or `system`. `system` follows the OS and still paints `light` or `dark` on `<html>`, under the same `nonla-color-mode` key.

### Changed

- `.nonla-shimmer` keeps the glyphs muted and sweeps a narrow highlight across the letters.

### Upgrade notes

- `chatBodyClass`, `chatMarkdownClass`, `chatMarkdownComponents`, `createChatMarkdownComponents`, and `ChatMarkdownStreamState` are no longer exported. Use `ChatMarkdown` or `MarkdownViewer`. `MermaidBlock` stays exported.
- `setColorMode("light" | "dark")` still works. A stored `system` value in `nonla-color-mode` is now valid.

## [0.9.1] - 2026-10-03

### Changed

- `MarkdownEditor` with `readOnly` hides the mode switcher. With no `title`, the header bar is hidden too, so preview can show a finished document.
- Preview headings use a blog scale: H1 32px and H2 24px are bold; H3–H6 step down to 20, 18, 16, and 15px. Space above each level is tighter, and the paragraph under a heading sits closer to it.
- Task checkboxes in the preview use the brand fill, so the mark stays visible on a light page.

## [0.9.0] - 2026-10-03

### Added

- Light and dark color mode. Dark is the default. `setColorMode`, `initColorMode`, `getColorMode`, and `ThemeToggle` remember the choice (`nonla-color-mode`). Put `class="light"` on `<html>` to start in daylight.
- `Card`, `Card.Item`, and `Card.Footer` for a titled settings surface.
- `MarkdownEditor` with preview, edit, and diff (`original`, `diffLayout`).
- `SolarIcon` and `solarIconName`. Pass a style such as `bold-duotone` to force a weight. Legacy Fluent names (`FluentIcon`, `fluentIconName`, `settings-24`) still resolve.
- `Checkbox` and `Switch` `color`: `brand` | `success` | `white`.
- `Spin` `color`: `brand` | `neutral`.
- `DesktopWindow` `header={false}` hides the title bar and keeps close and expand over the top-left.
- Searchable `Select` filters options from the trigger.
- `Table` pagination footer includes a page-size menu (`showSizeChanger` stays on unless set to `false`).

### Changed

- Default palette is a dark solid surface. `:root` and `.dark` share it. `.light` is the daylight palette (page `#f3f3f3`, white cards). Shadows follow `--nonla-shadow`. Code uses GitHub Dark Dimmed, with a light syntax theme under `.light`.
- Outlined fields are transparent. Focus fills with an ink wash and strengthens the stroke.
- `Table` is bordered by default and uses a hairline frame.
- Sidebar string icons render as Solar bold-duotone. Group labels are 11px and bold.
- `MermaidBlock` follows the active color mode.

### Upgrade notes

- Apps that want the previous daylight page need `class="light"` on `<html>`, or `setColorMode("light")`.
- `Table` without `bordered={false}` now draws a frame. The footer shows a page-size control unless `pagination.showSizeChanger` is `false`.
- Icon glyphs are Solar. Import names from 0.8.0 still work.

## [0.8.0] - 2026-09-25

### Changed

- Light theme defaults: page `#f3f3f4`, ink `#2e2e34`, muted text steps, chip and border, `--nonla-danger` `#ef4444`, `--nonla-warn` `#f59e0b`. Hover and active use a neutral wash. `--nonla-ink-line` matches the border.
- Chat body is 14px / 20px (`--chat-body-size`, `--chat-body-leading`).
- `Table` and markdown table headers use opaque `--nonla-table-head` (4% ink on the page), including headers that are not sticky.
- User bubbles use a solid brand fill. The composer stroke follows `--nonla-input`. The thinking label is body size.
- `CodeBlock` header is shorter and has no file icon.
- Overlay scrollbar thumbs sit 1px from the edge.
- Desktop window glass uses an inset hairline and a soft drop shadow.
- `MermaidBlock` always renders the default light theme. Preview actions are fullscreen only. Download SVG stays in the fullscreen dialog. Toolbar controls use `Button`.

### Upgrade notes

- The cream seed is gone. Set `--nonla-bg`, `--nonla-fg`, and the text-rank knobs if you still want that look.
- Sticky table headers no longer use flat `--nonla-bg`. Override `--nonla-table-head` to recolor them.
- There is no light/dark toggle on mermaid diagrams.

## [0.7.1] - 2026-09-24

### Added

- `OverlayScroll`: optional `style` and `insetTop`. `insetTop` keeps the vertical thumb below a sticky header.

### Changed

- `Table` with `scroll.y` scrolls the body through `OverlayScroll`. The sticky header uses an opaque `--nonla-bg` fill so row text does not show through. The vertical thumb starts below the header. Flex columns account for the scrollbar width.

### Fixed

- `EditableInput` popover Save and Cancel stay small regardless of the field size.

## [0.7.0] - 2026-09-16

### Added

- `EditableInput`: inline display with a pencil control. While editing, a popover field saves via `onSave` (`type`: `text` | `password` | `textarea`). `EditableInput.Key` validates `^[A-Z][A-Z0-9_]*$`.
- `Table` column `flex`: `true` shares leftover container width equally; a number is a weight. Text wraps in that width instead of forcing horizontal scroll. Ignored when `scroll.x` or `width` is set.

### Changed

- Outlined fields (Input, Select, DatePicker, TimePicker) use the ink `--input` border instead of the glass frost border, so the stroke stays visible on a white page.
- `Table` body and header use `text-base` (14px in this theme). Header cells use an ink wash (`bg-foreground/4`).

### Upgrade notes

- Once `rowSelection` has any selected key, a row click toggles selection and does not call `onRow.onClick`. Checkbox and radio clicks are unchanged.

## [0.6.0] - 2026-09-15

### Added

- `Sidebar`: grouped side nav from JSON (`type: "group"` + items). Optional search, `selectedKey` / `onSelect`, `href` for links. `icon` may be a Fluent name string.
- `DesktopWindow` remembers last collapsed position and size (`persistKey`, on by default; `false` to disable).

### Changed

- `DesktopWindow` keeps resize handles when expanded. Dragging an edge leaves expand and keeps the new size.

## [0.5.1] - 2026-09-14

### Changed

- Hover/active on Button, Menu, Dropdown, Select, pickers, Pagination, and Tag uses ink tint (`ink-hover` / `ink-active`) instead of gray/frost overlays. Menu highlight is ink, not a glass chip.
- `Segmented` uses a sliding glass thumb on a frosted track.
- `Splitter` gutter is a 1px line that thickens on hover/drag; the center handle pill is gone.
- `AgentChatbox` / `AgentPanel` column is slightly wider. `AgentChatbox` composer padding is tighter. Default `ChatToolCall` icon is a code block.

### Fixed

- `ChatInput` textarea height no longer stays stretched after collapse; it remeasures when the composer width changes.

## [0.5.0] - 2026-09-14

### Added

- `AgentChatbox` / `useAgentChatStream`: chat surface where the app POSTs only the new user text and can resume a live SSE stream (`send`, `resume`, `onStop`).
- `Dropdown` / `ContextMenu` items: `type: "group"` with an optional label.

### Changed

- `ChatToolCall` header spacing; `ChatInput` clear icon is slightly smaller.

### Upgrade notes

- `onToolAction` and type `AgentToolAction` are removed. Listen with `toolHooks` (`onCall` / `onResult`).

## [0.4.3] - 2026-09-13

### Changed

- `AgentPanel` footer status is smaller muted text (`text-sm` / `text-tertiary-foreground`).

### Fixed

- `AgentPanel` / `useAgentStream`: streamed `tool-call` events merge into one card (same id, still running, or result-before-params) instead of stacking duplicates.
- SSE `tool-call` / `tool-result` accept field aliases (`tool_call_id` / `callId`, `name`, `label`, `arguments` / `args`, `output`).

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

[0.11.0]: https://github.com/devnonla/devnonla-ui/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/devnonla/devnonla-ui/compare/v0.9.1...v0.10.0
[0.9.1]: https://github.com/devnonla/devnonla-ui/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/devnonla/devnonla-ui/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/devnonla/devnonla-ui/compare/v0.7.1...v0.8.0
[0.7.1]: https://github.com/devnonla/devnonla-ui/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/devnonla/devnonla-ui/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/devnonla/devnonla-ui/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/devnonla/devnonla-ui/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/devnonla/devnonla-ui/compare/v0.4.3...v0.5.0
[0.4.3]: https://github.com/devnonla/devnonla-ui/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/devnonla/devnonla-ui/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/devnonla/devnonla-ui/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/devnonla/devnonla-ui/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/devnonla/devnonla-ui/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/devnonla/devnonla-ui/compare/v0.1.0...v0.2.0
