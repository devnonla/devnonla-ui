---
path: "/components/markdown-editor"
title: "MarkdownEditor"
group: "Data Entry"
groupOrder: 5
order: 3
icon: "text-edit-style-24"
wide: true
---

# MarkdownEditor

Click từng block để sửa. Diff so bản gốc với bản hiện tại. Chỉ cần inline edit thì `showModes={false}`. Bài chỉ để đọc dùng MarkdownViewer.

```live-react
import { useState } from "react";
import { MarkdownEditor } from "devnonla-ui/markdown";

const original = [
  "# Sprint notes",
  "",
  "Ship the **checkout** path before Friday. Keep the recap short.",
  "",
  "## Checklist",
  "",
  "- Review payment retries",
  "- Nested detail still edits in place",
  "  - Confirm idempotency key",
  "  - Watch p95 after deploy",
  "- Leave a note for on-call",
  "",
  "1. Draft the release blurb",
  "2. Ping design for the empty state",
  "3. Tag the build",
  "",
  "- [ ] Write rollback steps",
  "- [x] Link the dashboard",
  "",
  "> Hold the feature flag until support has the FAQ.",
  "",
  "Inline `sku_id` stays monospace. Links like [status](https://example.com) open outside.",
  "",
  "```ts",
  "export function ready(flag: boolean) {",
  "  return flag ? \"go\" : \"wait\";",
  "}",
  "```",
  "",
  "Final line after the fence.",
].join("\n");

const modified = [
  "# Sprint notes",
  "",
  "Ship the **checkout** path before Friday. Keep the recap short.",
  "",
  "## Checklist",
  "",
  "- Review payment retries",
  "- Nested detail still edits in place",
  "  - Confirm idempotency key",
  "  - Watch p95 after deploy",
  "- Leave a note for on-call",
  "",
  "1. Draft the release blurb",
  "2. Ping design for the empty state",
  "3. Tag the build",
  "",
  "- [x] Write rollback steps",
  "- [x] Link the dashboard",
  "",
  "> Hold the feature flag until support has the FAQ.",
  "",
  "Inline `sku_id` stays monospace. Links like [status](https://example.com) open outside.",
  "",
  "```ts",
  "export function ready(flag: boolean) {",
  "  return flag ? \"go\" : \"wait\";",
  "}",
  "```",
  "",
  "Final line after the fence — edited in preview.",
].join("\n");

export default function Demo() {
  const [value, setValue] = useState(modified);
  return <MarkdownEditor className="h-[36rem] w-full" title="sprint-notes.md" value={value} onChange={setValue} original={original} />;
}
```

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `value` | Current markdown. In diff mode this is the modified version. | `string` | — |
| `defaultValue` | Initial markdown, for an uncontrolled editor | `string` | `""` |
| `onChange` | Fires with the new markdown after an edit | `(value: string) => void` | — |
| `original` | Earlier version. Enables the Diff view. | `string` | — |
| `title` | Header label, such as a filename | `ReactNode` | — |
| `mode` | Current view, for a controlled editor | `preview` \| `edit` \| `diff` | — |
| `defaultMode` | Initial view | `preview` \| `edit` \| `diff` | `preview` |
| `showModes` | Show the Preview / Edit / Diff switch. Hidden when `readOnly`. | `boolean` | `true` |
| `readOnly` | Lock editing and hide the mode switch | `boolean` | `false` |
| `placeholder` | Text shown when the document is empty | `string` | `"Write markdown…"` |
| `components` | Components for fenced blocks, keyed by language. They stay view only. | `Record<string, ComponentType>` | — |
| `diffLayout` | Diff layout, for a controlled editor | `side-by-side` \| `inline` | — |
| `defaultDiffLayout` | Initial diff layout | `side-by-side` \| `inline` | `side-by-side` |
| `originalLabel` | Label for the original side of the diff | `ReactNode` | `"Original"` |
| `modifiedLabel` | Label for the modified side of the diff | `ReactNode` | `"Modified"` |
| `onModeChange` | Fires when the view changes | `(mode) => void` | — |
| `onDiffLayoutChange` | Fires when the diff layout changes | `(layout) => void` | — |
| `className` | Extra class on the root | `string` | — |
| `style` | Inline style on the root | `CSSProperties` | — |
