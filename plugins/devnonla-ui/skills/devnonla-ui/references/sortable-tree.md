<!-- Generated from docs/pages/components/sortable-tree.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/sortable-tree -->

# SortableTree

Reorder a tree. Drag a row to move it among its siblings. Drag a child up onto a parent row to lift it to that level and set it down between parents. Drag a parent to move that whole group, children included. While the row is in the air, the list keeps an empty slot the size of what you picked up.

## API

### SortableTree

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `items` | Tree to show. Ids must be unique across the tree. | `TreeItem[]` | — |
| `onChange` | Called with the next tree after a drop that changed order. | `(items: TreeItem[]) => void` | — |
| `onDragEnd` | Called with the rows whose index changed. Rows that stayed put are omitted. | `(updates: { id: string; index: number }[]) => void` | — |
| `renderItem` | Custom row content. Defaults to `label`, then `id`. | `(item: TreeItem) => ReactNode` | — |
| `className` | Extra class on the root. | `string` | — |

### TreeItem

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `id` | Unique id across the tree. | `string` | — |
| `label` | Row text. Falls back to `id`. | `ReactNode` | — |
| `children` | Nested rows. | `TreeItem[]` | — |
| `disabled` | The row cannot be dragged. | `boolean` | — |
| `data` | Your own payload, passed back through `renderItem` and `onChange`. | `T` | — |
