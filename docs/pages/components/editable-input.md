---
path: "/components/editable-input"
title: "EditableInput"
group: "Data Entry"
groupOrder: 5
order: 2
icon: "text-edit-style-24"
---

# EditableInput

Click the pencil to edit in place. Save commits; Escape or Cancel restores the previous value.

```live-react
import { useState } from "react";
import { EditableInput, message } from "devnonla-ui";

export default function Demo() {
  const [value, setValue] = useState("Optional note");
  const [editing, setEditing] = useState(false);
  return (
    <div className="w-full max-w-sm">
      <EditableInput
        display={<span>{value}</span>}
        editing={editing}
        onStartEdit={() => setEditing(true)}
        onCancelEdit={() => setEditing(false)}
        initialValue={value}
        onSave={async (next) => {
          setValue(next);
          setEditing(false);
          message.success("Saved");
        }}
      />
    </div>
  );
}
```

## API

The parent owns editing. The pencil calls onStartEdit. Save calls onSave; Escape or Cancel calls onCancelEdit and restores the previous value. An unchanged draft closes without calling onSave. A rejected onSave keeps the editor open.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| display | Shown while idle. Hidden while the editor is open. | `ReactNode` | `-` |
| editing | Whether the editor popover is open. | `boolean` | `-` |
| onStartEdit | Called when the pencil is clicked. | `() => void` | `-` |
| onCancelEdit | Called on Cancel, Escape, or an unchanged draft. | `() => void` | `-` |
| initialValue | Draft loaded when editing starts. | `string` | `-` |
| onSave | Called with the draft. Resolving closes the editor. | `(value: string) => Promise<void>` | `-` |
| placeholder | Placeholder in the editor. | `string` | `-` |
| type | Editor field. `textarea` saves with ⌘/Ctrl+Enter; Enter inserts a line. | `text` \| `password` \| `textarea` | `text` |
| editLabel | Accessible name of the pencil. | `string` | `Edit value` |
| minWidth | Minimum width of the editor, in px. | `number` | `-` |
| size | Display size. `middle` and `medium` match `default`. `xs` matches `small`. | `small` \| `default` \| `large` | `default` |
| allowEmpty | Allow saving an empty string. When `false`, empty shows “Value is required” and Save stays disabled. | `boolean` | `false` |

### EditableInput.Key

Edits an env-style key. The draft is uppercased. It must match `[A-Z][A-Z0-9_]*` (for example `API_TOKEN`). An empty or invalid key stays open and shows an error.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| value | Current key, shown in monospace. | `string` | `-` |
| editing | Whether the editor popover is open. | `boolean` | `-` |
| onStartEdit | Called when the pencil is clicked. | `() => void` | `-` |
| onCancelEdit | Called on Cancel, Escape, or an unchanged key. | `() => void` | `-` |
| onSave | Called with the validated key. Resolving closes the editor. | `(key: string) => Promise<void>` | `-` |
| placeholder | Placeholder in the editor. | `string` | `VARIABLE_NAME` |
| editLabel | Accessible name of the pencil. | `string` | `Edit key` |
| size | Display size. `middle` and `medium` match `default`. `xs` matches `small`. | `small` \| `default` \| `large` | `default` |
