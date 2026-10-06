---
path: "/components/tooltip"
title: "Tooltip"
group: "Data Display"
groupOrder: 6
order: 8
icon: "comment-24"
---

# Tooltip

A simple text popup tip.

```live-react
import { Button, Tooltip } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Tooltip title="Tooltip text"><Button>Hover me</Button></Tooltip>
      <Tooltip title="Bottom" placement="bottom"><Button>Bottom</Button></Tooltip>
    </>
  );
}
```
