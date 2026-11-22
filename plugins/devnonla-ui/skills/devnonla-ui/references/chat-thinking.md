<!-- Generated from docs/pages/chat/thinking.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/chat/thinking -->

# Thinking

Collapsible reasoning. AgentPanel and AgentChatbox show `ChatThinking` inside the agent message while the model is reasoning, and after it finishes.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `thinking` | Reasoning text. Empty renders nothing | `string` | — |
| `streaming` | Still thinking. The label shimmers and counts seconds | `boolean` | `false` |
| `duration` | Final duration in seconds, shown when not streaming | `number` | `0` |
| `className` | Class on the root | `string` | — |
