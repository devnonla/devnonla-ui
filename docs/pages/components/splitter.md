---
path: "/components/splitter"
title: "Splitter"
group: "Layout"
groupOrder: 4
order: 1
icon: "content-view-24"
---

# Splitter

Resizable split panel layout — kéo thanh giữa các vùng để đổi kích thước.

```live-react
import { Splitter } from "devnonla-ui";

function Pane({ title }) {
  return <div className="flex h-full min-h-20 items-center justify-center bg-muted/50 text-sm text-muted-foreground">{title}</div>;
}

export default function Demo() {
  return (
    <div className="h-52 w-full overflow-hidden rounded-lg border border-border">
      <Splitter>
        <Splitter.Panel defaultSize="40%" min="20%"><Pane title="First" /></Splitter.Panel>
        <Splitter.Panel min="20%"><Pane title="Second" /></Splitter.Panel>
      </Splitter>
    </div>
  );
}
```
