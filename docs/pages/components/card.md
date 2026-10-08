---
path: "/components/card"
title: "Card"
group: "Data Display"
groupOrder: 6
order: 1
icon: "board-24"
---

# Card

Settings surface — section title, faint borders between rows, and a caption under the card.

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
