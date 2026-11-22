<!-- Generated from docs/pages/chat/agent-chatbox.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/chat/agent-chatbox -->

# AgentChatbox

Same screen as [AgentPanel](/chat/agent-panel). The app supplies `send`, and optionally `resume` and `onStop`. Use AgentPanel when a URL or fetch function is enough.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `send` | Posts the new user text and returns the SSE `Response` | `({ text, signal }) => Promise<Response>` | — |
| `resume` | Reattaches a live stream on mount. Return `null` when idle | `({ signal }) => Promise<Response \| null>` | — |
| `onStop` | Fires after Stop aborts the stream, to cancel server generation | `() => void \| Promise<void>` | — |
| `initialMessages` | Thread already on screen. Read on mount only | `AgentMessage[]` | — |
| `title` | Welcome name when `name` is omitted | `string` | `"Assistant"` |
| `name` | Welcome name | `string` | `title` |
| `description` | Welcome description | `string` | — |
| `avatar` | Welcome face. Any node. Omit it for the first letter of the name | `ReactNode` | name initial |
| `starters` | Welcome prompts. A click sends that text | `string[]` | — |
| `placeholder` | Composer placeholder | `string` | `"Message…"` |
| `toolbar` | Node left of the composer | `ReactNode` | — |
| `accessory` | Node above the composer. The demo puts `BackgroundTasksBar` here | `ReactNode` | — |
| `emptyState` | Replaces the welcome screen when the thread is empty | `ReactNode` | — |
| `triggers` | Markers that open a composer menu, such as `/` and `@` | `ChatTrigger[]` | — |
| `inputRef` | Composer handle, such as `insertChip` to add context | `Ref<ChatInputHandle>` | — |
| `toolUis` | Custom tool cards by `toolName`. Unmatched tools use `ChatToolCall` | `AgentToolUI[]` | — |
| `toolHooks` | `onCall` / `onResult` for matching tool names | `AgentToolHook[]` | — |
| `components` | Fence language to component for assistant markdown | `MarkdownComponents` | — |
| `onGeneratingChange` | Fires when a turn starts or ends | `(generating: boolean) => void` | — |
| `scrollbar` | Overlay scrollbar | `"hover" \| "always"` | `"hover"` |
| `className` | Class on the chatbox root | `string` | — |
