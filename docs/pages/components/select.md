---
path: "/components/select"
title: "Select"
group: "Data Entry"
groupOrder: 5
order: 6
icon: "options-24"
---

# Select

Select a value from options.

```live-react
import { Select } from "devnonla-ui";

const roles = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
];

export default function Demo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Select placeholder="Pick a role" options={roles} />
      <Select defaultValue="editor" options={roles} />
    </div>
  );
}
```

## Search

`showSearch` turns the trigger into an input that filters by label. Arrow keys move, Enter picks, Esc closes.

```live-react
import { Select } from "devnonla-ui";

const regions = [
  "Singapore", "Tokyo", "Seoul", "Hong Kong", "Sydney", "Frankfurt",
  "London", "Paris", "Amsterdam", "Virginia", "Oregon", "São Paulo",
].map((name) => ({ label: name, value: name.toLowerCase().replace(/\s+/g, "-") }));

export default function Demo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Select showSearch placeholder="Search a region" options={regions} />
      <Select showSearch allowClear defaultValue="tokyo" options={regions} />
    </div>
  );
}
```

## Clear

`allowClear` swaps the chevron for a clear button while you hover a filled select. Clearing calls `onChange(null)`.

```live-react
import { Select } from "devnonla-ui";

const roles = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
];

export default function Demo() {
  return <Select className="max-w-md" defaultValue="admin" options={roles} allowClear />;
}
```

## Controlled

```live-react
import { Select, Text } from "devnonla-ui";
import { useState } from "react";

const plans = [
  { label: "Free", value: "free" },
  { label: "Pro", value: "pro" },
  { label: "Business", value: "business" },
  { label: "Enterprise", value: "enterprise", disabled: true },
];

export default function Demo() {
  const [plan, setPlan] = useState("pro");
  return (
    <div className="grid w-full max-w-md gap-2">
      <Select value={plan} onChange={setPlan} options={plans} allowClear />
      <Text type="secondary">Value: {plan ?? "null"}</Text>
    </div>
  );
}
```

## Sizes

```live-react
import { Select } from "devnonla-ui";

const roles = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
];

export default function Demo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Select size="small" defaultValue="admin" options={roles} />
      <Select defaultValue="admin" options={roles} />
      <Select size="large" defaultValue="admin" options={roles} />
    </div>
  );
}
```

## Status and disabled

```live-react
import { Select } from "devnonla-ui";

const roles = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
];

export default function Demo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Select status="error" placeholder="Error" options={roles} />
      <Select status="warning" placeholder="Warning" options={roles} />
      <Select disabled defaultValue="admin" options={roles} />
    </div>
  );
}
```

## Rich labels

A label can be any node. Search still matches its text.

```live-react
import { Icon, Select } from "devnonla-ui";

const label = (icon, text) => (
  <span className="inline-flex items-center gap-2">
    <Icon name={icon} size={16} className="text-muted-foreground" />
    {text}
  </span>
);

const modes = [
  { value: "light", label: label("sun", "Light") },
  { value: "dark", label: label("moon", "Dark") },
  { value: "system", label: label("monitor", "System") },
];

export default function Demo() {
  return <Select className="max-w-md" showSearch defaultValue="system" options={modes} />;
}
```

## Custom options

`description` adds a muted second line to a row. For anything else, `optionRender` draws the whole row, at any height. Either way the trigger keeps the one-line `label`.

```live-react
import { Select } from "devnonla-ui";

const regions = [
  { value: "sin", label: "Singapore", description: "ap-southeast-1 · 12 ms" },
  { value: "nrt", label: "Tokyo", description: "ap-northeast-1 · 68 ms" },
  { value: "fra", label: "Frankfurt", description: "eu-central-1 · 180 ms" },
  { value: "iad", label: "Virginia", description: "us-east-1 · 220 ms", disabled: true },
];

export default function Demo() {
  return <Select className="max-w-md" showSearch defaultValue="sin" options={regions} />;
}
```

```live-react
import { Select, Tag } from "devnonla-ui";

const people = [
  { value: "an", label: "An Nguyen", email: "an@example.com", role: "Owner" },
  { value: "binh", label: "Binh Tran", email: "binh@example.com", role: "Admin" },
  { value: "chi", label: "Chi Le", email: "chi@example.com", role: "Member" },
];

export default function Demo() {
  return (
    <Select
      className="max-w-md"
      defaultValue="binh"
      options={people}
      optionRender={(option) => (
        <div className="flex items-center gap-3 py-1">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-ink-hover text-xs font-medium">
            {option.label.split(" ").map((w) => w[0]).join("")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{option.label}</span>
            <span className="block truncate text-xs text-muted-foreground">{option.email}</span>
          </span>
          <Tag>{option.role}</Tag>
        </div>
      )}
    />
  );
}
```

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
