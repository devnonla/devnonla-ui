---
path: "/components/skeleton"
title: "Skeleton"
group: "Data Display"
groupOrder: 6
order: 6
icon: "content-view-24"
---

# Skeleton

Placeholder while content is loading.

```live-react
import { Skeleton } from "devnonla-ui";

export default function Demo() {
  return <Skeleton active className="w-full max-w-md" />;
}
```

## API

### Skeleton

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `loading` | Shows the placeholder. `false` renders `children` instead. | `boolean` | `true` |
| `active` | Pulses the placeholder. | `boolean` | `true` |
| `title` | Shows a title bar. | `boolean` | `true` |
| `paragraph` | Shows text lines. `{ rows }` sets how many (3 by default). | `boolean \| { rows?: number }` | `true` |
| `avatar` | Shows a round avatar on the left. | `boolean` | — |
| `children` | Real content, shown once `loading` is `false`. | `ReactNode` | — |
| `className` | Extra class on the root. | `string` | — |

### Skeleton.Input

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `active` | Pulses the placeholder. | `boolean` | `true` |
| `block` | Stretches to the full width of the parent. | `boolean` | — |
| `className` | Extra class on the bar. | `string` | — |
| `style` | Inline style on the bar. | `CSSProperties` | — |
