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
