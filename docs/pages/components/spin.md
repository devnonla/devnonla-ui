---
path: "/components/spin"
title: "Spin"
group: "Feedback"
groupOrder: 7
order: 6
icon: "arrow-sync-24"
---

# Spin

Loading indicators — brand, neutral gray, and the AI agent snake.

```live-react
import { Spin } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Spin tip="Loading…" />
      <Spin color="neutral" tip="Neutral…" />
      <Spin variant="agent" tip="Agent working…" />
    </>
  );
}
```
