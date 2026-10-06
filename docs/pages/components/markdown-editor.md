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

Click từng block để sửa. Diff so bản gốc với bản hiện tại. Bài chỉ để đọc dùng MarkdownViewer.

```live-react
import { useState } from "react";
import { MarkdownEditor } from "devnonla-ui";

const original = "# Notes\n\nPreview renders the document.\n\n- Lists stay markdown\n- Code blocks open as source";

export default function Demo() {
  const [value, setValue] = useState(original + "\n\nEdited in the live block.");
  return <MarkdownEditor className="h-[28rem] w-full" title="notes.md" value={value} onChange={setValue} original={original} />;
}
```
