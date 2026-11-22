<!-- Generated from docs/pages/chat/agent-panel.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/chat/agent-panel -->

# AgentPanel

Full chat. The library calls `endpoint` and reads the SSE stream. Use [AgentChatbox](/chat/agent-chatbox) when the app must own send, resume, and stop. Reply text is `text-base`.

## API

`endpoint` is the only required prop. A string is POSTed `{ messages }`. A function receives `{ messages, signal }` and returns the SSE `Response`.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `endpoint` | Stream URL, or a function that returns an SSE `Response`. | `string` \| `(req) => Promise<Response>` | — |
| `title` | Panel title. Welcome uses this when `name` is omitted. | `string` | `"Assistant"` |
| `name` | Welcome name. | `string` | `title` |
| `description` | Welcome description. | `string` | — |
| `avatar` | Welcome face. Any node. Omit it and the welcome shows the first letter of the name. | `ReactNode` | name initial |
| `starters` | Welcome prompts. A click sends that text. | `string[]` | — |
| `placeholder` | Composer placeholder. | `string` | `"Message…"` |
| `initialMessages` | Thread already on screen. | `AgentMessage[]` | — |
| `extraBody` | Extra JSON merged into the POST body. String `endpoint` only. | `object` \| `() => object` | — |
| `headers` | Extra request headers. String `endpoint` only. | `Record<string, string>` | — |
| `fetcher` | `fetch` implementation. | `typeof fetch` | `fetch` |
| `toolbar` | Node left of the composer. | `ReactNode` | — |
| `accessory` | Node above the composer. The demo puts `BackgroundTasksBar` here. | `ReactNode` | — |
| `emptyState` | Replaces the welcome screen when the thread is empty. | `ReactNode` | — |
| `toolUis` | Custom tool cards by `toolName`. Unmatched tools use `ChatToolCall`. | `AgentToolUI[]` | — |
| `toolHooks` | `onCall` / `onResult` for matching tool names. | `AgentToolHook[]` | — |
| `scrollbar` | Overlay scrollbar. | `"hover"` \| `"always"` | `"hover"` |
| `onGeneratingChange` | Fires when a turn starts or ends. | `(generating: boolean) => void` | — |
| `className` | Class on the panel root. | `string` | — |
