---
path: "/components/drawer"
title: "Drawer"
group: "Feedback"
groupOrder: 7
order: 3
icon: "library-24"
---

# Drawer

A panel which slides in from the edge of the screen.

```live-react
import { useState } from "react";
import { Button, Drawer } from "devnonla-ui";

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer open={open} title="Example drawer" onClose={() => setOpen(false)} size={420}>
        <p className="m-0 text-sm text-muted-foreground">Drawer body content.</p>
      </Drawer>
    </>
  );
}
```
