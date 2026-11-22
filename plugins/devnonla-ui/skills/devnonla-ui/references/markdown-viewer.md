<!-- Generated from docs/pages/components/markdown-viewer.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/markdown-viewer -->

# MarkdownViewer

Xem markdown đã viết. Chỉ đọc: heading, list, bảng, code, mermaid, khối live-react, và fence gắn component riêng. Body là `text-base`.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `value` | Markdown to render | `string` | `""` |
| `streaming` | Keep an open mermaid or custom fence as code until it closes | `boolean` | `false` |
| `placeholder` | Text shown when `value` is empty | `string` | — |
| `components` | Components for fenced blocks, keyed by language. `mermaid` and `live-react` stay built in. | `Record<string, ComponentType>` | — |
| `sandbox` | Run `live-react` fences in a sandboxed iframe. Wins over `trustedModules`. | `boolean` | `false` |
| `trustedModules` | Run `live-react` fences in this page, with these importable modules | `Record<string, unknown>` | — |
| `showHeader` | Frame around `live-react` results. `false` shows them inline. | `boolean` | `true` |
| `showCode` | Switch that opens a `live-react` preview's source. Needs `showHeader`. | `boolean` | `true` |
| `className` | Extra class on the root | `string` | — |
| `style` | Overrides scale variables, such as heading size | `CSSProperties` | — |
