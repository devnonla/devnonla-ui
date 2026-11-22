---
path: "/components/tooltip"
title: "Tooltip"
group: "Data Display"
groupOrder: 6
order: 8
icon: "comment-24"
---

# Tooltip

A simple text popup tip.

```live-react
import { Button, Tooltip } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Tooltip title="Tooltip text"><Button>Hover me</Button></Tooltip>
      <Tooltip title="Bottom" placement="bottom"><Button>Bottom</Button></Tooltip>
    </>
  );
}
```

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `title` | Tip content. Empty renders only `children` | `ReactNode` | — |
| `children` | Trigger element. Must accept a ref | `ReactNode` | — |
| `placement` | Side and alignment of the tip | `PopperPlacement` | `"top"` |
| `open` | Visibility, controlled | `boolean` | — |
| `defaultOpen` | Initial visibility when uncontrolled | `boolean` | `false` |
| `onOpenChange` | Fires when the tip shows or hides | `(open: boolean) => void` | — |
| `mouseEnterDelay` | Hover delay before showing, in seconds | `number` | `0.1` |
| `arrow` | Small arrow pointing at the trigger | `boolean` | `true` |
| `getPopupContainer` | Element to portal the tip into | `() => HTMLElement` | `App` host |
| `className` | Extra class on the tip panel | `string` | — |
| `overlayClassName` | Extra class on the tip panel | `string` | — |
