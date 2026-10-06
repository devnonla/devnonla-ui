---
path: "/components/codeblock"
title: "CodeBlock"
group: "Data Display"
groupOrder: 6
order: 10
icon: "code-block-24"
---

# CodeBlock

Syntax-highlighted snippets with copy.

```tsx
export default function MyApp() {
  return <h1>Welcome</h1>;
}
```

```live-react
import { CodeBlock } from "devnonla-ui";

export default function Demo() {
  return <CodeBlock className="w-full" language="tsx" title="MyButton.tsx" lineNumbers code={'export function MyButton() {\n  return <button>Click me</button>;\n}'} />;
}
```
