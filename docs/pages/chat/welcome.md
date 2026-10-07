---
path: "/chat/welcome"
title: "Welcome"
group: "Chat"
groupOrder: 2
order: 4
icon: "people-community-24"
---

# Welcome

Empty thread inside AgentPanel and AgentChatbox: name, description, starter prompts. Import `ChatWelcome` only for a custom layout.

```live-react
import { ChatWelcome, message } from "devnonla-ui";

export default function Demo() {
  return (
    <ChatWelcome
      name="Nova"
      description="Helps with research, drafting, and tool-using workflows."
      onStarter={(text) => message.info(text)}
    />
  );
}
```
