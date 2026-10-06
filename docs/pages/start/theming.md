---
path: "/theming"
title: "Theming"
group: "Get started"
groupOrder: 1
order: 3
icon: "paint-brush-24"
---

# Theming

Dark is the default. Light is the same knobs under `.light`. `ThemeToggle` switches both modes and remembers the choice.

You only touch `--nonla-*` (CSS) or `theme` / `applyNonlaTheme`. Shadcn tokens (`--background`, `--primary`, …) are mapped from those knobs. Nonla CTA is `--brand`, not `--primary` (ink).

```css
:root {
  --nonla-brand: #f18d00;
  --nonla-solid-fg: #ffffff;
}
```

```tsx
<App
  theme={{
    colors: { brand: "#f18d00", solidFg: "#ffffff" },
  }}
>
  …
</App>
```

```tsx
import { ThemeToggle, setColorMode } from "devnonla-ui";

setColorMode("light");

<ThemeToggle />
```

## Toggle

```live-react
import { ThemeToggle } from "devnonla-ui";

export default function Demo() {
  return <ThemeToggle />;
}
```
