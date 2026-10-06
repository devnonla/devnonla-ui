---
path: "/components/shimmer"
title: "Shimmer"
group: "Data Display"
groupOrder: 6
order: 7
icon: "sparkle-24"
---

# Shimmer

Wrap live status text — Thinking, Fetching, Writing.

```live-react
import { Shimmer } from "devnonla-ui";

export default function Demo() {
  return (
    <div className="flex flex-col items-start gap-2 text-sm font-medium text-muted-foreground">
      <Shimmer>Thinking</Shimmer>
      <Shimmer>Fetching page</Shimmer>
      <Shimmer>Writing…</Shimmer>
    </div>
  );
}
```
