---
path: "/components/input"
title: "Input"
group: "Data Entry"
groupOrder: 5
order: 1
icon: "text-edit-style-24"
---

# Input

A basic widget for getting the user input.

```live-react
import { Icon, Input } from "devnonla-ui";

export default function Demo() {
  return (
    <div className="grid w-full max-w-xl gap-3">
      <Input size="small" placeholder="Small" />
      <Input placeholder="Default" />
      <Input size="large" placeholder="Large" />
      <Input status="error" defaultValue="Invalid" />
      <Input prefix={<Icon name="pen" size={14} />} placeholder="With prefix" allowClear />
      <Input.Password placeholder="Password" />
      <Input.TextArea placeholder="Multi-line notes…" rows={3} />
    </div>
  );
}
```
