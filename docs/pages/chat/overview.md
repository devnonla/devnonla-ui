---
path: "/chat"
title: "Overview"
group: "Chat"
groupOrder: 2
order: 1
icon: "chat-24"
---

# Chat

Two surfaces, then the pieces they already compose. Import a piece only when you build a custom thread.

## Surfaces

**AgentPanel** — the library sends the request. Pass `endpoint`: a URL, or a function that returns an SSE `Response`. It POSTs `{ messages }`. Use this when the agent API is a stream endpoint.

**AgentChatbox** — the app sends the request. Pass `send` (returns an SSE `Response`). Optional `resume` reattaches a live stream on mount. Optional `onStop` tells the app the user pressed Stop. Use this when the app owns history, auth, or cancel.

Same screen either way: welcome when empty, then the message list, then the composer.

```tsx
import { AgentChatbox, AgentPanel } from "devnonla-ui";

<AgentPanel endpoint="/api/agents/abc/assistant/stream" title="Nova" toolbar={<ModelPicker />} />

<AgentChatbox send={({ text, signal }) => postTurn(text, signal)} title="Nova" />
```

`toolbar` sits left of the composer. `toolUis` adds a card for a stream `toolName` (checked before builtins). `toolHooks` runs `onCall` / `onResult` for matching names.

Stream events: `text-delta` · `thinking-delta` · `tool-call` · `tool-result` · `done` · `error`.

## Pieces

These are the rows inside a surface. A custom layout imports them directly.

| Piece | Job |
| --- | --- |
| `ChatWelcome` | Empty thread: name, description, starter prompts |
| `ChatUserMessage` | One user bubble |
| `ChatAgentMessage` | One assistant reply. Body is `MarkdownViewer` `variant="chat"` |
| `ChatMarkdown` | That same body, when a row needs markdown on its own |
| `ChatThinking` | Collapsible reasoning, usually inside the agent message |
| `ChatError` | Error row |
| `ChatInput` | Composer: type, send, stop |
| `AgentAvatar` | Face on the welcome screen. Pass as `avatar` |

## Tool cards

A tool row resolves in this order: your `toolUis`, then builtins, then `ChatToolCall`.

Builtins: `web_fetch`, `get_current_time`, `read_skill`, `run_js`, `call_agent__*`, plus a background-task card when the result is a task ref. `BackgroundTasksBar` lists tasks that are still running.

## Owning the thread

`useAgentStream` is the hook inside AgentPanel (`endpoint`). `useAgentChatStream` is the hook inside AgentChatbox (`send` / `resume` / `onStop`). Pair a hook with the pieces above when the panel layout does not fit.
