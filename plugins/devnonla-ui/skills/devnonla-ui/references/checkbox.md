<!-- Generated from docs/pages/components/checkbox.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/checkbox -->

# Checkbox

Collect the user's choices.

## API

Other Radix Checkbox props pass through.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `checked` | Checked state, for a controlled checkbox | `boolean` \| `indeterminate` | — |
| `defaultChecked` | Initial checked state, for an uncontrolled checkbox | `boolean` | — |
| `indeterminate` | Shows the mixed state. Wins over `checked`. | `boolean` | `false` |
| `onChange` | Receives the next checked boolean, not a DOM event | `(checked: boolean) => void` | — |
| `disabled` | Blocks clicks and dims the checkbox | `boolean` | `false` |
| `children` | Label next to the box | `ReactNode` | — |
| `color` | Checked fill. `white` is for dark surfaces. | `default` \| `brand` \| `success` \| `white` | `default` |
| `className` | Extra class on the box | `string` | — |
