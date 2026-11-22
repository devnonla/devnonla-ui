---
path: "/components/checkbox"
title: "Checkbox"
group: "Data Entry"
groupOrder: 5
order: 11
icon: "checkbox-24"
---

# Checkbox

Collect the user's choices.

```live-react
import { Checkbox } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox>Unchecked</Checkbox>
      <Checkbox indeterminate>Indeterminate</Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox color="success" defaultChecked>Success</Checkbox>
    </>
  );
}
```

## API

Other Radix Checkbox props pass through.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `checked` | Checked state, for a controlled checkbox | `boolean` \| `indeterminate` | — |
| `defaultChecked` | Initial checked state, for an uncontrolled checkbox | `boolean` | — |
| `indeterminate` | Shows the mixed state. Wins over `checked`. | `boolean` | `false` |
| `onChange` | Receives the next checked boolean, not a DOM event | `(checked: boolean) => void` | — |
| `disabled` | Blocks clicks and dims the checkbox | `boolean` | `false` |
| `children` | Label next to the box | `ReactNode` | — |
| `color` | Checked fill. `white` is for dark surfaces. | `default` \| `brand` \| `success` \| `white` | `default` |
| `className` | Extra class on the box | `string` | — |
