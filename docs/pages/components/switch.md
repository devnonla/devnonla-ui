---
path: "/components/switch"
title: "Switch"
group: "Data Entry"
groupOrder: 5
order: 10
icon: "fast-forward-circle-24"
---

# Switch

Switching selector.

```live-react
import { Switch } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Switch defaultChecked />
      <Switch />
      <Switch disabled />
      <Switch variant="square" defaultChecked />
      <Switch color="success" defaultChecked />
      <Switch size="small" defaultChecked />
      <Switch size="large" defaultChecked />
    </>
  );
}
```
