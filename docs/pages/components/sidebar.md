---
path: "/components/sidebar"
title: "Sidebar"
group: "Layout"
groupOrder: 4
order: 2
icon: "apps-list-detail-24"
---

# Sidebar

Side nav from a flat list. A row with `type: "group"` is a section label. Routing stays in the app.

```live-react
import { useState } from "react";
import { Icon, Sidebar } from "devnonla-ui";

const items = [
  { type: "group", key: "start", label: "Get started" },
  { key: "intro", label: "Introduction", icon: <Icon name="stars" size={16} /> },
  { key: "install", label: "Installation", icon: <Icon name="code" size={16} /> },
  { type: "divider" },
  { key: "settings", label: "Settings", icon: <Icon name="pen" size={16} /> },
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
