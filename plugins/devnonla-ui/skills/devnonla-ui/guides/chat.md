# Chat (`devnonla-ui/chat`)

Render inside `<App>`. The server answers with an [AG-UI](https://docs.ag-ui.com/concepts/events) SSE stream; `RUN_FINISHED` ends a turn, `RUN_ERROR` shows an error.

## Which surface

| Case | Use | Key props |
|---|---|---|
| Library calls the API | `AgentPanel` | `endpoint` (URL POSTed `{ messages }`, or `(req) => Response`), `headers`, `extraBody`, `fetcher` |
| App owns send, history, auth, cancel | `AgentChatbox` | `send({ text, signal })` → SSE `Response`, `resume({ signal })` → `Response \| null`, `onStop`, `initialMessages` (remount to switch thread) |
| Custom layout | `useAgentStream` / `useAgentChatStream` + pieces | `ChatWelcome`, `ChatUserMessage`, `ChatAgentMessage`, `ChatThinking`, `ChatToolCall`, `ChatError`, `ChatInput` |

## Shared props

| Prop | Use for |
|---|---|
| `title`, `name`, `description`, `avatar`, `starters`, `placeholder` | Welcome screen and composer |
| `toolbar` | Node left of Send (model picker, attach) |
| `triggers` | `[{ trigger: "/", menu }, { trigger: "@", menu, color }]`; inside the menu use `useChatSuggest`, `ChatSuggestOption` |
| `inputRef` | `ChatInputHandle` (`insertChip` to add context) |
| `toolUis` | Custom tool cards (below) |
| `toolHooks` | `[{ name?, onCall, onResult }]` side effects, no UI |
| `components` | Fence language → component in replies (`{ step: StepBlock }`, gets `code`, `lang`, `streaming`) |
| `accessory` | Node above the composer, e.g. `BackgroundTasksBar` |
| `emptyState`, `onGeneratingChange`, `scrollbar` | Replace welcome, track streaming, scrollbar mode |

## Tool cards

| Case | How |
|---|---|
| No card registered | Generic `ChatToolCall` (name, input, output, running, error) |
| One tool | `{ name: "get_weather", component: WeatherCard }` |
| Aliases | `{ name: ["search", "web_search"], component }` |
| Pattern | `{ name: (n) => n.startsWith("db_"), component }` |
| Card props | `msg` (`toolName`, `toolInput`, `toolOutput`, `toolError`, `toolCallId`), `generating`; `isToolRunning(msg, generating)` |
| Background task result | Built-in task card; list running ones with `BackgroundTasksBar` in `accessory` |

## Don'ts

| Don't | Instead |
|---|---|
| Parse SSE yourself | Return the `Response` from `endpoint` / `send` |
| Import chat from `devnonla-ui` | `devnonla-ui/chat` |
| Custom colors in tool cards | Compose `Card`, `Tag`, `CodeBlock`, status tokens |

API of each chat piece: `references/chat-*.md` (listed in SKILL.md).
