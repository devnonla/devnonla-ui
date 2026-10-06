---
path: "/chat/thinking"
title: "Thinking"
group: "Chat"
groupOrder: 2
order: 8
icon: "lightbulb-filament-24"
---

# Thinking

Collapsible reasoning indicator — streaming or finished.

```live-react
import { ChatThinking } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <ChatThinking thinking={"Plan:\n1. Inspect the failing test\n2. Fix the assertion\n3. Re-run the suite"} duration={4} />
      <ChatThinking thinking="Still gathering context from the codebase…" streaming />
    </>
  );
}
```
