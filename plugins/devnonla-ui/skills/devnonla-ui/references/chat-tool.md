<!-- Generated from docs/pages/chat/tool.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/chat/tool -->

# Tool call

Generic tool card: input, output, running, error. AgentPanel and AgentChatbox use `ChatToolCall` for every tool that no `toolUis` entry matches.

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
