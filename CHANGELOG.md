# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.15.0] - 2026-10-09

### Added

- `Icon` and `IconName`. Glyphs ship with the package. Pass `name` and an optional `size`.
- `BlobShape`. Closed shapes (`blob`, `blob-alt`, `ring`, `orb`, `square`, `star`, `circle`, `cursor`) and line dividers (`horizontal`, `fade`, `dashed`, `double`, `ornament`, `zigzag`, `wave`, `waves`, `mountain`, `vertical`). `appearance` is `solid`, `outline`, or `sticker`.
- `AgentSseCallbacks` is exported. `onTextEnd` closes the current assistant bubble so the next text delta starts another.
- `OverlayScroll` `scope`: `"scroll"` (default) or `"table"`. A table scroller does not light up when a parent chat scroller is hovered.
- Markdown tables have a fullscreen control.
- Type tokens `--nonla-md-text-size` (16px), `--nonla-sm-text-size` (14px), and `--nonla-mono-text-size` (0.9× the body size). Tailwind `text-md` reads the markdown size. `text-sm`, `text-base`, and `text-lg` follow the theme.

### Changed

- `AgentChatbox` and `AgentPanel` read an [AG-UI](https://docs.ag-ui.com/concepts/events) SSE stream. Text, reasoning, and tool calls render. `RUN_FINISHED` ends the turn. `RUN_ERROR` shows the error. `CUSTOM` events `tool-meta` and `tool-call-input` update the open tool card.
- `MarkdownViewer` uses one scale. Body is `text-md` (16px, leading 1.6). Tables stay `text-base`. Headings: H1/H2 are 26/32 at weight 600, H3 is 24/32 at weight 600, H4–H6 are 20/26. Pass `style` to override the scale variables. Agent replies keep that body size and paint headings at weight 400.
- Tabs can be dragged when the bar overflows. The wheel scrolls faster. The active tab is brand colored.
- Sidebar and Tabs `icon` accepts an `Icon` name or a node.
- `--nonla-base-text-size` is 15px. `body` uses it at leading 1.6, so `1rem` and Tailwind spacing stay put. Dark `--nonla-text-main` is `#e0e0e0`.
- Light page is `#ffffff`, text is `#262626`, sidebar and surface are `#fafafa`.
- Chat rows share one rhythm. User bubbles are `text-base`. Tool lines, the composer, and errors are `text-sm`.

### Upgrade notes

- **Removed exports:** `SolarIcon`, `FluentIcon`, `ensureSolarIcons`, `ensureFluentIcons`, `solarIconName`, `fluentIconName`, `solarIconRef`, `fluentIconRef`, `getSolarSvg`, `getSolarImgSrc`, `getFluentImgSrc`, `getIconNames`, `isSolarIcon`, `isFluentIcon`, `isSvgIcon`, `ICON_PREFIX`, `DEFAULT_ICON_NAME`, `DEFAULT_TOOL_ICON`, and `MarkdownVariant`. Use `Icon`.
- **`MarkdownViewer` `variant` is gone.** `"docs"` and `"chat"` are the same scale. Drop the prop. `normalizeSseEvent` and `AgentSseEvent` are gone. `parseSseStream` accepts AG-UI events.
- **The agent endpoint must speak AG-UI.** `text-delta`, `thinking-delta`, `tool-call`, `tool-result`, `done`, and `error` are no longer read.
- **`DesktopIcon` `icon` is gone.** Pass `media`, or leave it empty for the stars glyph.
- **Sidebar and Tabs string icons** only render when the string is an `IconName`. A Solar id (`pen-linear`) or a Fluent id (`settings-24`) renders nothing. Pass `<Icon name="pen" />` or another node.
- **Type scale:** `text-base` is 15px, not Tailwind’s 16px. `text-sm` is 14px via `--nonla-sm-text-size`. Markdown and agent body text are `text-md` (16px). To keep the 0.14.0 body, set `--nonla-base-text-size: 16px`. To keep the old light page (`#fafafa`, text `#404040`, surface `#ffffff`), set those `--nonla-*` keys yourself. Dark ink was `#ffffff`.

## [0.14.0] - 2026-10-08

### Added

- `--nonla-text-main`, `--nonla-text-secondary`, `--nonla-text-tertiary`, `--nonla-text-quaternary`, and `--nonla-text-on-solid` for text ink.
- `--nonla-border-secondary`, `--nonla-fill`, `--nonla-fill-strong`, `--nonla-input-focus`, and `--nonla-bar` for borders, washes, and the focus stroke.
- `--nonla-font` and `--nonla-base-text-size` for the UI font and the markdown body size.
- Tailwind utilities `bg-muted-strong`, `bg-bar`, `border-border-secondary`, and `text-quaternary-foreground`.
- Docs: a colors page and the `EditableInput` API tables.

### Changed

- The theme is one small config block: `--nonla-bg`, the `--nonla-text-*` keys, `--nonla-brand`, the status colors, and the surface and border keys. Derived names follow it.
- Focus rings on Calendar, Tabs, and copy buttons use `brand/55` instead of the old ring color.
- Input focus fill uses the sidebar step, and the focus stroke is `--nonla-input-focus`.
- Light palette: page and sidebar `#fafafa`, text `#404040`, borders `#e5e5e5`.
- Chat body text is 15px with a 24px line height.
- Tailwind's default type scale applies. `text-sm` is 14px and `text-xs` is 12px.
- Sidebar: a flat list. `type: "group"` rows are labels. Search keeps a group label when one of its rows matches.
- `ReactCode` keeps the live preview mounted when the code view opens.

### Upgrade notes

- **Removed exports** from `devnonla-ui`: `useToken`, `getDesignToken`, `NONLA_THEME_KEYS`, `NONLA_THEME_KNOBS`, and the types `NonlaThemeKnob`, `NonlaThemeKnobName`, `NonlaTokenSnapshot`.
- **Renamed knobs:** `--nonla-fg` becomes `--nonla-text-main`, `--nonla-fg-muted` becomes `--nonla-text-secondary`, `--nonla-fg-tertiary` becomes `--nonla-text-tertiary`, `--nonla-fg-quaternary` becomes `--nonla-text-quaternary`, and `--nonla-solid-fg` becomes `--nonla-text-on-solid`. `--nonla-bg` is unchanged. If you followed 0.13.0's note and set `--nonla-fg`, set `--nonla-text-main` instead.
- **Removed knobs** with no alias: `--nonla-ink`, `--nonla-elevated`, `--nonla-chip`, `--nonla-chip-hover`, `--nonla-composer`, `--nonla-chat-bg`, `--nonla-meadow`, `--nonla-glass*`, `--nonla-ink-line`, `--nonla-placeholder`, `--nonla-table-head`, `--nonla-desktop-bar-height`, `--nonla-window-header`. `--nonla-hairline` becomes `--nonla-border-secondary`.
- **Removed markdown tokens** from 0.13.0: `--md-ink`, `--md-heading`, `--md-inline-bg`. Use `text-foreground`.
- **Removed `--chat-*` size tokens and `--text-*` scale overrides.** `text-2xs` no longer exists. Re-set `--text-*` in your CSS if you need the old sizes.
- **Removed shadow tokens:** `--shadow-card`, `--shadow-drop`, `--shadow-panel`, `--shadow-whisper`, `--shadow-button-outline`.
- **Removed Tailwind colors:** `bg-primary`, `bg-secondary`, `bg-accent`, `bg-glass`, `bg-well`, `bg-meadow`, `bg-chat`, `text-placeholder`, `text-solid-fg`, `border-hairline`, `border-border-subtle`, `ring-ring`, `bg-ink-line`, and related names. Use `bg-muted`, `text-quaternary-foreground`, `border-border-secondary`, and `ring-brand/55`.
- **Sidebar:** the `children` prop is gone. Put each group label as a `type: "group"` row in one flat `items` array.

## [0.13.0] - 2026-10-07

### Added

- `Tabs`. Each item has `key`, `label`, `children`, `disabled`, and an optional Solar `icon`. Control the selection with `activeKey`, `defaultActiveKey`, and `onChange`. The underline slides to the active tab. When the bar overflows, it scrolls, with fades and chevrons at the edges.
- `AgentAvatar` `config.eyeColor`: `"black"` or `"white"`. Omit it and the pupils stay black, or white when the face is dark.
- `MarkdownViewer` `variant`: `"docs"` (default) or `"chat"`. `MarkdownVariant` is exported. Agent replies use `"chat"`.
- `Typography.Title` level `6`.
- Markdown tokens `--md-ink`, `--md-heading`, and `--md-inline-bg`, plus `--nonla-card-shadow`. Inline code uses `.nonla-inline-code`.

### Changed

- The UI font is the system stack. `styles.css` no longer loads Inter Variable.
- Dark ink is `#ffffff`. Borders, hairlines, and input strokes are lighter. The window title bar is `#242424`.
- Light page is `#ffffff`, text is `#2c2c2b`, and the sidebar is `#f7f5f2`. A card on white is a ring only. The chat composer has no drop shadow, and the user bubble uses the sidebar fill.
- `MarkdownViewer` on `"docs"` is body 16/24. H1 and H2 are 30/40. Task checks use the body ink.
- `Typography` uses that same scale. Headings use `--md-heading`. Body, paragraphs, and links use `--md-ink`.
- `ChatAgentMessage` `content` is markdown (`variant="chat"`), not preformatted plain text. `children` still replaces `content`. `ChatMarkdown` uses the same variant.
- Sidebar items are 14px. Group labels are semibold.
- `ReactCode` no longer defaults to a "Live" title and play icon. With no title and no icon, the source opens from a code button under the preview. `ReactCodeSandbox` still defaults to a Sandbox header.
- Docs are at https://devnonla.github.io/devnonla-ui/. The README is the install snippet and that link.

### Fixed

- An empty `AgentPanel` or `AgentChatbox` no longer adds extra space under the welcome.

### Upgrade notes

- Remove `<App theme>` and `applyNonlaTheme`. Set `--nonla-*` in your CSS. `NonlaThemeConfig`, `NonlaThemeColors`, and `NonlaThemeColorName` are no longer exported.
- These preset knobs are gone: `--nonla-blue`, `--nonla-purple`, `--nonla-cyan`, `--nonla-green`, `--nonla-magenta`, `--nonla-pink`, `--nonla-red`, `--nonla-orange`, `--nonla-yellow`, `--nonla-volcano`, `--nonla-geekblue`, `--nonla-lime`, `--nonla-gold`. Named `Tag` colors still work. They no longer read those variables.
- `ChatAgentMessage` `content` is parsed as markdown. Pass `children` when the body must stay literal text.
- `ReactCode` callers who want the old header should pass `title="Live"` and an icon.
- To keep the previous ink or page color, set `--nonla-fg` and `--nonla-bg`. Dark ink was `#f0f0f0`. The light page was `#f3f3f3`. A custom `--font-sans` still overrides the system stack.

## [0.12.0] - 2026-10-06

### Added

- `Button` `variant="nostyle"` drops the border, fill, padding, height, and icon box so you can style the control yourself.
- `DesktopWindow` `origin` is an element ref. The window zooms from that element on open and back to it on close. Without it, the zoom uses the active desktop icon.
- `DesktopWindow` `closeRef` receives a close function. Call it instead of unmounting so the window can shrink back to `origin`.

### Changed

- `Logo` wordmark is K2D regular, drawn as SVG outlines. The `face` prop and the pixel wordmark are gone. `LogoFace` is no longer exported.
- `DesktopWindow` opens with a short zoom. Reduced motion skips it.
- `MarkdownViewer` and the markdown preview body are 14px with 22px line height. H6 is 14px. Inline code has a hairline outline, and task rows match the line height.
- `Title` no longer adds space above and below. Spacing is up to the parent. Inline `code` on `Text` and `Title` has a hairline outline.
- Sidebar items are 13px with more padding. Group labels sit a little farther apart.

### Fixed

- Color mode is applied before the first paint, so a sandbox iframe opens on the saved mode.
- Reading the stored color preference no longer throws inside a sandboxed iframe.
- A `live-react` sandbox keeps the frame after a slow start. The runner URL includes `?mode=light|dark`, a missed `ready` message is retried, and a timeout no longer replaces a preview that already painted.

### Upgrade notes

- Remove `face` from `Logo`. Drop the `LogoFace` import. The wordmark is an SVG, not a live font.

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

[0.15.0]: https://github.com/devnonla/devnonla-ui/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/devnonla/devnonla-ui/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/devnonla/devnonla-ui/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/devnonla/devnonla-ui/compare/v0.11.0...v0.12.0
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
