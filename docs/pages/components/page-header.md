---
path: "/components/page-header"
title: "PageHeader"
group: "Layout"
groupOrder: 4
order: 4
icon: "layers-24"
---

# PageHeader

Title row for a page: title, something beside it, a muted description, actions on the right, and a hairline underneath.

```live-react
import { Button, Icon, PageHeader, Tag } from "devnonla-ui";

export default function Demo() {
  return (
    <div className="w-full text-left">
      <PageHeader
        title="Audit logs"
        meta={<Tag>Beta</Tag>}
        description="See the history of changes made within this workspace."
        extra={
          <>
            <Button icon={<Icon name="refresh" />} aria-label="Refresh" />
            <Button type="primary">Export</Button>
          </>
        }
      />
    </div>
  );
}
```

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `title` | Page title (`h1`). | `ReactNode` | — |
| `description` | Muted line under the title. | `ReactNode` | — |
| `meta` | Beside the title: a docs link, a status tag. | `ReactNode` | — |
| `extra` | Right side actions. | `ReactNode` | — |
| `bordered` | Hairline under the header. | `boolean` | `true` |
| `children` | Rendered under the title row, above the hairline (tabs, filters). | `ReactNode` | — |
