<!-- Generated from docs/pages/components/input-number.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/input-number -->

# InputNumber

Enter a number within a range with the mouse or keyboard.

## API

Other native `input` props pass through.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `value` | Current number, for a controlled input | `number` \| `null` | — |
| `defaultValue` | Initial number, for an uncontrolled input | `number` | — |
| `onChange` | Fires with the parsed number, or `null` when empty | `(value: number \| null) => void` | — |
| `onPressEnter` | Fires on Enter, ignored while composing | `(e: KeyboardEvent) => void` | — |
| `min` | Lowest allowed value | `number` | — |
| `max` | Highest allowed value | `number` | — |
| `step` | Amount added by the arrows and arrow keys | `number` | `1` |
| `precision` | Decimal places to round to. Omit to keep free typing. | `number` | — |
| `controls` | Show the up and down buttons | `boolean` | `true` |
| `size` | Control height | `small` \| `default` \| `large` | `default` |
| `status` | Validation outline | `error` \| `warning` | — |
| `disabled` | Blocks typing and stepping | `boolean` | `false` |
| `placeholder` | Text shown when empty | `string` | — |
| `formatter` | Turns the value into display text | `(value: number \| string \| undefined) => string` | — |
| `parser` | Turns typed text back into a number | `(displayValue: string) => number` | — |
| `className` | Extra class on the wrapper | `string` | — |
| `style` | Inline style on the wrapper | `CSSProperties` | — |
