---
path: "/components/popover"
title: "Popover"
group: "Data Display"
groupOrder: 6
order: 9
icon: "chat-more-24"
---

# Popover

The floating card popped by clicking or hovering.

```live-react
import { Button, Popover } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Popover title="Title" content={<div className="text-sm">Popover body</div>}>
        <Button>Open Popover</Button>
      </Popover>
      <Popover arrow title="Title" content={<div className="text-sm">With arrow</div>}>
        <Button>With arrow</Button>
      </Popover>
    </>
  );
}
```

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `content` | Panel body. | `ReactNode` | — |
| `title` | Bold line above the content. | `ReactNode` | — |
| `children` | Trigger element. It must accept a ref. | `ReactNode` | — |
| `trigger` | Opens on click or on hover. | `"click" \| "hover"` | `"click"` |
| `placement` | Side and alignment of the panel, such as `topLeft`. | `"top" \| "bottom" \| "left" \| "right" \| "topLeft" \| …` | `"bottom"` |
| `open` | Controls visibility. | `boolean` | — |
| `defaultOpen` | Initial visibility when uncontrolled. | `boolean` | `false` |
| `arrow` | Shows an arrow pointing at the trigger. | `boolean \| { pointAtCenter?: boolean }` | `false` |
| `onOpenChange` | Called when the panel opens or closes. | `(open: boolean) => void` | — |
| `mouseEnterDelay` | Seconds before a hover opens the panel. | `number` | `0.1` |
| `mouseLeaveDelay` | Seconds before leaving closes the panel. | `number` | `0.1` |
| `getPopupContainer` | Returns the element the panel mounts into. | `() => HTMLElement` | — |
| `className` | Extra class on the panel. | `string` | — |
| `overlayClassName` | Same as `className`. | `string` | — |
| `contentClassName` | Extra class on the panel, for padding or width. | `string` | — |
| `style` | Inline style on the panel. | `CSSProperties` | — |
| `styles` | Inline styles on the panel. `root`, `body`, `content` and `container` all apply there. | `{ root?, body?, content?, container?: CSSProperties }` | — |
