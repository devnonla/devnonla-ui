---
path: "/components/button"
title: "Button"
group: "General"
groupOrder: 3
order: 1
icon: "apps-24"
---

# Button

To trigger an operation.

## Type

```live-react
import { Button } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Button type="primary">Primary</Button>
      <Button type="default">Default</Button>
      <Button type="text">Text</Button>
      <Button type="link">Link</Button>
    </>
  );
}
```

## Icon

`type="icon"` is a square button with only a glyph, quiet like `text` until hover. Pass the glyph as `icon` or as children, and always an `aria-label`. It follows `size` (24, 32, 40px) with a toolbar-sized glyph (16, 20, 24px).

```live-react
import { Button, Icon, Tooltip } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Button type="icon" aria-label="Back"><Icon name="arrow-back" /></Button>
      <Button type="icon" aria-label="Forward"><Icon name="arrow-forward" /></Button>
      <Button type="icon" aria-label="Refresh"><Icon name="refresh" /></Button>
      <Tooltip title="Copy">
        <Button type="icon" icon={<Icon name="copy" />} aria-label="Copy" />
      </Tooltip>
      <Button type="icon" aria-label="More"><Icon name="more" /></Button>
      <Button type="icon" size="small" aria-label="Close"><Icon name="close" /></Button>
      <Button type="icon" size="large" aria-label="Settings"><Icon name="panel" /></Button>
      <Button type="icon" danger aria-label="Delete"><Icon name="trash" /></Button>
    </>
  );
}
```

## Size

```live-react
import { Button } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Button type="primary" size="small">Small</Button>
      <Button type="primary">Default</Button>
      <Button type="primary" size="large">Large</Button>
    </>
  );
}
```

## Danger / loading

```live-react
import { Button } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Button type="primary" danger>Danger</Button>
      <Button type="primary" loading>Loading</Button>
      <Button disabled>Disabled</Button>
    </>
  );
}
```

## Custom

`variant="nostyle"` drops the theme paint, height, padding, and radius. `className` and `style` are the look.

```live-react
import { Button } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Button type="primary">Primary</Button>
      <Button variant="nostyle" className="rounded-full bg-[#6E56F0] px-4 py-2 text-[14px] text-white">
        Custom
      </Button>
    </>
  );
}
```

## API

`type` sets the look. Pass `color` and `variant` together to override it. `nostyle` leaves the paint to `className` and `style`.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `type` | Visual style. `icon` is a square, icon-only button. | `default` \| `primary` \| `text` \| `icon` \| `link` | `default` |
| `size` | Control height. `middle` and `medium` match `default`. `xs` matches `small`. | `small` \| `default` \| `large` | `default` |
| `danger` | Use the danger color. | `boolean` | `false` |
| `loading` | Shows a spinner and blocks clicks. Pass `{ delay, icon }` to wait or replace the spinner. | `boolean` \| `{ delay?: number; icon?: ReactNode }` | `false` |
| `disabled` | Blocks clicks. | `boolean` | `false` |
| `icon` | Icon shown with the label. | `ReactNode` | — |
| `iconPlacement` | Which side the icon sits on. `iconPosition` is the same prop. | `start` \| `end` | `start` |
| `shape` | Corner shape. `circle` and `round` are fully rounded. | `default` \| `circle` \| `round` \| `square` | `default` |
| `color` | Theme color name, such as `primary` or `blue`. Pair it with `variant`. | `string` | — |
| `variant` | Fill style. `nostyle` drops the theme paint. | `outlined` \| `solid` \| `filled` \| `text` \| `icon` \| `link` \| `nostyle` | — |
| `ghost` | Transparent background, except on `text` and `link`. | `boolean` | `false` |
| `block` | Stretch to the full width of the parent. | `boolean` | `false` |
| `href` | Renders an anchor instead of a button. | `string` | — |
| `htmlType` | Native button type. | `button` \| `submit` \| `reset` | `button` |

### Button.Group

Shares one `size` with every button inside.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `size` | Size for every button in the group. A button's own `size` wins. | `small` \| `default` \| `large` | — |
| `className` | Extra class on the group. | `string` | — |
| `style` | Inline style on the group. | `CSSProperties` | — |
