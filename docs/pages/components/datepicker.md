---
path: "/components/datepicker"
title: "DatePicker"
group: "Data Entry"
groupOrder: 5
order: 7
icon: "calendar-24"
---

# DatePicker

Popover + calendar — pick a date, time, or date range.

```live-react
import { DatePicker } from "devnonla-ui";

export default function Demo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <DatePicker placeholder="Pick a date" />
      <DatePicker showTime placeholder="Pick date & time" />
      <DatePicker.RangePicker />
    </div>
  );
}
```
