---
path: "/chat/welcome"
title: "Welcome"
group: "Chat"
groupOrder: 2
order: 5
icon: "people-community-24"
---

# Welcome

Empty chat state with agent intro and starter prompts.

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
