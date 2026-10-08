---
path: "/components/popconfirm"
title: "Popconfirm"
group: "Feedback"
groupOrder: 7
order: 5
icon: "chat-bubbles-question-24"
---

# Popconfirm

A compact confirmation dialog of an action.

```live-react
import { Button, Popconfirm, message } from "devnonla-ui";

export default function Demo() {
  return (
    <Popconfirm title="Delete the task" description="Are you sure?" okText="Delete" okType="danger" onConfirm={() => message.success("Deleted")}>
      <Button danger>Delete</Button>
    </Popconfirm>
  );
}
```
