---
path: "/chat/user"
title: "User message"
group: "Chat"
groupOrder: 2
order: 5
icon: "person-24"
---

# User message

One user bubble. AgentPanel and AgentChatbox render `ChatUserMessage` for `role: "user"`. Long text expands and collapses.

```live-react
import { ChatUserMessage } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <ChatUserMessage content="Can you review this PR?" />
      <ChatUserMessage content={["Here is a longer prompt that should overflow the bubble height.", "", ...Array.from({ length: 8 }, (_, i) => `Line ${i + 1}: please consider edge cases around auth, streaming, and tool errors.`)].join("\n")} />
    </>
  );
}
```
