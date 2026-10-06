---
path: "/components/timepicker"
title: "TimePicker"
group: "Data Entry"
groupOrder: 5
order: 8
icon: "clock-24"
---

# TimePicker

Make-style stepper — arrows, or click hour/minute to open a grid.

```live-react
import { useState } from "react";
import { TimePicker } from "devnonla-ui";

export default function Demo() {
  const [value, setValue] = useState("09:00");
  return (
    <div className="grid w-full max-w-xs gap-3">
      <TimePicker value={value} onChange={(next) => setValue(next ?? "")} />
      <TimePicker use12Hours placeholder="12-hour" />
      <TimePicker minuteStep={5} placeholder="5-minute steps" />
    </div>
  );
}
```
