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
