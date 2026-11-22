<!-- Generated from docs/pages/chat/welcome.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/chat/welcome -->

# Welcome

Empty thread inside AgentPanel and AgentChatbox: name, description, starter prompts. Import `ChatWelcome` only for a custom layout.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `name` | Name in the greeting, "Hi, I'm {name}" | `string` | — |
| `description` | Line under the greeting. Empty shows a generic prompt | `string \| null` | — |
| `avatar` | Avatar node, such as an image or initials | `ReactNode` | name initial |
| `starters` | Prompt buttons. Shown only with `onStarter` | `string[]` | three generic prompts |
| `onStarter` | Fires with the clicked starter text | `(text: string) => void` | — |
| `disabled` | Disables the starter buttons | `boolean` | `false` |
| `className` | Class on the root | `string` | — |
