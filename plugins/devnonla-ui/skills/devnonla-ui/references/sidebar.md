<!-- Generated from docs/pages/components/sidebar.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/sidebar -->

# Sidebar

Side nav from a flat list. A row with `type: "group"` is a section label. `description` adds a muted second line under a row (context, owner). Routing stays in the app.

## API

### Sidebar

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `items` | Rows, group labels and dividers, in order. | `SidebarItem[]` | `[]` |
| `selectedKey` | Key of the active row, controlled. | `string` | — |
| `defaultSelectedKey` | Initial active row when uncontrolled. | `string` | — |
| `onSelect` | Called with `{ key, item }` when a row is clicked. | `({ key, item }) => void` | — |
| `searchable` | Shows a search box that filters rows by label and description. | `boolean` | `false` |
| `searchPlaceholder` | Search box placeholder. | `string` | `"Search…"` |
| `header` | Content above the search box and the list. | `ReactNode` | — |
| `footer` | Content below the list. | `ReactNode` | — |
| `emptyText` | Shown when the search matches nothing. | `ReactNode` | `"No matches."` |
| `className` | Extra class on the root. | `string` | — |
| `aria-label` | Accessible name of the nav. | `string` | `"Sidebar"` |

### Item

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `key` | Unique id used for selection. Falls back to an index-based key. | `string` | — |
| `label` | Row text. Search only matches string labels. | `ReactNode` | — |
| `description` | Muted second line under the label. The row grows to two lines. | `ReactNode` | — |
| `icon` | An `Icon` name, or a node. | `ReactNode` | — |
| `type` | `"group"` is a section label. `"divider"` is a rule. Anything else is a row. | `"item" \| "group" \| "divider"` | — |
| `href` | Renders the row as a link. `onSelect` takes over plain clicks. | `string` | — |
| `extra` | Trailing content, such as a count. | `ReactNode` | — |
| `disabled` | Dims the row and blocks clicks. | `boolean` | — |
| `className` | Extra class on the row. | `string` | — |
