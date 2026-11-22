<!-- Generated from docs/pages/components/codeblock.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/codeblock -->

# CodeBlock

Syntax-highlighted snippets with copy.

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
