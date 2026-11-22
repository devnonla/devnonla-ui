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

## API

Other `div` attributes pass through to the root.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `code` | Source code to render | `string` | — |
| `language` | Language for highlight.js, such as `tsx` or `json` | `string` | — |
| `title` | Header label. Falls back to the language name. | `ReactNode` | — |
| `lineNumbers` | Show line numbers in the gutter | `boolean` | `false` |
| `wordWrap` | Wrap long lines instead of scrolling sideways | `boolean` | `false` |
| `className` | Extra class on the root | `string` | — |
