<!-- Generated from docs/pages/components/tag.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/tag -->

# Tag

Compact labels for status, filters, and metadata.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `children` | Label | `ReactNode` | — |
| `color` | Status (`success`, `error`, `warning`, `processing`, `brand`), preset name, or any CSS color | `string` | `"default"` |
| `variant` | `soft` is a quiet wash. `solid` is a saturated chip | `"soft" \| "solid"` | `"soft"` |
| `dot` | Leading dot. On for soft colored tags; `false` hides, `true` forces | `boolean` | — |
| `closable` | Shows a remove button | `boolean` | `false` |
| `onClose` | Fires when the remove button is clicked | `() => void` | — |
| `className` | Extra class on the tag | `string` | — |
