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

## API

### Table

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `columns` | Column definitions, left to right | `Column[]` | `[]` |
| `dataSource` | Row records | `T[]` | `[]` |
| `rowKey` | Field or function giving each row a unique key | `keyof T \| (record) => Key` | `id`, then `key`, then index |
| `loading` | Skeleton rows on first load; a spinner over existing rows | `boolean` | `false` |
| `pagination` | Pagination props, or `false` to show every row. Slices locally without `total` | `false \| PaginationProps` | 10 per page |
| `rowSelection` | Adds a checkbox or radio column | `RowSelection` | — |
| `size` | Row padding. `small` is tight, `large` is roomy | `"small" \| "default" \| "large"` | `"default"` |
| `bordered` | Card frame around the table | `boolean` | `true` |
| `scroll` | Max body height for a sticky header, or a width to scroll horizontally | `{ x?: number \| string; y?: number \| string }` | — |
| `title` | Node above the table. A function gets the current page rows | `ReactNode \| (rows) => ReactNode` | — |
| `footer` | Footer row. A function gets the current page rows | `ReactNode \| (rows) => ReactNode` | — |
| `showHeader` | Shows the header row | `boolean` | `true` |
| `locale` | `emptyText` replaces the empty state | `{ emptyText?: ReactNode }` | — |
| `onChange` | Fires on page or sort change. The second argument is always `{}` | `(pagination, filters, sorter) => void` | — |
| `onRow` | Per-row `onClick`, `className` and `style` | `(record, index) => { onClick?, className?, style? }` | — |
| `rowClassName` | Extra class per row | `string \| (record, index) => string` | — |
| `className` | Extra class on the wrapper | `string` | — |

### Column

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `title` | Header content | `ReactNode` | — |
| `dataIndex` | Field to read. An array reads a nested path | `keyof T \| string \| (string \| number)[]` | — |
| `key` | Unique column key. Needed without `dataIndex` | `string` | `dataIndex` |
| `render` | Custom cell content | `(value, record, index) => ReactNode` | — |
| `width` | Fixed column width | `number \| string` | — |
| `minWidth` | Minimum column width | `number \| string` | — |
| `flex` | Takes leftover width. A number sets its share. Text wraps inside | `boolean \| number` | — |
| `align` | Text alignment in header and cells | `"left" \| "center" \| "right"` | `"left"` |
| `ellipsis` | Truncates long text and shows it on hover | `boolean` | `false` |
| `sorter` | `true` compares `dataIndex` values. A function sets the order | `boolean \| (a, b) => number` | — |
| `sortOrder` | Sort order, controlled | `"ascend" \| "descend" \| null` | — |
| `defaultSortOrder` | Initial sort order when uncontrolled | `"ascend" \| "descend" \| null` | — |
| `className` | Extra class on header and body cells | `string` | — |
| `onHeaderCell` | Extra `className` and `style` for the header cell | `() => { className?, style? }` | — |

### Row selection

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `type` | Checkbox for many rows, radio for one | `"checkbox" \| "radio"` | `"checkbox"` |
| `selectedRowKeys` | Selected keys, controlled | `Key[]` | — |
| `defaultSelectedRowKeys` | Initial selected keys when uncontrolled | `Key[]` | `[]` |
| `onChange` | Fires with the selected keys and rows | `(keys: Key[], rows: T[]) => void` | — |
| `getCheckboxProps` | Disables selection for some rows | `(record) => { disabled?: boolean }` | — |
| `columnWidth` | Width of the selection column | `number \| string` | — |
