<!-- Generated from docs/pages/components/skeleton.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/skeleton -->

# Skeleton

Placeholder while content is loading.

## API

### Skeleton

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `loading` | Shows the placeholder. `false` renders `children` instead. | `boolean` | `true` |
| `active` | Pulses the placeholder. | `boolean` | `true` |
| `title` | Shows a title bar. | `boolean` | `true` |
| `paragraph` | Shows text lines. `{ rows }` sets how many (3 by default). | `boolean \| { rows?: number }` | `true` |
| `avatar` | Shows a round avatar on the left. | `boolean` | — |
| `children` | Real content, shown once `loading` is `false`. | `ReactNode` | — |
| `className` | Extra class on the root. | `string` | — |

### Skeleton.Input

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `active` | Pulses the placeholder. | `boolean` | `true` |
| `block` | Stretches to the full width of the parent. | `boolean` | — |
| `className` | Extra class on the bar. | `string` | — |
| `style` | Inline style on the bar. | `CSSProperties` | — |
