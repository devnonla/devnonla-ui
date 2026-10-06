---
path: "/components/markdown-viewer"
title: "MarkdownViewer"
group: "Data Entry"
groupOrder: 5
order: 4
icon: "document-text-24"
---

# MarkdownViewer

Xem markdown đã viết. Chỉ đọc: heading, list, bảng, code, mermaid, và khối live-react chạy trong sandbox. Agent reply cũng dùng view này.

```live-react
import { MarkdownViewer } from "devnonla-ui";

const sample = "# Ghi chú\n\nMột đoạn có **chữ đậm**, *nghiêng*, và \`inline code\`.\n\n- Đi một vòng\n- Ghi lại chỗ nắng";

export default function Demo() {
  return <MarkdownViewer value={sample} className="w-full text-left" />;
}
```
