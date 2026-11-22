---
path: "/components/form"
title: "Form"
group: "Data Entry"
groupOrder: 5
order: 12
icon: "form-24"
wide: true
---

# Form

JSON-driven form (react-hook-form). Schema can come from the backend.

```live-react
import { useForm } from "react-hook-form";
import { App, Button, EFormItemType, SchemaForm, message } from "devnonla-ui";

const items = [
  { type: EFormItemType.Input, name: "name", label: "Name", colSpan: 12, rules: { required: "Name is required" }, options: { placeholder: "Your name" } },
  { type: EFormItemType.Select, name: "role", label: "Role", colSpan: 12, choices: [{ label: "Admin", value: "admin" }, { label: "User", value: "user" }] },
  { type: EFormItemType.Switch, name: "on", label: "Enabled", colSpan: 12 },
];

export default function Demo() {
  const form = useForm({ defaultValues: { name: "", role: "user", on: true } });
  return (
    <App>
      <form
        className="flex w-full max-w-md flex-col gap-4 text-left"
        onSubmit={form.handleSubmit((values) => message.success(JSON.stringify(values)))}
      >
        <SchemaForm form={form} items={items} />
        <Button type="primary" htmlType="submit">Submit</Button>
      </form>
    </App>
  );
}
```

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
