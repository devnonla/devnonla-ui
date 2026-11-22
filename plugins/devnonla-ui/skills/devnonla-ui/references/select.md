<!-- Generated from docs/pages/components/select.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/select -->

# Select

Select a value from options.

## API

### Select

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `options` | Choices to pick from. | `Option[]` | `[]` |
| `value` | Selected value, controlled. `null` clears it. | `string \| number \| null` | — |
| `defaultValue` | Initial value when uncontrolled. | `string \| number \| null` | — |
| `onChange` | Called with the new value, or `null` when cleared. | `(value) => void` | — |
| `placeholder` | Text shown when nothing is selected. | `string` | `"Select"` |
| `size` | Control height. | `"small" \| "default" \| "large"` | — |
| `status` | Validation color. | `"error" \| "warning"` | — |
| `disabled` | Blocks opening and clearing. | `boolean` | — |
| `allowClear` | On hover, swaps the chevron for a clear button when a value is set. | `boolean` | — |
| `showSearch` | Filters options as you type, by `label` (default) or by `value` via `optionFilterProp`. | `boolean \| { optionFilterProp?: "label" \| "value" }` | — |
| `onSelect` | Called with the picked value. Not called on clear. | `(value) => void` | — |
| `optionRender` | Draws a row in the list, any height. The trigger still shows `label`. | `(option, { selected }) => ReactNode` | — |
| `popupMatchSelectWidth` | Makes the dropdown as wide as the trigger. `false` lets it grow. | `boolean` | `true` |
| `className` | Extra class on the trigger. | `string` | — |
| `popupClassName` | Extra class on the dropdown. | `string` | — |

### Option

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `label` | Text shown in the list and the trigger. | `ReactNode` | — |
| `value` | Value passed to `onChange`. | `string \| number` | — |
| `disabled` | Shows the option but blocks picking it. | `boolean` | — |
| `description` | Muted second line in the list. Search matches it too. | `ReactNode` | — |
