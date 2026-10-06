---
path: "/components/dropdown"
title: "Dropdown"
group: "Navigation"
groupOrder: 8
order: 1
icon: "list-bar-24"
---

# Dropdown

A dropdown list.

```live-react
import { Button, Dropdown, message } from "devnonla-ui";

export default function Demo() {
  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        items: [
          { key: "1", label: "Edit" },
          { type: "divider" },
          { key: "2", label: "Delete", danger: true },
        ],
        onClick: ({ key }) => message.info(`Menu ${key}`),
      }}
    >
      <Button>Click menu</Button>
    </Dropdown>
  );
}
```
