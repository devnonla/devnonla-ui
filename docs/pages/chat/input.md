---
path: "/chat/input"
title: "Input"
group: "Chat"
groupOrder: 2
order: 11
icon: "drafts-24"
---

# Input

Composer with send / stop. `toolbar` sits left of the field.

```live-react
import { useState } from "react";
import { ChatInput, message } from "devnonla-ui";

export default function Demo() {
  const [generating, setGenerating] = useState(false);
  return (
    <ChatInput
      generating={generating}
      placeholder="Message…"
      onSend={(text) => {
        message.success(`Sent: ${text}`);
        setGenerating(true);
        window.setTimeout(() => setGenerating(false), 1200);
      }}
      onCancel={() => setGenerating(false)}
    />
  );
}
```
