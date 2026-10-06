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
