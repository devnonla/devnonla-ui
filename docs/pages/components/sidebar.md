---
path: "/components/sidebar"
title: "Sidebar"
group: "Layout"
groupOrder: 4
order: 2
icon: "apps-list-detail-24"
---

# Sidebar

Grouped side nav from JSON — groups, child items, optional search. Routing stays in the app.

```live-react
import { useState } from "react";
import { Sidebar } from "devnonla-ui";

const items = [
  {
    type: "group",
    key: "start",
    label: "Get started",
    children: [
      { key: "intro", label: "Introduction", icon: "apps-24" },
      { key: "install", label: "Installation", icon: "code-24" },
    ],
  },
  { type: "divider" },
  { key: "settings", label: "Settings", icon: "settings-24" },
];

export default function Demo() {
  const [selected, setSelected] = useState("intro");
  return (
    <div className="h-80 w-52 overflow-hidden rounded-lg border border-border bg-card">
      <Sidebar items={items} selectedKey={selected} searchable searchPlaceholder="Search" onSelect={({ key }) => setSelected(key)} />
    </div>
  );
}
```
