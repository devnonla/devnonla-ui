---
path: "/components/select"
title: "Select"
group: "Data Entry"
groupOrder: 5
order: 6
icon: "options-24"
---

# Select

Select a value from options.

```live-react
import { Select } from "devnonla-ui";

const roles = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
];

export default function Demo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Select placeholder="Pick a role" options={roles} />
      <Select defaultValue="admin" options={roles} allowClear />
      <Select status="error" placeholder="Error" options={roles} />
    </div>
  );
}
```
