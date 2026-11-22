<!-- Generated from docs/pages/components/logo.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/logo -->

# Logo

Nonla Agents mark. Icon, wordmark, or both.

## API

`variant` picks the mark, the wordmark, or both. `size` is the icon height in px. Omit `color` to keep the mascot palette.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `variant` | `icon` is the mark. `text` is the wordmark. `full` is both. | `icon` \| `text` \| `full` | `full` |
| `size` | Icon height in px. Width follows the mark's aspect ratio. | `number` | `32` |
| `color` | Fill for the mark and wordmark. Eyes and the smile stay. | `string` | — |
| `className` | Extra class on the root. | `string` | — |
| `style` | Inline style on the root. | `CSSProperties` | — |
