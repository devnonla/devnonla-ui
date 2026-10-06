---
path: "/components/segmented"
title: "Segmented"
group: "Data Display"
groupOrder: 6
order: 5
icon: "apps-list-24"
---

# Segmented

Display multiple options and allow users to select a single one.

```live-react
import { useState } from "react";
import { Segmented } from "devnonla-ui";

export default function Demo() {
  const [value, setValue] = useState("day");
  return <Segmented options={["day", "week", "month"]} value={value} onChange={setValue} />;
}
```
