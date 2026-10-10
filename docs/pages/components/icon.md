---
path: "/components/icon"
title: "Icon"
group: "General"
groupOrder: 3
order: 5
icon: "sparkle-24"
---

# Icon

The small set of glyphs the controls use. Color follows `currentColor`. `text`, `json`, `select`, `checkbox`, `datetime`, and `md` mark database column types. `md` is the markdown type.

```live-react
import { Icon } from "devnonla-ui";

const GROUPS = [
  { title: "Schema", names: ["text", "json", "select", "checkbox", "datetime", "md"] },
  { title: "Arrows", names: ["arrow-up", "arrow-right", "arrow-down", "arrow-left", "chevrons-left", "chevrons-right", "transfer"] },
  { title: "Actions", names: ["add", "check", "close", "copy", "download", "eraser", "pen", "stop", "trash"] },
  { title: "Content", names: ["book", "code", "dialog", "document", "globe"] },
  { title: "View", names: ["eye", "maximize", "minimize", "monitor"] },
  { title: "Status", names: ["clock", "error", "shield-check", "stars"] },
  { title: "Theme", names: ["moon", "sun"] },
];

export default function Demo() {
  return (
    <div className="flex w-full flex-col gap-6 text-left">
      {GROUPS.map((group) => (
        <section key={group.title}>
          <div className="mb-3 text-[13px] font-medium text-muted-foreground">{group.title}</div>
          <div className="flex flex-wrap gap-4">
            {group.names.map((name) => (
              <div key={name} className="flex w-24 flex-col items-center gap-2">
                <Icon name={name} size={20} />
                <span className="text-center text-[11px] leading-tight text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </section>
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

## Stroke

`stroke` is the line weight inside the 24px viewBox. The default is `1.5`. A higher number draws a bolder line. Filled glyphs such as `stop` stay solid.

```live-react
import { Icon } from "devnonla-ui";

const NAMES = ["text", "json", "select", "checkbox", "datetime", "md"];

export default function Demo() {
  return (
    <div className="flex flex-col items-center gap-6">
      {[1.5, 2, 2.5].map((stroke) => (
        <div key={stroke} className="flex items-center gap-6">
          <span className="w-8 text-xs text-muted-foreground">{stroke}</span>
          {NAMES.map((name) => (
            <Icon key={name} name={name} size={24} stroke={stroke} />
          ))}
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
| `name` | Glyph id. | `add` \| `arrow-down` \| `arrow-left` \| `arrow-right` \| `arrow-up` \| `book` \| `check` \| `checkbox` \| `chevrons-left` \| `chevrons-right` \| `clock` \| `close` \| `code` \| `copy` \| `datetime` \| `dialog` \| `document` \| `download` \| `eraser` \| `error` \| `eye` \| `globe` \| `json` \| `maximize` \| `md` \| `minimize` \| `monitor` \| `moon` \| `pen` \| `select` \| `shield-check` \| `stars` \| `stop` \| `sun` \| `text` \| `transfer` \| `trash` | — |
| `size` | Width and height in px. | `number` | `16` |
| `stroke` | Line weight in the 24px viewBox. Higher is bolder. | `number` | `1.5` |
| `className` | Extra class on the icon. Use it for color. | `string` | — |
