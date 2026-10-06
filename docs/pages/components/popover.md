---
path: "/components/popover"
title: "Popover"
group: "Data Display"
groupOrder: 6
order: 9
icon: "chat-more-24"
---

# Popover

The floating card popped by clicking or hovering.

```live-react
import { Button, Popover } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Popover title="Title" content={<div className="text-sm">Popover body</div>}>
        <Button>Open Popover</Button>
      </Popover>
      <Popover arrow title="Title" content={<div className="text-sm">With arrow</div>}>
        <Button>With arrow</Button>
      </Popover>
    </>
  );
}
```
