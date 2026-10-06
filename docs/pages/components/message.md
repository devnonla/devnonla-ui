---
path: "/components/message"
title: "Message"
group: "Feedback"
groupOrder: 7
order: 1
icon: "alert-24"
---

# Message

Display global messages as feedback in response to user operations.

```live-react
import { App, Button, message } from "devnonla-ui";

export default function Demo() {
  return (
    <App>
      <Button type="primary" onClick={() => message.success("Saved")}>Success</Button>
      <Button danger onClick={() => message.error("Failed")}>Error</Button>
      <Button onClick={() => message.info("Heads up")}>Info</Button>
      <Button onClick={() => message.warning("Be careful")}>Warning</Button>
    </App>
  );
}
```
