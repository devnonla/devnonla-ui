---
path: "/components/icon"
title: "Icon"
group: "General"
groupOrder: 3
order: 5
icon: "sparkle-24"
---

# Icon

The small set of glyphs the controls use. Color follows `currentColor`.

```live-react
import { Icon } from "devnonla-ui";

const NAMES = [
  "add",
  "arrow-down",
  "arrow-left",
  "arrow-right",
  "arrow-up",
  "book",
  "check",
  "chevrons-left",
  "chevrons-right",
  "clock",
  "close",
  "code",
  "copy",
  "dialog",
  "document",
  "download",
  "eraser",
  "error",
  "eye",
  "globe",
  "maximize",
  "minimize",
  "monitor",
  "moon",
  "pen",
  "shield-check",
  "stars",
  "stop",
  "sun",
  "transfer",
];

export default function Demo() {
  return (
    <div className="flex w-full flex-wrap justify-center gap-4">
      {NAMES.map((name) => (
        <div key={name} className="flex w-24 flex-col items-center gap-2">
          <Icon name={name} size={20} />
          <span className="text-center text-[11px] leading-tight text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  );
}
```

## Size

`size` is the box in px. The default is `16`.

```live-react
import { Icon } from "devnonla-ui";

export default function Demo() {
  return (
    <div className="flex items-end gap-6">
      {[12, 16, 24, 32].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon name="stars" size={size} />
          <span className="text-xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  );
}
```

## API

Pass `className` to set the color, for example `text-brand`.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `name` | Glyph id. | `add` \| `arrow-down` \| `arrow-left` \| `arrow-right` \| `arrow-up` \| `book` \| `check` \| `chevrons-left` \| `chevrons-right` \| `clock` \| `close` \| `code` \| `copy` \| `dialog` \| `document` \| `download` \| `eraser` \| `error` \| `eye` \| `globe` \| `maximize` \| `minimize` \| `monitor` \| `moon` \| `pen` \| `shield-check` \| `stars` \| `stop` \| `sun` \| `transfer` | — |
| `size` | Width and height in px. | `number` | `16` |
| `className` | Extra class on the icon. Use it for color. | `string` | — |
