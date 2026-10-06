---
path: "/components/pagination"
title: "Pagination"
group: "Navigation"
groupOrder: 8
order: 2
icon: "data-bar-vertical-ascending-24"
---

# Pagination

A long list can be divided into several pages, and only one page is loaded at a time.

```live-react
import { useState } from "react";
import { Pagination } from "devnonla-ui";

export default function Demo() {
  const [current, setCurrent] = useState(3);
  return <Pagination current={current} total={50} onChange={setCurrent} />;
}
```
