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

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `value` | 24h string (`HH:mm` / `HH:mm:ss`), or a Date's time of day | `string \| Date \| null` | — |
| `defaultValue` | Initial time when uncontrolled | `string \| Date \| null` | — |
| `onChange` | Gets the 24h string in `format`, or `null` when cleared | `(time: string \| null, parts) => void` | — |
| `format` | `HH:mm:ss` shows a seconds column | `"HH:mm" \| "HH:mm:ss"` | `"HH:mm"` |
| `use12Hours` | Shows hours as 1 to 12 with AM/PM | `boolean` | `false` |
| `hourStep` | Hour increment for arrows and the grid | `number` | `1` |
| `minuteStep` | Minute increment for arrows and the grid | `number` | `1` |
| `secondStep` | Second increment for arrows and the grid | `number` | `1` |
| `placeholder` | Text shown when empty | `string` | `"Select time"` |
| `allowClear` | Shows a clear button when a time is set | `boolean` | `true` |
| `disabled` | Blocks input and the popup | `boolean` | `false` |
| `size` | Field height. Falls back to the `App` size | `"small" \| "default" \| "large"` | `"default"` |
| `status` | Validation border color | `"error" \| "warning"` | — |
| `placement` | Popup side and alignment | `PopperPlacement` | `"right"` |
| `onFocus` | Input focus handler | `(e: FocusEvent) => void` | — |
| `onBlur` | Input blur handler | `(e: FocusEvent) => void` | — |
| `id` | Input `id` | `string` | — |
| `name` | Input `name` | `string` | — |
| `autoFocus` | Focuses the input on mount | `boolean` | `false` |
| `className` | Extra class on the field | `string` | — |
| `style` | Inline style on the field | `CSSProperties` | — |
| `popupClassName` | Extra class on the popup | `string` | — |
