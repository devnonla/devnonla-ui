<!-- Generated from docs/pages/chat/input.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/chat/input -->

# Input

Composer at the bottom of AgentPanel and AgentChatbox. Import `ChatInput` when you build the thread yourself. `toolbar` sits left of the field.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `onSend` | Fires with the message text on Enter or the send button | `(text: string) => void` | — |
| `generating` | A turn is running. Locks the composer and shows Stop | `boolean` | `false` |
| `onCancel` | Fires when Stop is pressed | `() => void` | — |
| `placeholder` | Composer placeholder | `string` | `"Message…"` |
| `triggers` | Markers that open a menu, such as `/` for commands and `@` for mentions | `ChatTrigger[]` | `[]` |
| `inputRef` | Imperative handle, such as `insertChip` from a text selection | `Ref<ChatInputHandle>` | — |
| `toolbar` | Node left of the send button, such as a model picker | `ReactNode` | — |
| `onClear` | Shows a clear button that starts a new chat | `() => void` | — |
| `disabled` | Locks the composer and dims it | `boolean` | `false` |
| `defaultValue` | Initial text | `string` | `""` |
| `autoFocus` | Focuses the composer on mount | `boolean` | `false` |
| `focusSignal` | Clears and focuses the composer when it changes, such as a conversation id | `string \| null` | — |
| `enableTypeToFocus` | Sends bare keypresses here when focus is elsewhere | `boolean` | `false` |
| `className` | Class on the composer root | `string` | — |
