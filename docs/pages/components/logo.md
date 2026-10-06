---
path: "/components/logo"
title: "Logo"
group: "General"
groupOrder: 3
order: 2
icon: "gallery-24"
---

# Logo

Nonla Agents mark. Icon, wordmark, or both.

```live-react
import { Logo } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <Logo variant="icon" />
      <Logo variant="text" />
      <Logo variant="full" />
      <Logo size={24} />
      <Logo size={40} color="#f18d00" />
      <Logo size={64} color="#3fa266" />
    </>
  );
}
```

## API

`variant` picks the mark, the wordmark, or both. `size` is the icon height in px. Omit `color` to keep the mascot palette.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `variant` | `icon` is the mark. `text` is the wordmark. `full` is both. | `icon` \| `text` \| `full` | `full` |
| `size` | Icon height in px. Width follows the mark's aspect ratio. | `number` | `32` |
| `color` | Fill for the mark and wordmark. Eyes and the smile stay. | `string` | `-` |
| `className` | Extra class on the root. | `string` | `-` |
| `style` | Inline style on the root. | `CSSProperties` | `-` |
