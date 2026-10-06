---
path: "/components/table"
title: "Table"
group: "Data Display"
groupOrder: 6
order: 3
icon: "table-24"
wide: true
---

# Table

Bordered card. Footer shows the total and how many rows fit on a page.

```live-react
import { Table, Tag } from "devnonla-ui";

const data = [
  { id: "1", name: "Ada Lovelace", role: "admin", age: 36 },
  { id: "2", name: "Bob Martin", role: "user", age: 28 },
  { id: "3", name: "Chloe Nguyen", role: "editor", age: 31 },
];

export default function Demo() {
  return (
    <Table
      className="w-full"
      rowKey="id"
      dataSource={data}
      columns={[
        { title: "Name", dataIndex: "name" },
        { title: "Role", dataIndex: "role", render: (role) => <Tag color={role === "admin" ? "brand" : "default"}>{role}</Tag> },
        { title: "Age", dataIndex: "age", width: 80 },
      ]}
    />
  );
}
```
