<!-- Generated from docs/pages/components/typography.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/typography -->

# Typography

Headings, paragraphs, and inline text. Same scale as MarkdownViewer.

## API

Title, Paragraph, Text, and Link share the decorations below.

### Shared decorations

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `type` | Text color. Secondary sits quieter than the body. | `secondary` \| `success` \| `warning` \| `danger` | — |
| `disabled` | Quieter still. On a link, drops `href` and blocks clicks. | `boolean` | `false` |
| `mark` | Highlight with a mark. | `boolean` | `false` |
| `code` | Wrap in inline code. | `boolean` | `false` |
| `keyboard` | Wrap in a keyboard key. | `boolean` | `false` |
| `underline` | Underline. | `boolean` | `false` |
| `delete` | Strikethrough. | `boolean` | `false` |
| `strong` | Semibold weight. | `boolean` | `false` |
| `italic` | Italic. | `boolean` | `false` |

### Typography.Title

Renders a heading, from h1 to h6. Uses the shared decorations.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `level` | Heading level. Same sizes as MarkdownViewer. | `1`–`6` | `1` |

### Typography.Paragraph

Renders a paragraph. Uses the shared decorations.

### Typography.Text

Renders inline text. Uses the shared decorations.

### Typography.Link

Renders a link. Uses the shared decorations.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `href` | Anchor href. Dropped when `disabled`. | `string` | — |
| `target` | Native target. | `string` | — |
| `rel` | Native rel. When `target` is `_blank` and `rel` is omitted, uses `noreferrer noopener`. | `string` | — |
