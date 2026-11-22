<!-- Generated from docs/pages/components/segmented.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/segmented -->

# Segmented

Display multiple options and allow users to select a single one.

## API

### Segmented

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `options` | Choices, as plain strings or numbers or as option objects. | `(string \| number \| Option)[]` | — |
| `value` | Selected value, controlled. | `string \| number` | — |
| `defaultValue` | Initial value when uncontrolled. Falls back to the first option. | `string \| number` | — |
| `onChange` | Called with the clicked option's value. | `(value) => void` | — |
| `size` | Control height. | `"small" \| "default" \| "large"` | — |
| `block` | Stretches to the parent's width with equal segments. | `boolean` | — |
| `disabled` | Disables every option. | `boolean` | — |
| `className` | Extra class on the root. | `string` | — |

### Option

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `label` | Segment text. | `ReactNode` | — |
| `value` | Value passed to `onChange`. | `string \| number` | — |
| `icon` | Icon shown before the label. | `ReactNode` | — |
| `disabled` | Disables this segment. | `boolean` | — |
