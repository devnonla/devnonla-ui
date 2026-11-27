---
name: devnonla-ui
description: >-
  Build React UI with devnonla-ui (NonlaUI), the Nonla Agents kit: setup, which
  component fits each case, house style, theming tokens, and the agent chat kit
  (AgentPanel / AgentChatbox, tool cards). Use when a project imports
  devnonla-ui, or the user asks for a page, form, settings screen, table,
  dialog, theme change, or agent chat with NonlaUI.
---

# devnonla-ui

React 19 kit. Docs with live examples: https://devnonla.github.io/devnonla-ui/

## Setup

| Step | Do |
|---|---|
| Install | `bun add devnonla-ui` (peers: react, react-dom ≥ 19, react-hook-form; Tailwind CSS v4) |
| CSS | `@import "tailwindcss"; @import "devnonla-ui/styles.css";` |
| Root | Wrap the tree once in `<App>` (tokens, theme, popups, `message`, `Modal.confirm`). Props: `componentSize`, `className`, `getPopupContainer` |
| Remote (no bundler / no Tailwind) | Prebuilt ESM + CSS, see [guides/remote-esm.md](guides/remote-esm.md) |
| Imports | Controls `devnonla-ui` · chat `devnonla-ui/chat` · markdown `devnonla-ui/markdown` |
| Theme | Override `--nonla-*` on `.nonla-ui`. Never fork a component |

## Which component

| Case | Use |
|---|---|
| Main action (one per view) | `Button type="primary"` |
| Secondary action | `Button` (default, raised white) |
| Quiet / inline action | `Button type="text"` or `type="link"` |
| Toolbar icon | `Button type="icon" aria-label` + `Icon`, often in `Tooltip` |
| Destructive | `danger` on Button; confirm with `Popconfirm` or `Modal.confirm` |
| Settings section | `Card title caption` + `Card.Item label description` with the control as child |
| Page title row | `PageHeader title description meta extra` |
| Where am I | `Breadcrumb items=[{ title, href \| onClick }]` in the top bar |
| Jump anywhere (⌘K) | `CommandPalette groups=[{ label, items: [{ key, label, description, icon, onSelect }] }]`; ⌘K opens it |
| Shortcut hint | `Kbd keys={["⌘","K"]}` |
| Side navigation | `Sidebar items` (`group`, `divider`, `description`), `selectedKey`, `onSelect` |
| Text input | `Input`, `TextArea`, `InputNumber`, `SearchInput`, `EditableInput` |
| One of many | `Select options` (long list), `Segmented` (2–5 inline), `Tabs items` (views; `variant="pill"` for sibling pages in a header) |
| On / off | `Switch` (applies now), `Checkbox` (part of a form) |
| Date, time, color | `DatePicker`, `RangePicker`, `TimePicker`, `ColorPicker` |
| Form | `SchemaForm form items` with `EFormItemType` (react-hook-form `useForm`) |
| List of records | `Table columns dataSource rowKey` + `Pagination` |
| Status label | `Tag color` (`success`, `error`, `warning`, `processing`) |
| Empty / loading | `Empty icon title description action`; `Table loading` shows skeleton rows; `Skeleton`, `Spin`, `Shimmer` |
| Dialog | `Modal open onOk onCancel`; side panel `Drawer` |
| Floating content | `Popover`, `Tooltip title`, `Dropdown` / `ContextMenu` / `Menu` |
| Feedback | `message.success("Saved")` (also `error`, `info`, `warning`, `loading`); inline `Alert type` |
| Resizable panes | `Splitter` + `SplitterPanel` |
| Tree (files, nested settings) | `Tree treeData showLine` (SVG guide lines from each icon, click a row to open it, arrow keys) |
| Tree / reorder | `SortableTree` |
| Text and code | `Typography` (`Title`, `Text`, `Paragraph`, `Link`), `CodeBlock`, `MarkdownViewer` |
| Icon | `Icon name size` (45 glyphs; stroke auto-scales) |
| Theme switch | `ThemeSwitcher`, `ThemeToggle`, `setColorPreference` |

## House style

| Topic | Do | Don't |
|---|---|---|
| Actions | One `primary` (orange brand) per view | Several primaries, brand-colored secondary buttons |
| Selected state | Neutral ink (Switch, Checkbox, tabs, nav) | Brand color for selection |
| Text color | Foreground, `text-muted-foreground`, `text-tertiary-foreground` | Opacity on text, hex colors |
| Text size | 15 body (`text-base`), 14 UI (`text-sm`), 12 captions (`text-xs`) | 13px or smaller UI text (Vietnamese diacritics) |
| Weight | 400 text, 500 labels and buttons, 600 titles | Bold body copy |
| Depth | Page `#fafafa`, white `Card`, 10% hairlines | Heavy borders, big shadows |
| Status | `text-destructive`, `bg-destructive-bg`, `border-destructive-border` (same for success, warn, link) | Hardcoded red/green |
| Size | `size="small" \| default \| "large"` (24/32/40px) | Hand-sized controls |
| Motion | Built in (150–300ms) | Custom transitions on Nonla controls |
| Removed | — | `type="dashed"`, `BlobShape`, builtin tool cards |

## Guides

| Task | Read |
|---|---|
| Change colors, brand, radius, sizes, fonts, light/dark, motion | [guides/theme.md](guides/theme.md) — Config tokens and Tailwind classes |
| Load the kit from a CDN or `<script type="module">`, host without Tailwind | [guides/remote-esm.md](guides/remote-esm.md) — `dist/` ESM, `nonla-ui.css`, import map |
| Build an agent chat, tool cards, composer menus | [guides/chat.md](guides/chat.md) — AgentPanel vs AgentChatbox, `toolUis`, `toolHooks`, triggers |

## References

One short file per docs page: what it is and its API table. Read it before using a prop not listed above.

### Components

<!-- references:components:start -->
| Reference | What it covers |
|---|---|
| [Breadcrumb](references/breadcrumb.md) | Where the page sits: muted ancestors, the current page in medium weight. |
| [Button](references/button.md) | To trigger an operation. |
| [Card](references/card.md) | Settings surface — section title, faint borders between rows, and a caption under the card. |
| [Checkbox](references/checkbox.md) | Collect the user's choices. |
| [CodeBlock](references/codeblock.md) | Syntax-highlighted snippets with copy. |
| [ColorPicker](references/color-picker.md) | Color selection — palette, hue/alpha, HEX / RGB / HSB. |
| [CommandPalette](references/command-palette.md) | ⌘K search over pages, agents, and actions. |
| [DatePicker](references/datepicker.md) | Popover + calendar — pick a date, time, or date range. |
| [Drawer](references/drawer.md) | A panel which slides in from the edge of the screen. |
| [Dropdown](references/dropdown.md) | A dropdown list. |
| [EditableInput](references/editable-input.md) | Click the pencil to edit in place. |
| [Empty](references/empty.md) | Empty state: an icon, a title, one muted line, and the action that fills the space. |
| [Form](references/form.md) | JSON-driven form (react-hook-form). |
| [Icon](references/icon.md) | The small set of glyphs the controls use. |
| [InputNumber](references/input-number.md) | Enter a number within a range with the mouse or keyboard. |
| [Input](references/input.md) | A basic widget for getting the user input. |
| [Kbd](references/kbd.md) | Key caps for shortcuts in search fields, menus, and tooltips. |
| [Logo](references/logo.md) | Nonla Agents mark. |
| [MarkdownEditor](references/markdown-editor.md) | Click từng block để sửa. |
| [MarkdownViewer](references/markdown-viewer.md) | Xem markdown đã viết. |
| [Message](references/message.md) | Display global messages as feedback in response to user operations. |
| [Modal](references/modal.md) | Display a dialog for user decisions or extra content. |
| [PageHeader](references/page-header.md) | Title row for a page: title, something beside it, a muted description, actions on the right, and a hairline underneath. |
| [Pagination](references/pagination.md) | A long list can be divided into several pages, and only one page is loaded at a time. |
| [Popconfirm](references/popconfirm.md) | A compact confirmation dialog of an action. |
| [Popover](references/popover.md) | The floating card popped by clicking or hovering. |
| [ReactCodeSandbox](references/react-code-sandbox.md) | Chạy một component React viết dạng chuỗi trong iframe sandbox. |
| [Segmented](references/segmented.md) | Display multiple options and allow users to select a single one. |
| [Select](references/select.md) | Select a value from options. |
| [Shimmer](references/shimmer.md) | Wrap live status text — Thinking, Fetching, Writing. |
| [Sidebar](references/sidebar.md) | Side nav from a flat list. |
| [Skeleton](references/skeleton.md) | Placeholder while content is loading. |
| [SortableTree](references/sortable-tree.md) | Reorder a tree. |
| [Spin](references/spin.md) | Loading indicators — brand, neutral gray, and the AI agent snake. |
| [Splitter](references/splitter.md) | Resizable split panel layout — kéo thanh giữa các vùng để đổi kích thước. |
| [Switch](references/switch.md) | Switching selector. |
| [Table](references/table.md) | Bordered card. |
| [Tabs](references/tabs.md) | Switch between views. |
| [Tag](references/tag.md) | Compact labels for status, filters, and metadata. |
| [TimePicker](references/timepicker.md) | Make-style stepper — arrows, or click hour/minute to open a grid. |
| [Tooltip](references/tooltip.md) | A simple text popup tip. |
| [Tree](references/tree.md) | Show nested data, like files, settings, or an org chart. |
| [Typography](references/typography.md) | Headings, paragraphs, and inline text. |
<!-- references:components:end -->

### Chat

<!-- references:chat:start -->
| Reference | What it covers |
|---|---|
| [AgentChatbox](references/chat-agent-chatbox.md) | Same screen as [AgentPanel](/chat/agent-panel). |
| [AgentPanel](references/chat-agent-panel.md) | Full chat. |
| [Agent message](references/chat-agent.md) | One assistant reply. |
| [Input](references/chat-input.md) | Composer at the bottom of AgentPanel and AgentChatbox. |
| [Thinking](references/chat-thinking.md) | Collapsible reasoning. |
| [Tool call](references/chat-tool.md) | Generic tool card: input, output, running, error. |
| [User message](references/chat-user.md) | One user bubble. |
| [Welcome](references/chat-welcome.md) | Empty thread inside AgentPanel and AgentChatbox: name, description, starter prompts. |
<!-- references:chat:end -->
