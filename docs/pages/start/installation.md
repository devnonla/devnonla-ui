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

```tsx
import "devnonla-ui/styles.css";
import { App, Button, message } from "devnonla-ui";

message.success("Saved");

export function Root() {
  return (
    <App>
      <Button type="primary">Save</Button>
    </App>
  );
}
```
