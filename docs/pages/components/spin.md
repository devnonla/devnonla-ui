---
path: "/components/spin"
title: "Spin"
group: "Feedback"
groupOrder: 7
order: 6
icon: "arrow-sync-24"
---

# Spin

Loading indicators — brand, neutral gray, and the AI agent snake.

```live-react
import { Spin } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Spin tip="Loading…" />
      <Spin color="neutral" tip="Neutral…" />
      <Spin variant="agent" tip="Agent working…" />
    </>
  );
}
```

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `spinning` | Shows the indicator. | `boolean` | `true` |
| `tip` | Text under the indicator. | `ReactNode` | — |
| `size` | Indicator size. | `"small" \| "default" \| "large"` | — |
| `variant` | Visual style. `agent` is the 3×3 snake for AI run states. | `"default" \| "agent"` | `"default"` |
| `color` | Indicator hue. `neutral` stays gray in light and dark. | `"brand" \| "neutral"` | `"brand"` |
| `indicator` | Replaces the built-in indicator. | `ReactNode` | — |
| `children` | Content covered by a dimmed overlay while spinning. | `ReactNode` | — |
| `className` | Extra class on the root. | `string` | — |
