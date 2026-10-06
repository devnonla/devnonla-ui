---
path: "/components/modal"
title: "Modal"
group: "Feedback"
groupOrder: 7
order: 2
icon: "board-24"
---

# Modal

Display a dialog for user decisions or extra content.

```live-react
import { useState } from "react";
import { App, Button, Modal, message } from "devnonla-ui";

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <App>
      <Button type="primary" onClick={() => setOpen(true)}>Open Modal</Button>
      <Button
        onClick={() =>
          Modal.confirm({
            title: "Delete item?",
            content: "This cannot be undone.",
            okText: "Delete",
            okButtonProps: { danger: true },
            onOk: async () => message.success("Deleted"),
          })
        }
      >
        Modal.confirm
      </Button>
      <Modal open={open} title="Example modal" onCancel={() => setOpen(false)} onOk={() => setOpen(false)}>
        <p className="m-0 text-sm text-muted-foreground">Modal body content.</p>
      </Modal>
    </App>
  );
}
```
