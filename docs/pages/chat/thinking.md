---
path: "/chat/thinking"
title: "Thinking"
group: "Chat"
groupOrder: 2
order: 7
icon: "lightbulb-filament-24"
---

# Thinking

Collapsible reasoning. AgentPanel and AgentChatbox show `ChatThinking` inside the agent message while the model is reasoning, and after it finishes.

```live-react
import { ChatThinking } from "devnonla-ui/chat";

export default function Demo() {
  return (
    <>
      <ChatThinking thinking={"Plan:\n1. Inspect the failing test\n2. Fix the assertion\n3. Re-run the suite"} duration={4} />
      <ChatThinking thinking="Still gathering context from the codebase…" streaming />
    </>
  );
}
```

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `thinking` | Reasoning text. Empty renders nothing | `string` | — |
| `streaming` | Still thinking. The label shimmers and counts seconds | `boolean` | `false` |
| `duration` | Final duration in seconds, shown when not streaming | `number` | `0` |
| `className` | Class on the root | `string` | — |
