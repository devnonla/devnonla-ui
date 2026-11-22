---
path: "/components/kbd"
title: "Kbd"
group: "General"
groupOrder: 3
order: 6
icon: "options-24"
---

# Kbd

Key caps for shortcuts in search fields, menus, and tooltips. Pass `keys` for a combo, or one key as children.

```live-react
import { Input, Kbd } from "devnonla-ui";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4 text-left">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        Search <Kbd keys={["⌘", "K"]} />
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        Send <Kbd>Enter</Kbd> · New line <Kbd keys={["Shift", "Enter"]} />
      </div>
      <Input placeholder="Quick search…" suffix={<Kbd keys={["⌘", "K"]} />} />
    </div>
  );
}
```

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `keys` | Keys of a shortcut, one cap each. | `ReactNode[]` | — |
| `children` | One cap when `keys` is not set. | `ReactNode` | — |
