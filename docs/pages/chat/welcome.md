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
import { message } from "devnonla-ui";
import { ChatWelcome } from "devnonla-ui/chat";

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

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `name` | Name in the greeting, "Hi, I'm {name}" | `string` | — |
| `description` | Line under the greeting. Empty shows a generic prompt | `string \| null` | — |
| `avatar` | Avatar node, such as an image or initials | `ReactNode` | name initial |
| `starters` | Prompt buttons. Shown only with `onStarter` | `string[]` | three generic prompts |
| `onStarter` | Fires with the clicked starter text | `(text: string) => void` | — |
| `disabled` | Disables the starter buttons | `boolean` | `false` |
| `className` | Class on the root | `string` | — |
