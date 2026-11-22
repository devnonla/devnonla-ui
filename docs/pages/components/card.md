---
path: "/components/card"
title: "Card"
group: "Data Display"
groupOrder: 6
order: 1
icon: "board-24"
---

# Card

Settings surface — section title, faint borders between rows, and a caption under the card. Each `Card.Item` is a settings row: `label` and `description` on the left, the control on the right. Stack sections with `gap-10`.

## Settings list

```live-react
import { useState } from "react";
import { Card, Switch } from "devnonla-ui";

const MARKETING = [
  { key: "blog", label: "Blog", description: "Product notes and engineering write-ups." },
  { key: "events", label: "Events", description: "Webinars and meetups near you." },
  { key: "news", label: "Product news", description: "New features as soon as they ship." },
];

export default function Demo() {
  const [on, setOn] = useState({ blog: true, events: false, news: true, alerts: true });
  const toggle = (key) => (value) => setOn((s) => ({ ...s, [key]: value }));
  return (
    <div className="flex w-full max-w-xl flex-col gap-10 text-left">
      <Card title="Marketing">
        {MARKETING.map((item) => (
          <Card.Item key={item.key} label={item.label} description={item.description}>
            <Switch checked={on[item.key]} onChange={toggle(item.key)} aria-label={item.label} />
          </Card.Item>
        ))}
      </Card>
      <Card title="Agents" caption="Sent to the email on your profile.">
        <Card.Item label="Run alerts" description="Email when a long agent run finishes or fails.">
          <Switch checked={on.alerts} onChange={toggle("alerts")} aria-label="Run alerts" />
        </Card.Item>
      </Card>
    </div>
  );
}
```

## Mixed controls

```live-react
import { Button, Card, Tag } from "devnonla-ui";

export default function Demo() {
  return (
    <div className="w-full max-w-xl text-left">
      <Card title="Privacy" caption="Code data stays out of training.">
        <Card.Item label={<span>Privacy Mode <Tag>Active</Tag></span>} description="Your code data will not be trained on.">
          <Button size="small">Edit</Button>
        </Card.Item>
        <Card.Item label="Email" align="center">dev@vietnix.vn</Card.Item>
      </Card>
    </div>
  );
}
```

## API

### Card

Other HTML attributes pass through to the root `section`.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `title` | Section label above the surface | `ReactNode` | — |
| `children` | Rows inside the surface, usually `Card.Item` | `ReactNode` | — |
| `caption` | Note under the surface, such as a “Learn more” link | `ReactNode` | — |
| `className` | Extra class on the root | `string` | — |

### Card.Item

Other HTML attributes pass through to the row.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `label` | Row title on the left | `ReactNode` | — |
| `description` | Muted text under the label | `ReactNode` | — |
| `children` | Control on the right. Without `label` or `description` it fills the row. | `ReactNode` | — |
| `align` | `center` centers the control. `start` pins it to the first line. | `start` \| `center` | `center` |
| `split` | Split the row in half so a field fills the trailing column | `boolean` | `false` |
| `className` | Extra class on the row | `string` | — |
