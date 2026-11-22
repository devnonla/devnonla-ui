<!-- Generated from docs/pages/components/message.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/message -->

# Message

Display global messages as feedback in response to user operations.

## API

`message.success`, `error`, `info`, `warning` and `loading` take `(content, duration?, onClose?)` or a config object. `message.open(config)` shows one directly and `message.destroy(key?)` closes one or all. Each call returns a function that closes that message.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `content` | Message text | `ReactNode` | — |
| `type` | Icon and tone. Overrides the method's type. | `success` \| `error` \| `info` \| `warning` \| `loading` | `info` |
| `duration` | Seconds before it closes. `0` keeps it open. | `number` | `3`, `0` for `loading` |
| `key` | Id. Reusing it replaces the open message. | `string` \| `number` | — |
| `icon` | Replaces the type icon | `ReactNode` | — |
| `onClose` | Fires after the message closes | `() => void` | — |
| `onClick` | Fires when the message is clicked | `() => void` | — |
| `className` | Extra class on the message | `string` | — |
| `style` | Inline style on the message | `CSSProperties` | — |
