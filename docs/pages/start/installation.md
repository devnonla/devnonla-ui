---
path: "/installation"
title: "Installation"
group: "Get started"
groupOrder: 1
order: 2
icon: "code-24"
---

# Installation

Add the package, import the CSS, wrap the tree in App.

## Package

```bash
bun add devnonla-ui
```

Peer deps: `react` / `react-dom` ≥ 19, `react-hook-form`. Tailwind CSS v4 on the consumer.

## Styles

```css
@import "tailwindcss";
@import "devnonla-ui/styles.css";
```

## Root

`App` is the wrapper you put once around the Nonla tree. It is not a screen. It renders a `.nonla-ui` host: theme tokens, font, and scrollbars stay inside that host and do not restyle the rest of the consumer page.

It also does three things:

- Remembers light or dark on that host, and sets the default size of buttons, inputs, and the rest (`small`, `default`, `large`). A control's own `size` still wins.
- Gives dropdowns, tooltips, and dialogs a place to render (the host), so they sit above the page and follow the theme.
- Hosts `message.success("Saved")` and `Modal.confirm(...)`. Those calls have no component of their own. `App` is where they show up.

```tsx
import "devnonla-ui/styles.css";
import { App, Button, message } from "devnonla-ui";

export function Root() {
  return (
    <App>
      <Button type="primary" onClick={() => message.success("Saved")}>
        Save
      </Button>
    </App>
  );
}
```

Pass props only when a default is wrong. `componentSize` changes the shared size. Override `--nonla-*` on `.nonla-ui` (or a child) — see [Theming](/theming). `getPopupContainer` points floating UI at a specific element when the host itself is the wrong place.

## Entries

One package, three import paths. Controls stay on `devnonla-ui`. Chat and markdown are separate so an app that only needs buttons and forms does not load them.

```tsx
import { Button } from "devnonla-ui";
import { MarkdownViewer } from "devnonla-ui/markdown";
import { AgentPanel } from "devnonla-ui/chat";
```
