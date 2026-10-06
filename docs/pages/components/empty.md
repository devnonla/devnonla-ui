---
path: "/components/empty"
title: "Empty"
group: "Data Display"
groupOrder: 6
order: 4
icon: "image-off-24"
---

# Empty

Empty state — logo mark and a description.

```live-react
import { Button, Empty } from "devnonla-ui";

export default function Demo() {
  return (
    <Empty description="No projects yet">
      <Button type="primary" size="small">Create project</Button>
    </Empty>
  );
}
```
