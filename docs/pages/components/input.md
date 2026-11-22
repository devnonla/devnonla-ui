---
path: "/components/input"
title: "Input"
group: "Data Entry"
groupOrder: 5
order: 1
icon: "text-edit-style-24"
---

# Input

A basic widget for getting the user input.

```live-react
import { Icon, Input } from "devnonla-ui";

export default function Demo() {
  return (
    <div className="grid w-full max-w-xl gap-3">
      <Input size="small" placeholder="Small" />
      <Input placeholder="Default" />
      <Input size="large" placeholder="Large" />
      <Input status="error" defaultValue="Invalid" />
      <Input prefix={<Icon name="pen" size={14} />} placeholder="With prefix" allowClear />
      <Input.Password placeholder="Password" />
      <Input.TextArea placeholder="Multi-line notes…" rows={3} />
    </div>
  );
}
```

## API

### Input

Other native `input` props pass through.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `value` | Current text, for a controlled input | `string` | — |
| `defaultValue` | Initial text, for an uncontrolled input | `string` | — |
| `onChange` | Native change handler | `(e: ChangeEvent) => void` | — |
| `placeholder` | Text shown when empty | `string` | — |
| `size` | Control height | `small` \| `default` \| `large` | `default` |
| `status` | Validation outline | `error` \| `warning` | — |
| `variant` | Field surface | `outlined` \| `borderless` \| `filled` | `outlined` |
| `prefix` | Content before the text, such as an icon | `ReactNode` | — |
| `suffix` | Content after the text | `ReactNode` | — |
| `allowClear` | Show a clear button while the field has text | `boolean` | `false` |
| `disabled` | Blocks typing | `boolean` | `false` |
| `onPressEnter` | Fires on Enter, ignored while composing | `(e: KeyboardEvent) => void` | — |

### Input.Password

Takes every `Input` prop.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `visibilityToggle` | Eye button that shows the password. Pass `{ visible, onVisibleChange }` to control it. | `boolean` \| `{ visible?, onVisibleChange? }` | `true` |

### Input.TextArea

Other native `textarea` props pass through.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `rows` | Visible text lines | `number` | — |
| `autoSize` | Grow with the content, optionally between row limits | `boolean` \| `{ minRows?: number; maxRows?: number }` | `false` |
| `size` | Line height and minimum height | `small` \| `default` \| `large` | `default` |
| `status` | Validation outline | `error` \| `warning` | — |
| `variant` | Field surface | `outlined` \| `borderless` \| `filled` | `outlined` |
