---
path: "/components/switch"
title: "Switch"
group: "Data Entry"
groupOrder: 5
order: 10
icon: "fast-forward-circle-24"
---

# Switch

Switching selector.

```live-react
import { Switch } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Switch defaultChecked />
      <Switch />
      <Switch disabled />
      <Switch variant="square" defaultChecked />
      <Switch color="success" defaultChecked />
      <Switch size="small" defaultChecked />
      <Switch size="large" defaultChecked />
    </>
  );
}
```

## API

Other Radix Switch props pass through.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `checked` | Checked state. Pair it with `onChange` | `boolean` | — |
| `defaultChecked` | Initial checked state when uncontrolled | `boolean` | `false` |
| `onChange` | Gets the next checked value, not a DOM event | `(checked: boolean) => void` | — |
| `disabled` | Blocks toggling and dims the switch | `boolean` | `false` |
| `size` | Track size. Falls back to the `App` size | `"small" \| "default" \| "large"` | `"default"` |
| `variant` | Track shape. `square` uses small rounded corners | `"default" \| "square"` | `"default"` |
| `color` | Checked track color. `white` is for dark surfaces | `"default" \| "brand" \| "success" \| "white"` | `"default"` |
| `className` | Extra class on the track | `string` | — |
| `style` | Inline style on the track | `CSSProperties` | — |
