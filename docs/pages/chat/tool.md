---
path: "/chat/tool"
title: "Tool call"
group: "Chat"
groupOrder: 2
order: 9
icon: "wrench-screwdriver-24"
---

# Tool call

Generic tool card: input, output, running, error. AgentPanel and AgentChatbox use `ChatToolCall` only when `toolUis` and the [builtin cards](/chat/builtin-tools) do not match `toolName`.

```live-react
import { ChatToolCall } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <ChatToolCall toolName="read_file" toolInput={{ path: "src/web/App.tsx" }} toolOutput={{ lines: 120, preview: "export default function App() { … }" }} showAvatar assistantLabel="Assistant" defaultOpen />
      <ChatToolCall toolName="run_script" toolInput={{ name: "typecheck" }} running defaultOpen />
      <ChatToolCall toolName="browser_navigate" toolInput={{ url: "https://example.com" }} toolError="Timed out after 30s" defaultOpen />
    </>
  );
}
```
