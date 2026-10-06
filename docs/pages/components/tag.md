---
path: "/components/tag"
title: "Tag"
group: "Data Display"
groupOrder: 6
order: 2
icon: "bookmark-24"
---

# Tag

Compact labels for status, filters, and metadata.

```live-react
import { Tag } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Tag>draft</Tag>
      <Tag color="success">active</Tag>
      <Tag color="warning">pending</Tag>
      <Tag color="error">failed</Tag>
      <Tag color="processing">running</Tag>
      <Tag color="brand">pro</Tag>
      <Tag variant="solid" color="brand">solid</Tag>
      <Tag closable>removable</Tag>
    </>
  );
}
```
