---
path: "/desktop"
title: "Desktop"
group: "Get started"
groupOrder: 1
order: 5
icon: "content-view-24"
---

# Desktop

A window that opens from a button and shrinks back to it. Drag the title bar, resize from the edges, or double-click the title to fill the frame.

```live-react
import { useRef, useState } from "react";
import { Button, DesktopWindow } from "devnonla-ui";

export default function Demo() {
  const origin = useRef(null);
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative h-[32rem] w-full overflow-hidden rounded-lg border border-border">
      <div className="flex h-10 items-center px-3">
        <span ref={origin}>
          <Button type="primary" disabled={open} onClick={() => setOpen(true)}>
            Open window
          </Button>
        </span>
      </div>
      {open ? (
        <DesktopWindow
          title="Notes"
          origin={origin}
          expanded={expanded}
          persistKey={false}
          onClose={() => {
            setOpen(false);
            setExpanded(false);
          }}
          onToggleExpand={() => setExpanded((value) => !value)}
        >
          <p className="m-0 p-4 text-sm text-muted-foreground">Drag the title bar. Resize from the edges. Double-click the title to expand.</p>
        </DesktopWindow>
      ) : null}
    </div>
  );
}
```

`origin` is the element the window zooms from. Without it, the window uses the active desktop icon.
