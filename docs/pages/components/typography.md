---
path: "/components/typography"
title: "Typography"
group: "General"
groupOrder: 3
order: 3
icon: "text-edit-style-24"
---

# Typography

Headings, paragraphs, and inline text.

```live-react
import { Typography } from "devnonla-ui";

const { Title, Paragraph, Text, Link } = Typography;

export default function Demo() {
  return (
    <div className="flex w-full flex-col items-start gap-2 text-left">
      <Title>h1. Nonla</Title>
      <Title level={2}>h2. Nonla</Title>
      <Title level={3}>h3. Nonla</Title>
      <Paragraph>Nonla UI is a small set of React controls for headings, body copy, and inline text.</Paragraph>
      <Paragraph type="secondary">Secondary copy sits quieter, for a note under a heading.</Paragraph>
      <Text>Default</Text>
      <Text type="success">Success</Text>
      <Text type="warning">Warning</Text>
      <Text type="danger">Danger</Text>
      <Text code>code</Text>
      <Text strong>Strong</Text>
      <Link href="https://nonlaagents.com" target="_blank">nonlaagents.com</Link>
    </div>
  );
}
```

## API

`Typography` is a `div` wrapper. `Title`, `Paragraph`, `Text`, and `Link` share the same decorations.

### Shared decorations

Used by `Typography.Title`, `Typography.Paragraph`, `Typography.Text`, and `Typography.Link`.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `type` | Text color tone. | `secondary` \| `success` \| `warning` \| `danger` | `-` |
| `disabled` | Muted look. On `Link`, drops `href` and blocks clicks. | `boolean` | `false` |
| `mark` | Highlight with a mark. | `boolean` | `false` |
| `code` | Wrap in inline code. | `boolean` | `false` |
| `keyboard` | Wrap in a keyboard key. | `boolean` | `false` |
| `underline` | Underline. | `boolean` | `false` |
| `delete` | Strikethrough. | `boolean` | `false` |
| `strong` | Semibold weight. | `boolean` | `false` |
| `italic` | Italic. | `boolean` | `false` |

### Typography.Title

Renders `h1`–`h5`. Uses the shared decorations.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `level` | Heading level. Maps to `h1`–`h5`. | `1` \| `2` \| `3` \| `4` \| `5` | `1` |

### Typography.Paragraph

Renders a `p`. Uses the shared decorations.

### Typography.Text

Renders a `span`. Uses the shared decorations.

### Typography.Link

Renders an `a`. Uses the shared decorations.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `href` | Anchor href. Dropped when `disabled`. | `string` | `-` |
| `target` | Native target. | `string` | `-` |
| `rel` | Native rel. When `target` is `_blank` and `rel` is omitted, uses `noreferrer noopener`. | `string` | `-` |
