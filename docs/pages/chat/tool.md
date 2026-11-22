---
path: "/chat/tool"
title: "Tool call"
group: "Chat"
groupOrder: 2
order: 9
icon: "wrench-screwdriver-24"
---

# Tool call

Generic tool card: input, output, running, error. AgentPanel and AgentChatbox use `ChatToolCall` for every tool that no `toolUis` entry matches.

```live-react
import { ChatToolCall } from "devnonla-ui/chat";

export default function Demo() {
  return (
    <>
      <ChatToolCall toolName="read_file" toolInput={{ path: "src/web/App.tsx" }} toolOutput={{ lines: 120, preview: "export default function App() { … }" }} defaultOpen />
      <ChatToolCall toolName="run_script" toolInput={{ name: "typecheck" }} running defaultOpen />
      <ChatToolCall toolName="browser_navigate" toolInput={{ url: "https://example.com" }} toolError="Timed out after 30s" defaultOpen />
    </>
  );
}
```

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `toolName` | Tool id. Title-cased for the label when `label` is omitted | `string` | `"Tool"` |
| `label` | Header text | `string` | formatted `toolName` |
| `toolInput` | Arguments, shown as JSON when expanded | `unknown` | — |
| `toolOutput` | Result, shown as JSON when expanded | `unknown` | — |
| `toolError` | Marks the call failed. A string is shown as the error | `boolean \| string` | — |
| `running` | Pending execution. The label shimmers, no spinner | `boolean` | `false` |
| `defaultOpen` | Starts expanded | `boolean` | `false` |
| `icon` | Icon left of the label | `ReactNode` | `code` icon |
| `className` | Class on the row | `string` | — |
