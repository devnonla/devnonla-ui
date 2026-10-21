---
path: "/components/typography"
title: "Typography"
group: "General"
groupOrder: 3
order: 3
icon: "text-edit-style-24"
---

# Typography

Headings, paragraphs, and inline text. Same scale as MarkdownViewer.

```live-react
import { Typography } from "devnonla-ui";

const { Title, Paragraph, Text, Link } = Typography;

export default function Demo() {
  return (
    <div className="w-full text-left">
      <Title>h1. Nonla</Title>
      <Title level={2}>h2. Nonla</Title>
      <Title level={3}>h3. Nonla</Title>
      <Paragraph>Nonla UI is a small set of React controls for headings, body copy, and inline text. A <Text strong>strong</Text> word and <Text code>code</Text> sit in the line, with a <Link href="https://nonlaagents.com" target="_blank">link</Link>.</Paragraph>
      <Paragraph type="secondary">Secondary copy sits quieter, for a note under a heading.</Paragraph>
      <div className="mt-3 flex flex-col items-start gap-2">
        <Text>Default</Text>
        <Text disabled>Disabled</Text>
        <Text type="success">Success</Text>
        <Text type="warning">Warning</Text>
        <Text type="danger">Danger</Text>
      </div>
    </div>
  );
}
```

## API

Title, Paragraph, Text, and Link share the decorations below.

### Shared decorations

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `type` | Text color. Secondary sits quieter than the body. | `secondary` \| `success` \| `warning` \| `danger` | `-` |
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
| `href` | Anchor href. Dropped when `disabled`. | `string` | `-` |
| `target` | Native target. | `string` | `-` |
| `rel` | Native rel. When `target` is `_blank` and `rel` is omitted, uses `noreferrer noopener`. | `string` | `-` |
