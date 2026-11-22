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

## API

### Segmented

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `options` | Choices, as plain strings or numbers or as option objects. | `(string \| number \| Option)[]` | — |
| `value` | Selected value, controlled. | `string \| number` | — |
| `defaultValue` | Initial value when uncontrolled. Falls back to the first option. | `string \| number` | — |
| `onChange` | Called with the clicked option's value. | `(value) => void` | — |
| `size` | Control height. | `"small" \| "default" \| "large"` | — |
| `block` | Stretches to the parent's width with equal segments. | `boolean` | — |
| `disabled` | Disables every option. | `boolean` | — |
| `className` | Extra class on the root. | `string` | — |

### Option

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `label` | Segment text. | `ReactNode` | — |
| `value` | Value passed to `onChange`. | `string \| number` | — |
| `icon` | Icon shown before the label. | `ReactNode` | — |
| `disabled` | Disables this segment. | `boolean` | — |
