---
path: "/chat/input"
title: "Input"
group: "Chat"
groupOrder: 2
order: 8
icon: "drafts-24"
---

# Input

Composer at the bottom of AgentPanel and AgentChatbox. Import `ChatInput` when you build the thread yourself. `toolbar` sits left of the field.

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
