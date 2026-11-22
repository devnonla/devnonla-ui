<!-- Generated from docs/pages/components/form.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/form -->

# Form

JSON-driven form (react-hook-form). Schema can come from the backend.

## API

### SchemaForm

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `form` | Form instance from react-hook-form `useForm` | `UseFormReturn` | — |
| `items` | Field schema, rendered on a 12-column grid | `FormItem[]` | — |
| `onValuesChange` | Fires with all values after edits, debounced | `(allValues) => void` | — |
| `valuesChangeDebounce` | Debounce for `onValuesChange`, in ms | `number` | `300` |
| `fetcher` | Loads options for `select_remote` fields | `FormFetcher` | — |
| `className` | Extra class on the grid | `string` | — |

### Form item

Some types add their own keys: `choices` for select and radio, `childItems` for repeater and object, `render` for custom.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `type` | Field kind, such as `EFormItemType.Input` | `EFormItemType` | — |
| `name` | Field path in the form values | `string` \| `string[]` \| `number[]` | — |
| `label` | Label above the field | `string` | — |
| `rules` | Validation: `required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `validate` | `TFormRule` | — |
| `options` | Props passed to the field control, such as `placeholder` | `Record<string, unknown>` | — |
| `choices` | Options for select, multi-select and radio fields | `{ label, value }[]` | — |
| `colSpan` | Grid columns the field spans, out of 12 | `1`–`12` | `12` |
| `helps` | Help lines under the field | `{ text, className?, iconClassName? }[]` | — |
| `conditions` | Show only when one group matches. Each group is `[name, op, value]` rows. | `[string, op, unknown][][]` | — |
| `collapsable` | Add a toggle that folds the field away | `boolean` | `false` |
| `defaultValue` | Initial value for a new row, used inside repeater `childItems` | `unknown` | — |
| `className` | Extra class on the field wrapper | `string` | — |
| `labelClassName` | Extra class on the label row | `string` | — |
| `innerClassName` | Extra class on the control area | `string` | — |
