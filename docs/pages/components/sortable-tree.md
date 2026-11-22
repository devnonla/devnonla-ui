---
path: "/components/sortable-tree"
title: "SortableTree"
group: "Layout"
groupOrder: 4
order: 3
icon: "list-bar-24"
---

# SortableTree

Reorder a tree. Drag a row to move it among its siblings. Drag a child up onto a parent row to lift it to that level and set it down between parents. Drag a parent to move that whole group, children included. While the row is in the air, the list keeps an empty slot the size of what you picked up.

`onChange` receives the next tree. `onDragEnd` receives the rows that need a new position: `{ id, index }[]`. `index` is the new index in the list that row landed in. Rows that did not move are left out of that list.

Ids are unique across the tree.

```live-react
import { useState } from "react";
import { SortableTree } from "devnonla-ui";

const seed = [
  {
    id: "design",
    label: "Design",
    children: [
      { id: "color", label: "Color" },
      { id: "type", label: "Type" },
      { id: "space", label: "Spacing" },
    ],
  },
  {
    id: "build",
    label: "Build",
    children: [
      { id: "api", label: "API" },
      { id: "ui", label: "UI kit" },
    ],
  },
  {
    id: "ship",
    label: "Ship",
    children: [
      { id: "docs", label: "Docs" },
      { id: "release", label: "Release" },
    ],
  },
];

export default function Demo() {
  const [items, setItems] = useState(seed);
  return (
    <div className="w-full max-w-80 overflow-x-auto rounded-lg border border-border bg-card p-1.5">
      <SortableTree items={items} onChange={(next) => setItems(next)} />
    </div>
  );
}
```

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
