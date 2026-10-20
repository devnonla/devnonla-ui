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
