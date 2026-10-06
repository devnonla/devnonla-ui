---
path: "/chat"
title: "Overview"
group: "Chat"
groupOrder: 2
order: 1
icon: "chat-24"
---

# Chat

AgentPanel is the full chat surface. Primitives stay exported for custom layouts.

Attach an SSE endpoint and send. `endpoint` can also be a function that returns a `Response` (tests, mocks). Model / tools UI is a custom node on `toolbar` (left of the composer). Extra tool cards: `toolUis` matched by stream `toolName`. `toolHooks` run `onCall` / `onResult` for those names. POST body: `{ messages }`.

```tsx
import { AgentPanel } from "devnonla-ui";

<AgentPanel
  endpoint="/api/agents/abc/assistant/stream"
  title="Nova"
  toolbar={<ModelPicker />}
  toolUis={[{ name: "get_calendar_events", component: CalendarToolUI }]}
  toolHooks={[{ name: "web_fetch", onCall, onResult }]}
/>
```

Stream events: `text-delta` · `thinking-delta` · `tool-call` · `tool-result` · `done` · `error`.

Live mock: [AgentPanel](/chat/agent-panel). Building blocks: Welcome, User / Agent message, Thinking, Tool call, Builtin tools, Input.
