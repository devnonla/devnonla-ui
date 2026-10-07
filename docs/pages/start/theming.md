---
path: "/theming"
title: "Theming"
group: "Get started"
groupOrder: 1
order: 3
icon: "paint-brush-24"
---

# Theming

Dark is the default. `.light` overrides the knobs that change in daylight. `ThemeToggle` switches modes and remembers the choice.

Set `--nonla-*` in your CSS. Aliases (`--background`, `--card`, `--border`, `--brand`, `--foreground`, …) follow those knobs, so components stay in sync. The CTA is `--nonla-brand`, not `--primary` (that one is ink).

```css
:root {
  /* Page and text */
  --nonla-bg: #141414;
  --nonla-fg: #ffffff;
  --nonla-fg-muted: color-mix(in oklab, var(--nonla-fg) 74%, var(--nonla-bg));
  --nonla-fg-tertiary: color-mix(in oklab, var(--nonla-fg) 60%, var(--nonla-bg));
  --nonla-fg-quaternary: color-mix(in oklab, var(--nonla-fg) 36%, var(--nonla-bg));
  --nonla-ink: var(--nonla-fg);
  --nonla-placeholder: color-mix(in srgb, var(--nonla-fg) 42%, transparent);

  /* Brand and status */
  --nonla-brand: #f18d00;
  --nonla-solid-fg: #ffffff;
  --nonla-danger: #ef4444;
  --nonla-success: #3fa266;
  --nonla-warn: #f1b467;
  --nonla-link: #81a1c1;

  /* Surfaces */
  --nonla-sidebar: #181818;
  --nonla-surface: #181818;
  --nonla-elevated: var(--nonla-surface);
  --nonla-meadow: #141414;
  --nonla-composer: var(--nonla-surface);
  --nonla-chat-bg: var(--nonla-bg);
  --nonla-window-header: #242424;
  --nonla-table-head: color-mix(in srgb, var(--nonla-fg) 4%, var(--nonla-bg));
  --nonla-chip: color-mix(in oklab, var(--nonla-fg) 6%, var(--nonla-surface));
  --nonla-chip-hover: color-mix(in oklab, var(--nonla-fg) 10%, var(--nonla-surface));

  /* Lines */
  --nonla-border: color-mix(in oklab, var(--nonla-fg) 6%, transparent);
  --nonla-hairline: color-mix(in oklab, var(--nonla-fg) 3%, transparent);
  --nonla-input: color-mix(in oklab, var(--nonla-fg) 9%, transparent);
  --nonla-ink-hover: color-mix(in oklab, var(--nonla-fg) 6%, transparent);
  --nonla-ink-active: color-mix(in oklab, var(--nonla-fg) 10%, transparent);
  --nonla-ink-line: var(--nonla-border);

  /* Glass aliases — same fills as surface / page */
  --nonla-glass: var(--nonla-surface);
  --nonla-glass-bar: var(--nonla-bg);
  --nonla-glass-menu: var(--nonla-surface);
  --nonla-glass-border: var(--nonla-border);
  --nonla-glass-highlight: transparent;

  /* Metrics */
  --nonla-radius: 8px;
  --nonla-radius-sm: max(0px, calc(var(--nonla-radius) - 2px));
  --nonla-radius-lg: calc(var(--nonla-radius) + 2px);
  --nonla-height: 32px;
  --nonla-height-sm: 24px;
  --nonla-height-lg: 40px;
  --nonla-desktop-bar-height: 42px;

  /* Stacking */
  --nonla-z-base: 0;
  --nonla-z-desktop: 20;
  --nonla-z-window: 30;
  --nonla-z-header: 40;
  --nonla-z-popup-base: 1000;
  --nonla-z-drawer: var(--nonla-z-popup-base);
  --nonla-z-modal: var(--nonla-z-popup-base);
  --nonla-z-message: calc(var(--nonla-z-popup-base) + 10);
  --nonla-z-popup: calc(var(--nonla-z-popup-base) + 50);

  /* Motion */
  --nonla-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --nonla-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --nonla-dur-fast: 150ms;
  --nonla-dur: 200ms;
  --nonla-dur-slow: 300ms;

  /* Shadow and scrollbar */
  --nonla-shadow: 0 16px 48px rgb(0 0 0 / 45%);
  --nonla-scrollbar-size: 6px;
  --nonla-scrollbar-thumb: color-mix(in oklab, var(--nonla-fg) 22%, var(--nonla-bg));
  --nonla-scrollbar-thumb-hover: var(--nonla-fg-quaternary);

  /* Chat type */
  --chat-body-size: 14px;
  --chat-body-leading: 24px;
  --chat-p-mb: 12px;
  --chat-h-mt: 16px;
  --chat-h-mb: 8px;
  --chat-composer-size: 14px;
  --chat-composer-leading: 22px;
  --chat-code-size: 12.5px;
}
```

Daylight only redefines the knobs that change. Everything else stays on the block above.

```css
.light {
  --nonla-bg: #ffffff;
  --nonla-fg: #2c2c2b;
  --nonla-fg-muted: color-mix(in oklab, var(--nonla-fg) 74%, var(--nonla-bg));
  --nonla-fg-tertiary: color-mix(in oklab, var(--nonla-fg) 60%, var(--nonla-bg));
  --nonla-fg-quaternary: color-mix(in oklab, var(--nonla-fg) 36%, var(--nonla-bg));
  --nonla-danger: #dc3b3b;
  --nonla-success: #2f7d4a;
  --nonla-warn: #a16207;
  --nonla-link: #3b6d99;
  --nonla-sidebar: #f7f5f2;
  --nonla-surface: #ffffff;
  --nonla-meadow: #ffffff;
  --nonla-window-header: #e8e8e8;
  --nonla-border: color-mix(in oklab, var(--nonla-fg) 8%, transparent);
  --nonla-hairline: color-mix(in oklab, var(--nonla-fg) 4%, transparent);
  --nonla-input: color-mix(in oklab, var(--nonla-fg) 12%, transparent);
  --nonla-shadow: 0 12px 32px rgb(0 0 0 / 12%);
}
```

## Toggle

```tsx
import { ThemeToggle, setColorMode } from "devnonla-ui";

setColorMode("light");

<ThemeToggle />
```

```live-react
import { ThemeToggle } from "devnonla-ui";

export default function Demo() {
  return <ThemeToggle />;
}
```
