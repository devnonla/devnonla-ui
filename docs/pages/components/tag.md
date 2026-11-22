---
path: "/components/tag"
title: "Tag"
group: "Data Display"
groupOrder: 6
order: 2
icon: "bookmark-24"
---

# Tag

Compact labels for status, filters, and metadata.

```live-react
import { Tag } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Tag>draft</Tag>
      <Tag color="success">active</Tag>
      <Tag color="warning">pending</Tag>
      <Tag color="error">failed</Tag>
      <Tag color="processing">running</Tag>
      <Tag color="brand">pro</Tag>
      <Tag variant="solid" color="brand">solid</Tag>
      <Tag closable>removable</Tag>
    </>
  );
}
```

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `children` | Label | `ReactNode` | — |
| `color` | Status (`success`, `error`, `warning`, `processing`, `brand`), preset name, or any CSS color | `string` | `"default"` |
| `variant` | `soft` is a quiet wash. `solid` is a saturated chip | `"soft" \| "solid"` | `"soft"` |
| `dot` | Leading dot. On for soft colored tags; `false` hides, `true` forces | `boolean` | — |
| `closable` | Shows a remove button | `boolean` | `false` |
| `onClose` | Fires when the remove button is clicked | `() => void` | — |
| `className` | Extra class on the tag | `string` | — |
