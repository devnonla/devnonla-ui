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

## API

`message.success`, `error`, `info`, `warning` and `loading` take `(content, duration?, onClose?)` or a config object. `message.open(config)` shows one directly and `message.destroy(key?)` closes one or all. Each call returns a function that closes that message.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `content` | Message text | `ReactNode` | — |
| `type` | Icon and tone. Overrides the method's type. | `success` \| `error` \| `info` \| `warning` \| `loading` | `info` |
| `duration` | Seconds before it closes. `0` keeps it open. | `number` | `3`, `0` for `loading` |
| `key` | Id. Reusing it replaces the open message. | `string` \| `number` | — |
| `icon` | Replaces the type icon | `ReactNode` | — |
| `onClose` | Fires after the message closes | `() => void` | — |
| `onClick` | Fires when the message is clicked | `() => void` | — |
| `className` | Extra class on the message | `string` | — |
| `style` | Inline style on the message | `CSSProperties` | — |
