---
path: "/components/drawer"
title: "Drawer"
group: "Feedback"
groupOrder: 7
order: 4
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

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `open` | Whether the drawer is shown | `boolean` | `false` |
| `title` | Header title | `ReactNode` | — |
| `children` | Drawer body | `ReactNode` | — |
| `footer` | Content in a bar under the body | `ReactNode` | — |
| `extra` | Actions in the header, before the close button | `ReactNode` | — |
| `placement` | Edge the drawer slides in from | `right` \| `left` \| `top` \| `bottom` | `right` |
| `size` | Width for `left`/`right`, height for `top`/`bottom` | `number` \| `string` | `378` |
| `closable` | Show the close button in the header | `boolean` | `true` |
| `destroyOnHidden` | Unmount the body after the drawer closes | `boolean` | `false` |
| `onClose` | Fires when the drawer asks to close | `() => void` | — |
| `onOpenChange` | Fires with the next open state | `(open: boolean) => void` | — |
| `className` | Extra class on the panel | `string` | — |
| `styles` | Inline styles for `content`, `header`, `body` and `footer` | `{ content?, header?, body?, footer?: CSSProperties }` | — |
