<!-- Generated from docs/pages/chat/agent.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/chat/agent -->

# Agent message

One assistant reply. The body is `MarkdownViewer`. AgentPanel and AgentChatbox render this for assistant text.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `content` | Markdown body, rendered with `MarkdownViewer` | `string` | — |
| `thinking` | Reasoning text shown in a collapsed `ChatThinking` above the body | `string` | — |
| `thinkingDuration` | Thinking time in seconds | `number` | `0` |
| `thinkingStreaming` | Thinking is still streaming. Shows a live timer | `boolean` | `false` |
| `streaming` | `content` is still streaming | `boolean` | `false` |
| `components` | Fence language to component for `content` | `MarkdownComponents` | — |
| `children` | Custom row content. Replaces `content` when set | `ReactNode` | — |
| `className` | Class on the message row | `string` | — |
