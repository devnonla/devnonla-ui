---
path: "/components/input-number"
title: "InputNumber"
group: "Data Entry"
groupOrder: 5
order: 5
icon: "number-symbol-square-24"
---

# InputNumber

Enter a number within a range with the mouse or keyboard.

```live-react
import { InputNumber } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <InputNumber min={0} max={100} step={5} defaultValue={25} />
      <InputNumber min={0} max={10} step={0.1} precision={1} defaultValue={1.5} />
      <InputNumber controls={false} defaultValue={42} />
      <InputNumber disabled defaultValue={7} />
    </>
  );
}
```

## API

Other native `input` props pass through.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `value` | Current number, for a controlled input | `number` \| `null` | — |
| `defaultValue` | Initial number, for an uncontrolled input | `number` | — |
| `onChange` | Fires with the parsed number, or `null` when empty | `(value: number \| null) => void` | — |
| `onPressEnter` | Fires on Enter, ignored while composing | `(e: KeyboardEvent) => void` | — |
| `min` | Lowest allowed value | `number` | — |
| `max` | Highest allowed value | `number` | — |
| `step` | Amount added by the arrows and arrow keys | `number` | `1` |
| `precision` | Decimal places to round to. Omit to keep free typing. | `number` | — |
| `controls` | Show the up and down buttons | `boolean` | `true` |
| `size` | Control height | `small` \| `default` \| `large` | `default` |
| `status` | Validation outline | `error` \| `warning` | — |
| `disabled` | Blocks typing and stepping | `boolean` | `false` |
| `placeholder` | Text shown when empty | `string` | — |
| `formatter` | Turns the value into display text | `(value: number \| string \| undefined) => string` | — |
| `parser` | Turns typed text back into a number | `(displayValue: string) => number` | — |
| `className` | Extra class on the wrapper | `string` | — |
| `style` | Inline style on the wrapper | `CSSProperties` | — |
