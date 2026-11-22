<!-- Generated from docs/pages/components/switch.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/switch -->

# Switch

Switching selector.

## API

Other Radix Switch props pass through.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `checked` | Checked state. Pair it with `onChange` | `boolean` | — |
| `defaultChecked` | Initial checked state when uncontrolled | `boolean` | `false` |
| `onChange` | Gets the next checked value, not a DOM event | `(checked: boolean) => void` | — |
| `disabled` | Blocks toggling and dims the switch | `boolean` | `false` |
| `size` | Track size. Falls back to the `App` size | `"small" \| "default" \| "large"` | `"default"` |
| `variant` | Track shape. `square` uses small rounded corners | `"default" \| "square"` | `"default"` |
| `color` | Checked track color. `white` is for dark surfaces | `"default" \| "brand" \| "success" \| "white"` | `"default"` |
| `className` | Extra class on the track | `string` | — |
| `style` | Inline style on the track | `CSSProperties` | — |
