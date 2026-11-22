---
path: "/components/empty"
title: "Empty"
group: "Data Display"
groupOrder: 6
order: 4
icon: "image-off-24"
---

# Empty

Empty state: an icon, a title, one muted line, and the action that fills the space.

```live-react
import { Button, Empty, Icon } from "devnonla-ui";

export default function Demo() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Empty
        icon="globe"
        title="No domains yet"
        description="Add a domain to speed up and protect your sites."
        action={<Button type="primary" icon={<Icon name="add" />}>Add domain</Button>}
      />
      <Empty description="No data" />
    </div>
  );
}
```

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `title` | Bold line, e.g. "No projects yet" | `ReactNode` | — |
| `description` | Muted line under the title. `null` hides it. | `ReactNode` | `"No data"` without a title |
| `icon` | `Icon` name or node above the title. `null` hides it. | `IconName` \| `ReactNode` | Nonla mark |
| `action` | Call to action, usually a primary `Button` | `ReactNode` | — |
| `bordered` | Wrap in a `Card`. Turn off inside tables, panels, or cards. | `boolean` | `true` |
| `children` | Extra content under the action | `ReactNode` | — |
| `className` | Extra class on the inner content | `string` | — |
